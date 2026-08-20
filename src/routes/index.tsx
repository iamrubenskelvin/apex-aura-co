import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, FlaskConical, Truck, ShieldCheck, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-athlete.jpg";
import { categories, products } from "@/data/products";
import { CartProvider } from "@/components/site/cart";
import { Header } from "@/components/site/Header";
import { ProductCard } from "@/components/site/ProductCard";

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
  { icon: FlaskConical, title: "Laudo de pureza", text: "Cada lote testado em laboratório independente." },
  { icon: Truck, title: "Envio em 24h", text: "Postagem no mesmo dia para pedidos até 16h." },
  { icon: ShieldCheck, title: "Compra protegida", text: "Pagamento criptografado e garantia de 30 dias." },
  { icon: BadgeCheck, title: "Fórmulas limpas", text: "Sem enchimentos, sem promessas vazias." },
];

function Home() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Header />

        <main>
          {/* HERO */}
          <section className="relative overflow-hidden">
            <img
              src={heroImage}
              alt="Atletas treinando com barra em academia com iluminação dramática"
              width={1600}
              height={1200}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-60"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40"
              aria-hidden="true"
            />

            <div className="relative mx-auto max-w-7xl px-5 py-24 sm:py-32 lg:px-8 lg:py-40">
              <div className="max-w-2xl">
                <span className="inline-flex animate-[fade-up_0.6s_ease-out_both] items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                  Nova linha performance
                </span>

                <h1
                  className="text-display mt-6 text-5xl sm:text-6xl lg:text-7xl"
                  style={{ animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 80ms both" }}
                >
                  Combustível
                  <br />
                  para quem
                  <br />
                  <span className="text-primary">não recua.</span>
                </h1>

                <p
                  className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
                  style={{ animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 160ms both" }}
                >
                  Suplementos de alta pureza, formulados com dosagens completas e testados lote a
                  lote.
                </p>

                <div
                  className="mt-10 flex flex-col gap-3 sm:flex-row"
                  style={{ animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 240ms both" }}
                >
                  <a href="#produtos" className="btn-base btn-primary px-8 py-4 text-base">
                    Comprar agora
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a href="#categorias" className="btn-base btn-ghost-outline px-8 py-4 text-base">
                    Ver categorias
                  </a>
                </div>

                <dl
                  className="mt-14 grid max-w-lg grid-cols-3 gap-6"
                  style={{ animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 320ms both" }}
                >
                  {[
                    ["+180 mil", "clientes ativos"],
                    ["4.9/5", "média de avaliações"],
                    ["24h", "para postagem"],
                  ].map(([value, label]) => (
                    <div key={label} className="min-w-0">
                      <dt className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {value}
                      </dt>
                      <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          {/* BENEFÍCIOS */}
          <section className="border-y border-border bg-surface/40">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex min-w-0 items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
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
                  Navegue rápido
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

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((c, i) => (
                <a
                  key={c.name}
                  href="#produtos"
                  className="surface-card flex flex-col justify-between p-5"
                  style={{ animation: `fade-up 0.5s ease-out ${i * 60}ms both` }}
                >
                  <span className="text-sm font-semibold">{c.name}</span>
                  <span className="mt-8 text-xs text-muted-foreground">{c.count} produtos</span>
                </a>
              ))}
            </div>
          </section>

          {/* PRODUTOS */}
          <section id="produtos" className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-promo">
                  Ofertas da semana
                </p>
                <h2 className="text-display mt-3 text-3xl sm:text-4xl">Mais vendidos</h2>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-14 text-center sm:px-12 lg:py-20">
              <div
                className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
                aria-hidden="true"
              />
              <h2 className="text-display relative text-3xl sm:text-4xl lg:text-5xl">
                Primeira compra com <span className="text-primary">15% off</span>
              </h2>
              <p className="relative mx-auto mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
                Receba o cupom e as ofertas antes de todo mundo.
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
                  Quero o cupom
                </button>
              </form>
            </div>
          </section>
        </main>

        <footer className="border-t border-border bg-surface/40">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
            <div className="min-w-0">
              <span className="text-display text-xl">
                Forja<span className="text-primary">Nutri</span>
              </span>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Suplementos de alta performance, com transparência total de fórmula.
              </p>
            </div>
            {[
              { title: "Loja", links: ["Proteínas", "Creatina", "Pré-treino", "Combos"] },
              { title: "Ajuda", links: ["Rastrear pedido", "Trocas", "Frete", "Contato"] },
              { title: "Institucional", links: ["Sobre", "Laudos", "Privacidade", "Termos"] },
            ].map((col) => (
              <nav key={col.title} className="min-w-0" aria-label={col.title}>
                <h2 className="text-sm font-semibold">{col.title}</h2>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#produtos" className="transition-colors hover:text-primary">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground lg:px-8">
            © {new Date().getFullYear()} Forja Nutri. Todos os direitos reservados.
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
