import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PackageX } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumb } from "@/components/catalog/Breadcrumb";
import { CatalogView } from "@/components/catalog/CatalogView";
import { validateCatalogSearch, type CatalogSearch } from "@/components/catalog/search-params";
import { catalog, categoryBySlug, categoryTree } from "@/data/catalog";
import { slugify } from "@/data/product-details";

const SITE = "https://apex-aura-co.lovable.app";

export const Route = createFileRoute("/categoria/$slug")({
  validateSearch: validateCatalogSearch,
  loader: ({ params }) => {
    const category = categoryBySlug(params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Categoria não encontrada — Forja Nutri" }, { name: "robots", content: "noindex" }],
      };
    }
    const { category } = loaderData;
    const title = `${category.name} — Forja Nutri`;
    const description = category.description.slice(0, 158);
    const url = `${SITE}/categoria/${params.slug}`;
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
  component: CategoryPage,
  notFoundComponent: CategoryNotFound,
  errorComponent: CategoryNotFound,
});

function CategoryNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto grid max-w-2xl place-items-center px-5 py-32 text-center">
        <PackageX className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-display mt-6 text-3xl">Categoria não encontrada</h1>
        <p className="mt-3 text-sm text-muted-foreground">Confira o catálogo completo para achar o que procura.</p>
        <Link to="/produtos" className="btn-base btn-primary mt-8 px-8 py-4 text-sm">
          Ver todos os produtos
        </Link>
      </main>
      <Footer />
    </div>
  );
}

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const patch = (p: Partial<CatalogSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...p }), replace: true });

  const products = catalog.filter((p) => slugify(p.category) === category.slug);
  const related = categoryTree.filter((c) => c.slug !== category.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Breadcrumb
          items={[
            { label: "Início", to: "/" },
            { label: "Produtos", to: "/produtos" },
            { label: category.name },
          ]}
        />

        {/* BANNER */}
        <section className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface">
            <div className="grid items-center gap-6 p-8 sm:p-12 md:grid-cols-[minmax(0,1fr)_16rem]">
              <div className="min-w-0">
                <h1 className="text-display text-3xl sm:text-4xl lg:text-5xl">{category.banner.title}</h1>
                <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
                  {category.banner.subtitle}
                </p>
                {category.banner.cta && (
                  <a href="#catalogo" className="btn-base btn-primary mt-6 px-7 py-3.5 text-sm">
                    {category.banner.cta}
                  </a>
                )}
              </div>
              <img
                src={category.image}
                alt={category.name}
                className="mx-auto h-40 w-40 object-contain md:h-56 md:w-56"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* SUBCATEGORIAS */}
        {category.children && category.children.length > 0 && (
          <section className="mx-auto max-w-7xl px-5 pt-10 lg:px-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Subcategorias</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {category.children.map((sub) => (
                <button
                  key={sub.slug}
                  onClick={() => patch({ subcategoria: sub.slug, pagina: 1 })}
                  className={`surface-card px-4 py-5 text-left text-sm font-semibold transition-colors hover:text-primary ${
                    search.subcategoria === sub.slug ? "text-primary" : ""
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </section>
        )}

        <div id="catalogo" className="pt-10">
          <p className="mx-auto max-w-7xl px-5 pb-6 text-sm text-muted-foreground lg:px-8">
            {category.description}
          </p>
          <CatalogView
            products={products}
            search={search}
            patch={patch}
            hideFilters={["categoria", "tipo"]}
          />
        </div>

        {/* CONTEÚDO SEO + FAQ */}
        <section className="mx-auto max-w-4xl px-5 pb-20 lg:px-8">
          <h2 className="text-display text-2xl">{category.seo.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{category.seo.text}</p>
          <div className="mt-8 space-y-3">
            {category.seo.faq.map((f) => (
              <details key={f.q} className="surface-card p-5">
                <summary className="cursor-pointer text-sm font-semibold">{f.q}</summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>

          <h2 className="text-display mt-14 text-xl">Categorias relacionadas</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {related.map((c) => (
              <Link
                key={c.slug}
                to="/categoria/$slug"
                params={{ slug: c.slug }}
                className="rounded-full bg-surface px-4 py-2 text-xs transition-colors hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
