import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Carousel } from "@/components/site/Carousel";
import { ProductCard } from "@/components/site/ProductCard";
import { Breadcrumb } from "@/components/catalog/Breadcrumb";
import { CatalogView } from "@/components/catalog/CatalogView";
import { validateCatalogSearch, type CatalogSearch } from "@/components/catalog/search-params";
import { catalog, popularProducts } from "@/data/catalog";

export const Route = createFileRoute("/buscar")({
  validateSearch: validateCatalogSearch,
  head: ({ match }) => {
    const q = (match.search as { q?: string }).q ?? "";
    const title = q ? `Resultados para "${q}" — Forja Nutri` : "Buscar suplementos — Forja Nutri";
    const description = q
      ? `Veja os suplementos encontrados para "${q}" na Forja Nutri, com filtros por marca, objetivo, sabor e preço.`
      : "Busque whey, creatina, pré-treino, vitaminas e acessórios no catálogo da Forja Nutri.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "noindex, follow" },
      ],
    };
  },
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const patch = (p: Partial<CatalogSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...p }), replace: true });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Breadcrumb items={[{ label: "Início", to: "/" }, { label: "Busca" }]} />
        <header className="mx-auto max-w-7xl px-5 pb-10 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Busca</p>
          <h1 className="text-display mt-3 text-3xl sm:text-4xl">
            {search.q ? <>Resultados para: {search.q}</> : "Buscar no catálogo"}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Refine por marca, objetivo, sabor, preço e avaliação para chegar mais rápido ao produto certo.
          </p>
        </header>

        <CatalogView
          products={catalog}
          search={search}
          patch={patch}
          emptyExtra={
            <div className="mt-10 w-full min-w-0 text-left">
              <h3 className="text-display text-lg">Talvez você esteja procurando por</h3>
              <div className="mt-6">
                <Carousel label="Produtos populares">
                  {popularProducts.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </Carousel>
              </div>
            </div>
          }
        />
      </main>
      <Footer />
    </div>
  );
}
