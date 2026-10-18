import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveImage } from "@/data/catalog";
import { couponDiscount, couponProblem, orderTotals } from "@/lib/pricing";

type OrderInput = {
  items: { productId: string; qty: number; price: number; variant?: string | undefined }[];
  addressId: string;
  payment: "pix" | "cartao" | "boleto";
  coupon?: string | undefined;
};

function validate(input: unknown): OrderInput {
  const i = input as OrderInput;
  if (!i || !Array.isArray(i.items) || i.items.length === 0 || i.items.length > 50) throw new Error("Carrinho vazio.");
  if (typeof i.addressId !== "string") throw new Error("Escolha um endereço.");
  if (!["pix", "cartao", "boleto"].includes(i.payment)) throw new Error("Forma de pagamento inválida.");
  for (const it of i.items) {
    if (typeof it.productId !== "string" || !Number.isInteger(it.qty) || it.qty < 1 || it.qty > 99)
      throw new Error("Item inválido.");
  }
  return {
    items: i.items.map((it) => ({
      productId: it.productId,
      qty: it.qty,
      price: Number(it.price) || 0,
      variant: typeof it.variant === "string" ? it.variant.slice(0, 120) : undefined,
    })),
    addressId: i.addressId,
    payment: i.payment,
    coupon: typeof i.coupon === "string" && i.coupon.trim() ? i.coupon.trim().toUpperCase().slice(0, 40) : undefined,
  };
}

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validate)
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    const { data: address } = await supabase.from("addresses").select("*").eq("id", data.addressId).maybeSingle();
    if (!address) throw new Error("Endereço não encontrado.");

    const ids = [...new Set(data.items.map((i) => i.productId))];
    const { data: products } = await supabase.from("products").select("*").in("id", ids).eq("status", "ativo");
    const byId = new Map((products ?? []).map((p) => [p.id, p]));

    const lines = data.items.map((it) => {
      const p = byId.get(it.productId);
      if (!p) throw new Error("Um produto do carrinho não está mais disponível.");
      const need = data.items.filter((x) => x.productId === it.productId).reduce((s, x) => s + x.qty, 0);
      if (p.stock < need) throw new Error(`Estoque insuficiente de ${p.name}.`);
      // Nunca cobra abaixo do preço do banco (variações só podem somar).
      const unit = Math.max(Number(p.price), it.price);
      return { product_id: p.id, name: p.name, image: resolveImage(p.image), variant: it.variant ?? null, unit_price: unit, qty: it.qty };
    });
    const subtotal = lines.reduce((s, l) => s + l.unit_price * l.qty, 0);

    let discountFromCoupon = 0;
    let couponCode: string | null = null;
    if (data.coupon) {
      const { data: c } = await supabase.from("coupons").select("*").eq("code", data.coupon).maybeSingle();
      if (!c) throw new Error("Cupom não encontrado.");
      const { count: previousOrders } = await supabase
        .from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId).neq("status", "cancelado");
      const { count: uses } = await supabase
        .from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("coupon_code", c.code).neq("status", "cancelado");
      const problem = couponProblem(c, { subtotal, previousOrders: previousOrders ?? 0, usesOfThisCoupon: uses ?? 0 });
      if (problem) throw new Error(problem);
      discountFromCoupon = couponDiscount(c, subtotal);
      couponCode = c.code;
    }

    const totals = orderTotals({ subtotal, couponDiscount: discountFromCoupon, payment: data.payment });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        customer_email: typeof claims.email === "string" ? claims.email : "",
        payment_method: data.payment,
        coupon_code: couponCode,
        address: {
          label: address.label, recipient: address.recipient, cep: address.cep, street: address.street,
          number: address.number, complement: address.complement, district: address.district,
          city: address.city, state: address.state,
        },
        ...totals,
      })
      .select("id, number")
      .single();
    if (error || !order) throw new Error("Não foi possível registrar o pedido.");

    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(lines.map((l) => ({ ...l, order_id: order.id })));
    if (itemsErr) throw new Error("Não foi possível registrar os itens do pedido.");

    for (const id of ids) {
      const p = byId.get(id)!;
      const qty = lines.filter((l) => l.product_id === id).reduce((s, l) => s + l.qty, 0);
      await supabaseAdmin.from("products").update({ stock: Math.max(0, p.stock - qty), sales: p.sales + qty }).eq("id", id);
    }

    return { id: order.id, number: order.number };
  });

/** Admin: conclui um pedido de exclusão (LGPD) apagando a conta e anonimizando pedidos. */
export const processAccountDeletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { requestId: string }) => {
    if (typeof i?.requestId !== "string") throw new Error("Pedido inválido.");
    return i;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Sem permissão.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: req } = await supabaseAdmin.from("account_deletion_requests").select("*").eq("id", data.requestId).maybeSingle();
    if (!req || req.status !== "pendente") throw new Error("Pedido já processado.");
    const uid = req.user_id;

    // Pedidos ficam guardados por obrigação fiscal, sem dados pessoais.
    await supabaseAdmin.from("orders").update({ customer_email: "", address: { anonimizado: true } }).eq("user_id", uid);
    await supabaseAdmin.from("product_reviews").update({ author_name: "Cliente" }).eq("user_id", uid);
    await supabaseAdmin.from("addresses").delete().eq("user_id", uid);
    await supabaseAdmin.from("wishlist_items").delete().eq("user_id", uid);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (error && !/not found/i.test(error.message)) throw new Error("Não foi possível apagar a conta.");
    await supabaseAdmin
      .from("account_deletion_requests")
      .update({ status: "concluida", processed_at: new Date().toISOString(), email: "" })
      .eq("id", req.id);
    return { ok: true };
  });
