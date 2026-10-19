import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { brl } from "@/data/products";
import { useCart } from "@/components/site/cart";
import { createOrder } from "@/lib/orders.functions";
import { couponDiscount, couponProblem, orderTotals } from "@/lib/pricing";
import { inputCls, Panel } from "@/components/account/shared";
import { AddressForm, formatAddress } from "@/components/account/AddressForm";
import { useAddresses } from "./conta.enderecos";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar compra — Forja Nutri" },
      { name: "description", content: "Confira endereço, pagamento e cupom para concluir seu pedido." },
      { property: "og:title", content: "Finalizar compra — Forja Nutri" },
      { property: "og:description", content: "Confira endereço, pagamento e cupom para concluir seu pedido." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

type Coupon = { code: string; discount_type: string; value: number; min_subtotal: number; first_purchase_only: boolean; max_uses_per_user: number; expires_at: string | null; active: boolean };

function Checkout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const { lines, subtotal, remove } = useCart();
  const addresses = useAddresses(user.id);
  const placeOrder = useServerFn(createOrder);
  const [addressId, setAddressId] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [payment, setPayment] = useState<"pix" | "cartao" | "boleto">("pix");
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [busy, setBusy] = useState(false);

  const history = useQuery({
    queryKey: ["checkout-history", user.id],
    queryFn: async () => (await supabase.from("orders").select("coupon_code, status").eq("user_id", user.id)).data ?? [],
  });

  useEffect(() => {
    if (!addressId && addresses.data?.length) setAddressId(addresses.data[0]!.id);
  }, [addresses.data, addressId]);

  const disc = coupon ? couponDiscount(coupon, subtotal) : 0;
  const totals = useMemo(() => orderTotals({ subtotal, couponDiscount: disc, payment }), [subtotal, disc, payment]);

  async function applyCoupon() {
    const c = code.trim().toUpperCase();
    if (!c) return;
    const { data } = await supabase.from("coupons").select("*").eq("code", c).maybeSingle();
    if (!data) return toast.error("Cupom não encontrado.");
    const valid = (history.data ?? []).filter((o) => o.status !== "cancelado");
    const problem = couponProblem(data, {
      subtotal,
      previousOrders: valid.length,
      usesOfThisCoupon: valid.filter((o) => o.coupon_code === data.code).length,
    });
    if (problem) return toast.error(problem);
    setCoupon(data);
    toast.success("Cupom aplicado!");
  }

  async function submit() {
    if (!addressId) return toast.error("Escolha um endereço de entrega.");
    setBusy(true);
    try {
      const res = await placeOrder({
        data: {
          items: lines.map((l) => ({ productId: l.productId, qty: l.qty, price: l.price, variant: l.variant })),
          addressId,
          payment,
          coupon: coupon?.code,
        },
      });
      lines.forEach((l) => remove(l.id));
      toast.success(`Pedido #${res.number} recebido!`);
      navigate({ to: "/conta/pedidos/$id", params: { id: res.id }, replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível concluir o pedido.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
        <h1 className="text-display text-3xl">Finalizar compra</h1>
        {lines.length === 0 ? (
          <p className="mt-6 text-muted-foreground">
            Seu carrinho está vazio. <Link to="/produtos" search={{}} className="text-primary">Ver produtos</Link>
          </p>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <Panel title="Endereço de entrega" action={!adding && <button onClick={() => setAdding(true)} className="text-sm text-primary">+ Novo</button>}>
                {adding || (!addresses.isLoading && !addresses.data?.length) ? (
                  <AddressForm
                    userId={user.id}
                    makeDefault={!addresses.data?.length}
                    onDone={async (id) => {
                      setAdding(false);
                      await addresses.refetch();
                      setAddressId(id);
                    }}
                    {...(addresses.data?.length ? { onCancel: () => setAdding(false) } : {})}
                  />
                ) : (
                  <div className="space-y-2">
                    {addresses.data?.map((a) => (
                      <label key={a.id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm ${addressId === a.id ? "border-primary" : "border-border"}`}>
                        <input type="radio" name="addr" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1 accent-[var(--primary)]" />
                        <span>
                          <span className="font-semibold">{a.label}</span> · {a.recipient}
                          <span className="block text-muted-foreground">{formatAddress(a)}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel title="Pagamento">
                <div className="grid gap-2 sm:grid-cols-3">
                  {([["pix", "PIX", "10% de desconto"], ["cartao", "Cartão", "Até 12x sem juros"], ["boleto", "Boleto", "Vence em 3 dias"]] as const).map(([v, label, hint]) => (
                    <label key={v} className={`cursor-pointer rounded-xl border p-3 text-sm ${payment === v ? "border-primary" : "border-border"}`}>
                      <input type="radio" name="pay" className="sr-only" checked={payment === v} onChange={() => setPayment(v)} />
                      <span className="block font-semibold">{label}</span>
                      <span className="text-xs text-muted-foreground">{hint}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Após o pedido, nossa equipe confirma o pagamento e você acompanha tudo em “Meus pedidos”.
                </p>
              </Panel>
            </div>

            <aside className="h-fit space-y-4 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-28">
              <h2 className="font-bold">Resumo</h2>
              <ul className="space-y-2 text-sm">
                {lines.map((l) => (
                  <li key={l.id} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">{l.qty}× {l.name}</span>
                    <span className="shrink-0">{brl(l.price * l.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Cupom" aria-label="Cupom de desconto" className={inputCls} disabled={!!coupon} />
                {coupon ? (
                  <button onClick={() => { setCoupon(null); setCode(""); }} className="btn-base btn-ghost-outline px-3 text-sm">Remover</button>
                ) : (
                  <button onClick={applyCoupon} className="btn-base btn-ghost-outline px-3 text-sm">Aplicar</button>
                )}
              </div>
              <dl className="space-y-1 border-t border-border pt-3 text-sm">
                <div className="flex justify-between text-muted-foreground"><dt>Subtotal</dt><dd>{brl(totals.subtotal)}</dd></div>
                {totals.discount > 0 && <div className="flex justify-between text-primary"><dt>Descontos</dt><dd>− {brl(totals.discount)}</dd></div>}
                <div className="flex justify-between text-muted-foreground"><dt>Frete</dt><dd>{totals.shipping ? brl(totals.shipping) : "Grátis"}</dd></div>
                <div className="flex justify-between pt-2 text-lg font-bold"><dt>Total</dt><dd>{brl(totals.total)}</dd></div>
              </dl>
              <button disabled={busy || adding} onClick={submit} className="btn-base btn-primary w-full px-6 py-4 text-sm disabled:opacity-60">
                {busy ? "Enviando…" : "Confirmar pedido"}
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
