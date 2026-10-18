import type { ReactNode } from "react";

export const ORDER_STEPS = ["recebido", "aprovado", "enviado", "entregue"] as const;

export const statusLabel: Record<string, string> = {
  recebido: "Recebido",
  aprovado: "Aprovado",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const paymentLabel: Record<string, string> = { pix: "PIX", cartao: "Cartão", boleto: "Boleto" };

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "entregue"
      ? "bg-primary/15 text-primary"
      : status === "cancelado"
        ? "bg-destructive/15 text-destructive"
        : "bg-surface-2 text-foreground";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{statusLabel[status] ?? status}</span>;
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary";

export function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "");

export function isValidCpf(raw: string) {
  const c = raw.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  const calc = (len: number) => {
    let s = 0;
    for (let i = 0; i < len; i++) s += Number(c[i]) * (len + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(c[9]) && calc(10) === Number(c[10]);
}
