import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { processAccountDeletion } from "@/lib/orders.functions";
import { fmtDate } from "@/components/account/shared";

export const Route = createFileRoute("/_authenticated/admin/exclusoes")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const run = useServerFn(processAccountDeletion);
  const q = useQuery({
    queryKey: ["admin-deletions"],
    queryFn: async () => (await supabase.from("account_deletion_requests").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  async function process(id: string) {
    if (!confirm("Apagar definitivamente esta conta e seus dados pessoais?")) return;
    try {
      await run({ data: { requestId: id } });
      toast.success("Conta excluída.");
      qc.invalidateQueries({ queryKey: ["admin-deletions"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    }
  }
  return (
    <div>
      <h1 className="text-2xl font-bold">Exclusões de conta (LGPD)</h1>
      <p className="mt-1 text-sm text-muted-foreground">Conclua cada pedido em até 15 dias. Pedidos de compra ficam guardados sem dados pessoais.</p>
      <ul className="mt-6 space-y-2">
        {q.data?.length ? q.data.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 text-sm">
            <div>
              <p className="font-semibold">{r.email || "—"}</p>
              <p className="text-xs text-muted-foreground">{fmtDate(r.created_at)}{r.reason && ` · ${r.reason}`}</p>
            </div>
            {r.status === "pendente" ? (
              <button onClick={() => process(r.id)} className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground">Excluir dados</button>
            ) : (
              <span className="text-xs text-muted-foreground">Concluída em {fmtDate(r.processed_at)}</span>
            )}
          </li>
        )) : <p className="text-sm text-muted-foreground">Nenhum pedido.</p>}
      </ul>
    </div>
  );
}
