import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, PackageX } from "lucide-react";
import { brl, type Product } from "@/data/products";
import { catalog, catalogById, catalogBySlug } from "@/data/catalog";
import { getProductDetail } from "@/data/product-details";
import { useCart } from "@/components/site/cart";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Carousel } from "@/components/site/Carousel";
import { ProductCard } from "@/components/site/ProductCard";
import { Gallery } from "@/components/site/product/Gallery";
import { BuyBox } from "@/components/site/product/BuyBox";
import { About, Composition, Faq, Highlights, Nutrition } from "@/components/site/product/Sections";
import { ReviewsPanel } from "@/components/site/product/ReviewsPanel";
import { Bundle } from "@/components/site/product/Bundle";

const SITE = "https://apex-aura-co.lovable.app";

export const Route = createFileRoute("/produtos/$slug")({
  loader: ({ params }) => {
    const product = catalogBySlug(params.slug);
    if (!product) throw notFound();
    const siblings = catalog.filter((p) => p.category === product.category);
    const i = siblings.findIndex((p) => p.id === product.id);
    const prev = siblings.length > 1 ? siblings[(i - 1 + siblings.length) % siblings.length] : undefined;
    const next = siblings.length > 1 ? siblings[(i + 1) % siblings.length] : undefined;
    return {
      product,
      detail: getProductDetail(product),
      prev: prev ? { slug: prev.slug, name: prev.name } : null,
      next: next ? { slug: next.slug, name: next.name } : null,
    };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Produto não encontrado — Forja Nutri" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product, detail } = loaderData;
    const url = `${SITE}/produtos/${params.slug}`;
    const title = `${product.name} — ${product.brand} | Forja Nutri`;
    const description = `${product.name} por ${brl(product.price)}. ${
      detail.about.intro || `${product.category} original com laudo de pureza.`
    }`.slice(0, 158);

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            sku: detail.sku,
            category: product.category,
            brand: { "@type": "Brand", name: product.brand },
            description,
            offers: {
              "@type": "Offer",
              url,
              priceCurrency: "BRL",
              price: product.price.toFixed(2),
              availability:
                (product.stockLeft ?? 0) > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
            ...(product.reviews > 0
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: product.rating,
                    reviewCount: product.reviews,
                  },
                }
              : {}),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: SITE },
              { "@type": "ListItem", position: 2, name: "Suplementos", item: `${SITE}/#produtos` },
              { "@type": "ListItem", position: 3, name: product.category, item: `${SITE}/#categorias` },
              { "@type": "ListItem", position: 4, name: product.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
  errorComponent: ProductNotFound,
});

function ProductNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto grid max-w-2xl place-items-center px-5 py-32 text-center">
        <PackageX className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-display mt-6 text-3xl sm:text-4xl">Produto não encontrado</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          O item que você procura pode ter saído de linha ou mudado de endereço.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-base btn-primary px-8 py-4 text-sm">
            Voltar para a loja
          </Link>
          <a href="/#produtos" className="btn-base btn-ghost-outline px-8 py-4 text-sm">
            Ver produtos
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProductPage() {
  const { product, detail, prev, next } = Route.useLoaderData();
  const { recent, pushRecent } = useCart();
  const [, setVariantLabel] = useState("");

  useEffect(() => {
    pushRecent(product.id);
    window.scrollTo({ top: 0 });
  }, [product.id, pushRecent]);

  const related: Product[] = detail.relatedIds
    .map((id) => catalogById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const bundleItems: Product[] = [
    product,
    ...detail.bundleIds
      .map((id) => catalogById(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p)),
  ];

  const recentProducts = recent
    .filter((id) => id !== product.id)
    .map((id) => catalogById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-28 lg:pb-0">
        {/* BREADCRUMB */}
        <nav
          aria-label="Você está aqui"
          className="mx-auto max-w-7xl overflow-x-auto px-5 py-5 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ol className="flex w-max items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <li>
              <Link to="/" className="transition-colors hover:text-primary">
                Início
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <li>
              <a href="/#produtos" className="transition-colors hover:text-primary">
                Suplementos
              </a>
            </li>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <li>
              <a href="/#categorias" className="transition-colors hover:text-primary">
                {product.category}
              </a>
            </li>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <li aria-current="page" className="font-semibold text-foreground">
              {product.name}
            </li>
          </ol>
        </nav>

        {(prev || next) && (
          <nav aria-label={`Outros produtos em ${product.category}`} className="mx-auto flex max-w-7xl justify-between gap-3 px-5 pb-6 text-xs sm:text-sm lg:px-8">
            {prev ? (
              <Link to="/produtos/$slug" params={{ slug: prev.slug }} className="flex min-w-0 items-center gap-1 text-muted-foreground transition-colors hover:text-primary">
                <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Anterior: {prev.name}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link to="/produtos/$slug" params={{ slug: next.slug }} className="flex min-w-0 items-center gap-1 text-right text-muted-foreground transition-colors hover:text-primary">
                <span className="truncate">Próximo: {next.name}</span>
                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>
            )}
          </nav>
        )}

        {/* GALERIA + COMPRA */}
        <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 lg:grid-cols-2 lg:gap-14 lg:px-8">
          <Gallery media={detail.gallery} alt={product.name} badges={detail.badges.slice(0, 2)} />
          <BuyBox product={product} detail={detail} onSelectionChange={setVariantLabel} />
        </section>

        <div className="mx-auto max-w-7xl space-y-16 px-5 pb-20 lg:space-y-24 lg:px-8 lg:pb-28">
          <Highlights items={detail.highlights} />
          <About about={detail.about} />
          <Nutrition
            rows={detail.nutrition}
            serving={detail.servingLabel}
            aminos={detail.aminoAcids}
          />
          <Composition
            ingredients={detail.ingredients}
            allergens={detail.allergens}
            usage={detail.usage}
            warnings={detail.warnings}
            storage={detail.storage}
          />
          <Faq items={detail.faq} />
          <ReviewsPanel
            reviews={detail.reviews}
            rating={product.rating}
            total={product.reviews}
          />

          {bundleItems.length > 1 && <Bundle items={bundleItems} />}

          {related.length > 0 && (
            <section className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Selecionados para você
              </p>
              <h2 className="text-display mt-2 text-2xl sm:text-3xl">Você também pode gostar</h2>
              <div className="mt-10">
                <Carousel label="Produtos relacionados">
                  {related.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </Carousel>
              </div>
            </section>
          )}

          {recentProducts.length > 0 && (
            <section className="min-w-0">
              <h2 className="text-display text-2xl sm:text-3xl">Você viu recentemente</h2>
              <div className="mt-10">
                <Carousel label="Produtos vistos recentemente">
                  {recentProducts.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </Carousel>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
