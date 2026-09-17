import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumb } from "@/components/catalog/Breadcrumb";
import { CatalogView } from "@/components/catalog/CatalogView";
import { validateCatalogSearch, type CatalogSearch } from "@/components/catalog/search-params";
import { catalog } from "@/data/catalog";

const title = "Todos os suplementos — Forja Nutri";
const description =
  "Catálogo completo de whey protein, creatina, pré-treino, vitaminas e acessórios com filtros por objetivo, marca, sabor e preço.";

export const Route = createFileRoute("/produtos/")({
  validateSearch: validateCatalogSearch,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const patch = (p: Partial<CatalogSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...p }), replace: true });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Breadcrumb items={[{ label: "Início", to: "/" }, { label: "Produtos" }]} />
        <header className="mx-auto max-w-7xl px-5 pb-10 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Catálogo</p>
          <h1 className="text-display mt-3 text-3xl sm:text-4xl lg:text-5xl">Todos os suplementos</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Encontre suplementos para seus objetivos e sua rotina.
          </p>
        </header>
        <CatalogView products={catalog} search={search} patch={patch} />
      </main>
      <Footer />
    </div>
  );
}
