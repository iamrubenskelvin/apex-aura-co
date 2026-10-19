import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/data/products";
import { useCart } from "@/components/site/cart";
import { couponProblem } from "@/lib/pricing";
import { fmtDate, Panel } from "@/components/account/shared";

export const Route = createFileRoute("/_authenticated/conta/cupons")({ component: Page });

function Page() {
  const { user } = Route.useRouteContext();
  const { subtotal } = useCart();
  const q = useQuery({
    queryKey: ["coupons-account", user.id],
    queryFn: async () => {
      const [{ data: coupons }, { data: orders }] = await Promise.all([
        supabase.from("coupons").select("*").eq("active", true).order("created_at", { ascending: false }),
        supabase.from("orders").select("coupon_code, status").eq("user_id", user.id),
      ]);
      return { coupons: coupons ?? [], orders: (orders ?? []).filter((o) => o.status !== "cancelado") };
    },
  });

  const list = (q.data?.coupons ?? []).filter((c) => !c.expires_at || new Date(c.expires_at) > new Date());

  return (
    <Panel title="Cupons disponíveis">
      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : !list.length ? (
        <p className="text-sm text-muted-foreground">Nenhum cupom disponível no momento.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((c) => {
            const uses = q.data!.orders.filter((o) => o.coupon_code === c.code).length;
            const problem = couponProblem(c, { subtotal, previousOrders: q.data!.orders.length, usesOfThisCoupon: uses });
            const used = uses >= c.max_uses_per_user;
            return (
              <li key={c.code} className={`rounded-xl border border-dashed p-4 ${used ? "border-border opacity-60" : "border-primary/50"}`}>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigator.clipboard?.writeText(c.code).then(() => toast.success("Cupom copiado!"))}
                    className="font-mono text-lg font-bold text-primary"
                    aria-label={`Copiar cupom ${c.code}`}
                  >
                    {c.code}
                  </button>
                  <span className="text-sm font-bold">
                    {c.discount_type === "percent" ? `${Number(c.value)}% OFF` : `${brl(Number(c.value))} OFF`}
                  </span>
                </div>
                {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                  {Number(c.min_subtotal) > 0 && `Mínimo ${brl(Number(c.min_subtotal))} · `}
                  {c.first_purchase_only && "Primeira compra · "}
                  {c.expires_at ? `Válido até ${fmtDate(c.expires_at)}` : "Sem data de validade"}
                </p>
                <p className={`mt-2 text-xs font-semibold ${problem ? "text-muted-foreground" : "text-primary"}`}>
                  {used ? "Já utilizado" : problem ? problem : "Pode ser usado no seu carrinho atual"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
