import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/data/products";
import { fmtDate, inputCls, paymentLabel, statusLabel, StatusPill } from "@/components/account/shared";

export const Route = createFileRoute("/_authenticated/admin/pedidos")({ component: Page });

function Page() {
  const q = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(name, qty)").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold">Pedidos</h1>
      {q.isLoading ? (
        <p className="mt-4 text-muted-foreground">Carregando…</p>
      ) : !q.data?.length ? (
        <p className="mt-4 text-muted-foreground">Nenhum pedido ainda.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {q.data.map((o) => <OrderRow key={o.id} o={o} />)}
        </ul>
      )}
    </div>
  );
}

type Row = NonNullable<ReturnType<typeof useQuery<unknown>>["data"]> & Record<string, never>;

function OrderRow({ o }: { o: { id: string; number: number; status: string; total: number; created_at: string; customer_email: string; payment_method: string; tracking_code: string | null; tracking_url: string | null; order_items: { name: string; qty: number }[] } }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState(o.status);
  const [code, setCode] = useState(o.tracking_code ?? "");
  const [url, setUrl] = useState(o.tracking_url ?? "");
  async function save() {
    const { error } = await supabase
      .from("orders")
      .update({ status, tracking_code: code.trim() || null, tracking_url: url.trim() || null })
      .eq("id", o.id);
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success(`Pedido #${o.number} atualizado.`);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }
  return (
    <li className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">#{o.number} · {o.customer_email || "cliente removido"}</p>
        <StatusPill status={o.status} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {fmtDate(o.created_at)} · {paymentLabel[o.payment_method]} · {brl(Number(o.total))} · {o.order_items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-[160px_1fr_1fr_auto]">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls} aria-label="Status">
          {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código de rastreio" aria-label="Código de rastreio" className={inputCls} />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link de rastreio" aria-label="Link de rastreio" className={inputCls} />
        <button onClick={save} className="btn-base btn-primary px-4 py-2 text-sm">Salvar</button>
      </div>
    </li>
  );
}
export type { Row };
