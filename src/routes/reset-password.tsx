import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha — Forja Nutri" },
      { name: "description", content: "Crie uma nova senha para sua conta Forja Nutri." },
      { property: "og:title", content: "Nova senha — Forja Nutri" },
      { property: "og:description", content: "Crie uma nova senha para sua conta Forja Nutri." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setReady(true);
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => s.session && setReady(true));
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return toast.error("As senhas não conferem.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error("Link expirado ou inválido. Peça um novo.");
    toast.success("Senha alterada!");
    navigate({ to: "/conta", replace: true });
  }

  const cls = "w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary";
  return (
    <main className="grid min-h-screen place-items-center bg-background px-5">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-7">
        <h1 className="text-2xl font-bold">Criar nova senha</h1>
        {!ready ? (
          <p className="mt-4 text-sm text-muted-foreground">Abra esta página pelo link enviado ao seu e-mail.</p>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <input type="password" required minLength={6} placeholder="Nova senha" aria-label="Nova senha" value={password} onChange={(e) => setPassword(e.target.value)} className={cls} autoComplete="new-password" />
            <input type="password" required minLength={6} placeholder="Repita a senha" aria-label="Repita a senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={cls} autoComplete="new-password" />
            <button disabled={busy} className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">
              {busy ? "Salvando…" : "Salvar nova senha"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
