import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  Headphones,
  Lock,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { bestSellers, categories, featured } from "@/data/products";
import { Header } from "@/components/site/Header";
import { HeroSlider } from "@/components/site/HeroSlider";
import { ProductCard } from "@/components/site/ProductCard";
import { Carousel } from "@/components/site/Carousel";
import { FlashDeals } from "@/components/site/FlashDeals";
import { Brands } from "@/components/site/Brands";
import { Reviews } from "@/components/site/Reviews";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forja Nutri — Suplementos Premium para Alta Performance" },
      {
        name: "description",
        content:
          "Whey, creatina, pré-treino e vitaminas com laudo de pureza. Envio em 24h, frete grátis acima de R$ 199 e até 12x sem juros.",
      },
      { property: "og:title", content: "Forja Nutri — Suplementos Premium" },
      {
        property: "og:description",
        content:
          "Suplementos testados em laboratório para força, energia e recuperação. Frete grátis acima de R$ 199.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const benefits = [
  { icon: Truck, title: "Frete rápido", text: "Postagem no mesmo dia para pedidos até 16h." },
  { icon: Lock, title: "Pagamento seguro", text: "Ambiente criptografado e antifraude." },
  { icon: ShieldCheck, title: "Compra protegida", text: "Garantia de 30 dias ou seu dinheiro de volta." },
  { icon: Headphones, title: "Atendimento especializado", text: "Time com nutricionistas de plantão." },
  { icon: BadgeCheck, title: "Produtos originais", text: "Distribuição oficial com laudo de pureza." },
  { icon: RefreshCw, title: "Troca facilitada", text: "Sabor errado? Trocamos sem burocracia." },
];

function Home() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />

        <main>
          <HeroSlider />

          {/* BENEFÍCIOS */}
          <section className="border-y border-border bg-surface/40">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div key={title} className="group flex min-w-0 items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold">{title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CATEGORIAS */}
          <section id="categorias" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Navegue por objetivo
                </p>
                <h2 className="text-display mt-3 text-3xl sm:text-4xl">Categorias</h2>
              </div>
              <a
                href="#produtos"
                className="hidden text-sm font-semibold text-muted-foreground transition-colors hover:text-primary sm:block"
              >
                Ver tudo
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
              {categories.map((c, i) => (
                <a
                  key={c.name}
                  href="#produtos"
                  className="surface-card group flex min-w-0 items-center gap-4 overflow-hidden p-4 sm:p-5"
                  style={{ animation: `fade-up 0.5s ease-out ${i * 50}ms both` }}
                >
                  <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-2">
                    <img
                      src={c.image}
                      alt={c.name}
                      width={160}
                      height={160}
                      loading="lazy"
                      className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold transition-colors group-hover:text-primary sm:text-base">
                      {c.name}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {c.count} produtos
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* DESTAQUES */}
          <section id="produtos" className="mx-auto max-w-7xl px-5 pb-8 lg:px-8">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Selecionados pelo time
              </p>
              <h2 className="text-display mt-3 text-3xl sm:text-4xl">Produtos em destaque</h2>
            </div>
            <div className="mt-10">
              <Carousel label="Produtos em destaque">
                {featured.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </Carousel>
            </div>
          </section>

          {/* MAIS VENDIDOS */}
          <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-24">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-promo">
                Preferidos da galera
              </p>
              <h2 className="text-display mt-3 text-3xl sm:text-4xl">Mais vendidos</h2>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {bestSellers.slice(0, 4).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>

          <FlashDeals />

          <Brands />

          <Reviews />

          {/* NEWSLETTER */}
          <section id="newsletter" className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-14 text-center sm:px-12 lg:py-20">
              <div
                className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
                aria-hidden="true"
              />
              <h2 className="text-display relative text-3xl sm:text-4xl lg:text-5xl">
                Receba ofertas <span className="text-primary">exclusivas</span>
              </h2>
              <p className="relative mx-auto mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
                Cadastre-se e seja o primeiro a saber das promoções.
              </p>
              <form
                className="relative mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
                onSubmit={(e) => e.preventDefault()}
              >
                <label htmlFor="email" className="sr-only">
                  Seu e-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="min-w-0 flex-1 rounded-full border border-border bg-background px-6 py-4 text-sm outline-none transition-colors focus:border-primary/60"
                />
                <button type="submit" className="btn-base btn-primary px-8 py-4 text-sm">
                  Cadastrar
                </button>
              </form>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
