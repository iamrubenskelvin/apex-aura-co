import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

type AuthSearch = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => {
    const r = typeof s["redirect"] === "string" ? s["redirect"] : undefined;
    return r && r.startsWith("/") && !r.startsWith("//") ? { redirect: r } : {};
  },
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — Forja Nutri" },
      { name: "description", content: "Acesse sua conta Forja Nutri para acompanhar pedidos, favoritos e cupons." },
      { property: "og:title", content: "Entrar ou criar conta — Forja Nutri" },
      { property: "og:description", content: "Acesse sua conta Forja Nutri para acompanhar pedidos, favoritos e cupons." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const PENDING_KEY = "forja:after-login";

export async function goAfterLogin(navigate: ReturnType<typeof useNavigate>, redirect?: string) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  const stored = typeof window !== "undefined" ? window.sessionStorage.getItem(PENDING_KEY) : null;
  if (stored) window.sessionStorage.removeItem(PENDING_KEY);
  const target = redirect ?? stored ?? (isAdmin ? "/admin" : "/conta");
  navigate({ to: target, replace: true });
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { user } = useSession();
  useEffect(() => {
    if (user) void goAfterLogin(navigate, redirect);
  }, [user, navigate, redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await goAfterLogin(navigate, redirect);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth`, data: { full_name: name.trim() } },
        });
        if (error) throw error;
        if (data.session) await goAfterLogin(navigate, redirect);
        else setSent(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro";
      toast.error(
        msg.includes("Invalid login")
          ? "E-mail ou senha incorretos."
          : msg.includes("already registered")
            ? "Este e-mail já tem conta. Entre ou recupere a senha."
            : msg,
      );
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    if (redirect) window.sessionStorage.setItem(PENDING_KEY, redirect);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    await goAfterLogin(navigate, redirect);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-7">
        <Link to="/" className="text-display text-xl">
          Forja<span className="text-primary">Nutri</span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold">{mode === "entrar" ? "Entrar" : "Criar conta"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "entrar"
            ? "Acompanhe pedidos, favoritos e cupons."
            : "Leva menos de um minuto."}
        </p>

        {sent ? (
          <p className="mt-6 rounded-xl bg-surface-2 p-4 text-sm">
            Enviamos um link de confirmação para <strong>{email}</strong>. Confirme e depois entre.
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={google}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-semibold transition-colors hover:bg-surface-2"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path fill="currentColor" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.68 3.7 14.55 2.75 12 2.75 6.9 2.75 2.75 6.9 2.75 12s4.15 9.25 9.25 9.25c5.34 0 8.88-3.75 8.88-9.04 0-.6-.06-1.06-.15-1.11z" />
              </svg>
              Continuar com Google
            </button>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> ou com e-mail <span className="h-px flex-1 bg-border" />
            </div>
            <form onSubmit={submit} className="space-y-3">
              {mode === "criar" && (
                <Field label="Nome completo">
                  <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputCls} />
                </Field>
              )}
              <Field label="E-mail">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={inputCls} />
              </Field>
              <Field label="Senha">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "entrar" ? "current-password" : "new-password"}
                  className={inputCls}
                />
              </Field>
              {mode === "entrar" && (
                <Link to="/recuperar-senha" className="block text-right text-xs text-muted-foreground hover:text-primary">
                  Esqueci minha senha
                </Link>
              )}
              <button
                disabled={busy}
                className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
              >
                {busy ? "Aguarde…" : mode === "entrar" ? "Entrar" : "Criar conta"}
              </button>
            </form>
          </>
        )}

        <button
          onClick={() => {
            setMode(mode === "entrar" ? "criar" : "entrar");
            setSent(false);
          }}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "entrar" ? "Não tem conta? Criar conta" : "Já tenho conta"}
        </button>
      </div>
    </main>
  );
}

export const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
