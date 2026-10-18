import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/data/products";
import { fmtDate, Panel, StatusPill } from "@/components/account/shared";

export const Route = createFileRoute("/_authenticated/conta/pedidos")({ component: OrdersPage });

function OrdersPage() {
  const matchRoute = useMatchRoute();
  const isDetail = matchRoute({ to: "/conta/pedidos/$id", fuzzy: false });
  const q = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, number, status, total, created_at, order_items(name, qty)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isDetail) return <Outlet />;

  return (
    <Panel title="Meus pedidos">
      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : !q.data?.length ? (
        <div className="text-sm text-muted-foreground">
          Você ainda não fez pedidos.{" "}
          <Link to="/produtos" search={{}} className="text-primary">Ver produtos</Link>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {q.data.map((o) => (
            <li key={o.id}>
              <Link to="/conta/pedidos/$id" params={{ id: o.id }} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4 hover:text-primary">
                <div className="min-w-0">
                  <p className="font-semibold">Pedido #{o.number}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {fmtDate(o.created_at)} · {o.order_items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <StatusPill status={o.status} />
                  <p className="mt-1 text-sm font-bold">{brl(Number(o.total))}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
