import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PackageX } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumb } from "@/components/catalog/Breadcrumb";
import { CatalogView } from "@/components/catalog/CatalogView";
import { validateCatalogSearch, type CatalogSearch } from "@/components/catalog/search-params";
import { catalog, goalBySlug, goals } from "@/data/catalog";
import { slugify } from "@/data/product-details";

const SITE = "https://apex-aura-co.lovable.app";

export const Route = createFileRoute("/objetivo/$slug")({
  validateSearch: validateCatalogSearch,
  loader: ({ params }) => {
    const goal = goalBySlug(params.slug);
    if (!goal) throw notFound();
    return { goal };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Objetivo não encontrado — Forja Nutri" }, { name: "robots", content: "noindex" }] };
    }
    const { goal } = loaderData;
    const title = `Suplementos para ${goal.name.toLowerCase()} — Forja Nutri`;
    const description = goal.description.slice(0, 158);
    const url = `${SITE}/objetivo/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: GoalPage,
  notFoundComponent: GoalNotFound,
  errorComponent: GoalNotFound,
});

function GoalNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto grid max-w-2xl place-items-center px-5 py-32 text-center">
        <PackageX className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-display mt-6 text-3xl">Objetivo não encontrado</h1>
        <Link to="/produtos" className="btn-base btn-primary mt-8 px-8 py-4 text-sm">
          Ver todos os produtos
        </Link>
      </main>
      <Footer />
    </div>
  );
}

function GoalPage() {
  const { goal } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const patch = (p: Partial<CatalogSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...p }), replace: true });

  const products = catalog.filter((p) => p.goals.some((g) => slugify(g) === goal.slug));
  const cats = [...new Set(products.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Breadcrumb
          items={[
            { label: "Início", to: "/" },
            { label: "Produtos", to: "/produtos" },
            { label: goal.name },
          ]}
        />

        <header className="mx-auto max-w-7xl px-5 pb-10 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Objetivo</p>
          <h1 className="text-display mt-3 text-3xl sm:text-4xl lg:text-5xl">{goal.name}</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">{goal.description}</p>
          {cats.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {cats.map((c) => (
                <Link
                  key={c}
                  to="/categoria/$slug"
                  search={{} as never}
                  params={{ slug: slugify(c) }}
                  className="rounded-full bg-surface px-4 py-2 text-xs transition-colors hover:text-primary"
                >
                  {c}
                </Link>
              ))}
            </div>
          )}
        </header>

        <CatalogView products={products} search={search} patch={patch} hideFilters={["objetivo"]} />

        <section className="mx-auto max-w-4xl px-5 pb-20 lg:px-8">
          <h2 className="text-display text-2xl">Como treinar e se alimentar para {goal.name.toLowerCase()}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{goal.educational}</p>

          <div className="mt-8 space-y-3">
            <details className="surface-card p-5">
              <summary className="cursor-pointer text-sm font-semibold">
                Por onde começar na suplementação?
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">
                Priorize o básico: proteína suficiente no dia, hidratação e sono. Depois disso, escolha um ou dois
                suplementos alinhados ao seu objetivo, com orientação profissional.
              </p>
            </details>
            <details className="surface-card p-5">
              <summary className="cursor-pointer text-sm font-semibold">Posso combinar produtos?</summary>
              <p className="mt-3 text-sm text-muted-foreground">
                Sim, desde que respeitando as doses de cada rótulo. Nosso atendimento ajuda a montar combinações
                coerentes com a sua rotina.
              </p>
            </details>
          </div>

          <h2 className="text-display mt-14 text-xl">Outros objetivos</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {goals
              .filter((g) => g.slug !== goal.slug)
              .map((g) => (
                <Link
                  key={g.slug}
                  to="/objetivo/$slug"
                  search={{} as never}
                  params={{ slug: g.slug }}
                  className="rounded-full bg-surface px-4 py-2 text-xs transition-colors hover:text-primary"
                >
                  {g.name}
                </Link>
              ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
