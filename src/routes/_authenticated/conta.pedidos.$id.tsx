import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/data/products";
import { catalogById } from "@/data/catalog";
import { useCart } from "@/components/site/cart";
import { fmtDate, ORDER_STEPS, Panel, paymentLabel, statusLabel, StatusPill } from "@/components/account/shared";

export const Route = createFileRoute("/_authenticated/conta/pedidos/$id")({ component: OrderDetail });

function OrderDetail() {
  const { id } = Route.useParams();
  const { add, setOpen } = useCart();
  const q = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (q.isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  const o = q.data;
  if (!o) return <Panel title="Pedido não encontrado"><Link to="/conta/pedidos" className="text-primary">Voltar</Link></Panel>;

  const stepIdx = ORDER_STEPS.indexOf(o.status as (typeof ORDER_STEPS)[number]);
  const dates: Record<string, string | null> = { recebido: o.created_at, aprovado: o.approved_at, enviado: o.shipped_at, entregue: o.delivered_at };
  const addr = o.address as Record<string, string>;

  function buyAgain() {
    let added = 0;
    for (const it of o!.order_items) {
      const p = catalogById(it.product_id);
      if (!p || p.stock <= 0) continue;
      add({ productId: p.id, name: p.name, image: p.image, price: p.price, qty: it.qty, variant: it.variant ?? undefined, sku: p.sku });
      added++;
    }
    if (added) {
      toast.success("Itens adicionados ao carrinho.");
      setOpen(true);
    } else toast.error("Esses produtos não estão disponíveis agora.");
  }

  return (
    <>
      <Panel title={`Pedido #${o.number}`} action={<StatusPill status={o.status} />}>
        <p className="text-sm text-muted-foreground">Feito em {fmtDate(o.created_at)} · {paymentLabel[o.payment_method] ?? o.payment_method}</p>
        {o.status === "cancelado" ? (
          <p className="mt-4 text-sm text-destructive">Este pedido foi cancelado.</p>
        ) : (
          <ol className="mt-6 grid grid-cols-4 gap-2">
            {ORDER_STEPS.map((s, i) => (
              <li key={s} className="text-center">
                <span className={`mx-auto grid h-8 w-8 place-items-center rounded-full ${i <= stepIdx ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"}`}>
                  {i <= stepIdx ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <p className="mt-2 text-xs font-semibold">{statusLabel[s]}</p>
                <p className="text-[11px] text-muted-foreground">{fmtDate(dates[s] ?? null)}</p>
              </li>
            ))}
          </ol>
        )}
        {o.tracking_code && (
          <div className="mt-6 rounded-xl bg-surface-2 p-4 text-sm">
            <p className="text-muted-foreground">Código de rastreio</p>
            <p className="font-mono font-semibold">{o.tracking_code}</p>
            {o.tracking_url && (
              <a href={o.tracking_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-primary">
                Acompanhar entrega <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </Panel>

      <Panel title="Itens" action={<button onClick={buyAgain} className="btn-base btn-primary px-4 py-2 text-sm">Comprar novamente</button>}>
        <ul className="divide-y divide-border">
          {o.order_items.map((it) => (
            <li key={it.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
              <img src={it.image} alt="" className="h-14 w-14 rounded-lg bg-surface-2 object-contain p-1" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{it.name}</p>
                <p className="text-xs text-muted-foreground">{it.qty}× {brl(Number(it.unit_price))}{it.variant ? ` · ${it.variant}` : ""}</p>
              </div>
              <span className="text-sm font-bold">{brl(Number(it.unit_price) * it.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
          <Row k="Subtotal" v={brl(Number(o.subtotal))} />
          {Number(o.discount) > 0 && <Row k={`Descontos${o.coupon_code ? ` (${o.coupon_code})` : ""}`} v={`− ${brl(Number(o.discount))}`} />}
          <Row k="Frete" v={Number(o.shipping) ? brl(Number(o.shipping)) : "Grátis"} />
          <Row k="Total" v={brl(Number(o.total))} bold />
        </dl>
      </Panel>

      {addr?.["street"] && (
        <Panel title="Entrega">
          <p className="text-sm">{addr["recipient"]}</p>
          <p className="text-sm text-muted-foreground">
            {addr["street"]}, {addr["number"]} {addr["complement"]} · {addr["district"]}, {addr["city"]}/{addr["state"]} · CEP {addr["cep"]}
          </p>
        </Panel>
      )}
    </>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-bold" : "text-muted-foreground"}`}>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
