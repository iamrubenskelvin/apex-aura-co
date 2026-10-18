import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, LogOut, MapPin, Package, ShieldCheck, Star, Ticket, User } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — Forja Nutri" },
      { name: "description", content: "Pedidos, endereços, favoritos e cupons da sua conta Forja Nutri." },
      { property: "og:title", content: "Minha conta — Forja Nutri" },
      { property: "og:description", content: "Pedidos, endereços, favoritos e cupons da sua conta Forja Nutri." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountLayout,
});

const links = [
  { to: "/conta", label: "Meus dados", icon: User, exact: true },
  { to: "/conta/pedidos", label: "Pedidos", icon: Package },
  { to: "/conta/enderecos", label: "Endereços", icon: MapPin },
  { to: "/conta/favoritos", label: "Favoritos", icon: Heart },
  { to: "/conta/cupons", label: "Cupons", icon: Ticket },
  { to: "/conta/avaliacoes", label: "Avaliações", icon: Star },
  { to: "/conta/privacidade", label: "Privacidade", icon: ShieldCheck },
] as const;

function AccountLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Minha conta</p>
          <p className="mt-1 truncate text-sm font-semibold">{user.email}</p>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible" aria-label="Minha conta">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: "exact" in l }}
                className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
                activeProps={{ className: "bg-surface text-foreground font-semibold" }}
              >
                <l.icon className="h-4 w-4" /> {l.label}
              </Link>
            ))}
            <button
              onClick={signOut}
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </nav>
        </aside>
        <div className="min-w-0 space-y-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
