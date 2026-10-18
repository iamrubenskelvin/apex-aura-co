import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Forja Nutri" },
      { name: "description", content: "Receba um link por e-mail para criar uma nova senha." },
      { property: "og:title", content: "Recuperar senha — Forja Nutri" },
      { property: "og:description", content: "Receba um link por e-mail para criar uma nova senha." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error("Não foi possível enviar agora. Tente de novo em instantes.");
    else setSent(true);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-7">
        <h1 className="text-2xl font-bold">Recuperar senha</h1>
        {sent ? (
          <p className="mt-4 rounded-xl bg-surface-2 p-4 text-sm">
            Se houver uma conta com <strong>{email}</strong>, você vai receber um link para criar uma nova senha.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">Informe o e-mail da sua conta.</p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="E-mail"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
            <button disabled={busy} className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">
              {busy ? "Enviando…" : "Enviar link"}
            </button>
          </form>
        )}
        <Link to="/auth" className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground">
          Voltar para entrar
        </Link>
      </div>
    </main>
  );
}
