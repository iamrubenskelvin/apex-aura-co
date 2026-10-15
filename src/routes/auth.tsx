import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso administrativo — Forja Nutri" },
      { name: "description", content: "Entre no painel administrativo da Forja Nutri." },
      { property: "og:title", content: "Acesso administrativo — Forja Nutri" },
      { property: "og:description", content: "Entre no painel administrativo da Forja Nutri." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/admin" });
        else setSent(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro";
      toast.error(msg.includes("Invalid login") ? "E-mail ou senha incorretos." : msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-7">
        <Link to="/" className="text-display text-xl">
          Forja<span className="text-primary">Nutri</span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold">
          {mode === "entrar" ? "Painel administrativo" : "Criar acesso"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "entrar"
            ? "Entre com seu e-mail e senha."
            : "A primeira conta criada vira a conta de administrador."}
        </p>

        {sent ? (
          <p className="mt-6 rounded-xl bg-surface-2 p-4 text-sm">
            Enviamos um link de confirmação para <strong>{email}</strong>. Confirme e depois entre.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">E-mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">Senha</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              />
            </label>
            <button
              disabled={busy}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
            >
              {busy ? "Aguarde…" : mode === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        )}

        <button
          onClick={() => {
            setMode(mode === "entrar" ? "criar" : "entrar");
            setSent(false);
          }}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "entrar" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
        </button>
      </div>
    </main>
  );
}
