import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Package, ShoppingCart, Store, Ticket, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel — Forja Nutri" },
      { name: "description", content: "Gerencie produtos, preços e estoque da Forja Nutri." },
      { property: "og:title", content: "Painel — Forja Nutri" },
      { property: "og:description", content: "Gerencie produtos, preços e estoque da Forja Nutri." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const role = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (error) throw error;
      return Boolean(data);
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3">
          <Link to="/admin" className="text-display text-lg">
            Forja<span className="text-primary">Nutri</span>
            <span className="ml-2 text-xs font-medium text-muted-foreground">Painel</span>
          </Link>
          <nav className="ml-4 flex gap-1 text-sm">
            <Link
              to="/admin"
              activeOptions={{ exact: true }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              activeProps={{ className: "bg-surface-2 text-foreground" }}
            >
              <Package className="h-4 w-4" /> Produtos
            </Link>
            <Link
              to="/admin/pedidos"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              activeProps={{ className: "bg-surface-2 text-foreground" }}
            >
              <ShoppingCart className="h-4 w-4" /> <span className="hidden sm:inline">Pedidos</span>
            </Link>
            <Link
              to="/admin/cupons"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              activeProps={{ className: "bg-surface-2 text-foreground" }}
            >
              <Ticket className="h-4 w-4" /> <span className="hidden sm:inline">Cupons</span>
            </Link>
            <Link
              to="/admin/exclusoes"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              activeProps={{ className: "bg-surface-2 text-foreground" }}
            >
              <UserX className="h-4 w-4" /> <span className="hidden sm:inline">Exclusões</span>
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{user.email}</span>
            <Link to="/" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-2" aria-label="Ver loja">
              <Store className="h-4 w-4" />
            </Link>
            <button onClick={signOut} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-2" aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">
        {role.isLoading ? (
          <p className="text-muted-foreground">Carregando…</p>
        ) : role.data ? (
          <Outlet />
        ) : (
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
            <h1 className="text-xl font-bold">Sem acesso ao painel</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta conta não tem permissão de administrador.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
