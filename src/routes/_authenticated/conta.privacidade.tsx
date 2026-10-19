import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate, inputCls, Panel } from "@/components/account/shared";

export const Route = createFileRoute("/_authenticated/conta/privacidade")({ component: Page });

function Page() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const q = useQuery({
    queryKey: ["privacy", user.id],
    queryFn: async () => {
      const [{ data: profile }, { data: req }] = await Promise.all([
        supabase.from("profiles").select("email_notifications").eq("id", user.id).maybeSingle(),
        supabase.from("account_deletion_requests").select("*").eq("user_id", user.id).eq("status", "pendente").maybeSingle(),
      ]);
      return { notify: profile?.email_notifications ?? true, request: req };
    },
  });

  async function toggleNotify(v: boolean) {
    const { error } = await supabase.from("profiles").update({ email_notifications: v }).eq("id", user.id);
    if (error) return toast.error("Não foi possível salvar.");
    qc.invalidateQueries({ queryKey: ["privacy", user.id] });
  }

  async function requestDeletion(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from("account_deletion_requests")
      .insert({ user_id: user.id, email: user.email ?? "", reason: reason.trim().slice(0, 500) });
    if (error) return toast.error("Não foi possível registrar o pedido.");
    toast.success("Pedido de exclusão registrado.");
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <>
      <Panel title="Notificações">
        <label className="flex items-center justify-between gap-4 text-sm">
          <span>
            <span className="block font-medium">Atualizações de pedidos por e-mail</span>
            <span className="text-muted-foreground">Aprovação, envio com código de rastreio e entrega.</span>
          </span>
          <input
            type="checkbox"
            className="h-5 w-5 accent-[var(--primary)]"
            checked={q.data?.notify ?? true}
            onChange={(e) => toggleNotify(e.target.checked)}
          />
        </label>
      </Panel>

      <Panel title="Excluir minha conta">
        {q.data?.request ? (
          <p className="text-sm text-muted-foreground">
            Pedido de exclusão registrado em {fmtDate(q.data.request.created_at)}. Vamos concluir em até 15 dias.
          </p>
        ) : (
          <form onSubmit={requestDeletion} className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Conforme a LGPD, apagamos seus dados pessoais, endereços, favoritos e acesso à conta. Pedidos já feitos
              ficam guardados sem seus dados pessoais, porque a lei fiscal exige. Suas avaliações continuam
              publicadas como “Cliente”.
            </p>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo (opcional)" aria-label="Motivo" rows={2} className={inputCls} />
            <label className="block">
              <span className="mb-1 block text-muted-foreground">Digite EXCLUIR para confirmar</span>
              <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className={inputCls} />
            </label>
            <button
              disabled={confirmText.trim().toUpperCase() !== "EXCLUIR"}
              className="rounded-xl bg-destructive px-5 py-2.5 font-semibold text-destructive-foreground disabled:opacity-50"
            >
              Solicitar exclusão
            </button>
          </form>
        )}
      </Panel>
    </>
  );
}
