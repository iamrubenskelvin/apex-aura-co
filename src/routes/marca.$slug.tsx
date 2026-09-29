import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PackageX } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumb } from "@/components/catalog/Breadcrumb";
import { CatalogView } from "@/components/catalog/CatalogView";
import { validateCatalogSearch, type CatalogSearch } from "@/components/catalog/search-params";
import { brandBySlug, catalog } from "@/data/catalog";
import { slugify } from "@/data/product-details";

const SITE = "https://apex-aura-co.lovable.app";

export const Route = createFileRoute("/marca/$slug")({
  validateSearch: validateCatalogSearch,
  loader: ({ params }) => {
    const brand = brandBySlug(params.slug);
    if (!brand) throw notFound();
    return { brand };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Marca não encontrada — Forja Nutri" }, { name: "robots", content: "noindex" }] };
    }
    const { brand } = loaderData;
    const title = `${brand.name} — Forja Nutri`;
    const description = brand.description.slice(0, 158);
    const url = `${SITE}/marca/${params.slug}`;
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
  component: BrandPage,
  notFoundComponent: BrandNotFound,
  errorComponent: BrandNotFound,
});

function BrandNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto grid max-w-2xl place-items-center px-5 py-32 text-center">
        <PackageX className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-display mt-6 text-3xl">Marca não encontrada</h1>
        <Link to="/produtos" className="btn-base btn-primary mt-8 px-8 py-4 text-sm">
          Ver todos os produtos
        </Link>
      </main>
      <Footer />
    </div>
  );
}

function BrandPage() {
  const { brand } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const patch = (p: Partial<CatalogSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...p }), replace: true });

  const products = catalog.filter((p) => slugify(p.brand) === brand.slug);
  const cats = [...new Set(products.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Breadcrumb
          items={[
            { label: "Início", to: "/" },
            { label: "Produtos", to: "/produtos" },
            { label: brand.name },
          ]}
        />

        <section className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-border bg-surface p-8 sm:p-12">
            <span className="grid h-20 w-44 place-items-center rounded-2xl border border-border bg-surface-2 text-sm font-semibold uppercase tracking-widest text-primary">
              {brand.name}
            </span>
            <h1 className="text-display mt-6 text-3xl sm:text-4xl">{brand.name}</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">{brand.description}</p>
            {cats.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {cats.map((c) => (
                  <Link
                    key={c}
                    to="/categoria/$slug"
                    params={{ slug: slugify(c) }}
                    className="rounded-full bg-surface-2 px-4 py-2 text-xs transition-colors hover:text-primary"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="pt-10">
          <CatalogView products={products} search={search} patch={patch} hideFilters={["marca"]} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
