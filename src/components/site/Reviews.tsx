import { Star } from "lucide-react";
import { testimonials } from "@/data/products";
import { Carousel } from "./Carousel";

export function Reviews() {
  return (
    <section id="avaliacoes" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Quem treina, aprova
          </p>
          <h2 className="text-display mt-3 text-3xl sm:text-4xl">Avaliações reais</h2>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4">
          <span className="text-4xl font-bold tracking-tight text-primary">4.9</span>
          <span className="min-w-0">
            <span className="flex" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              12.480 avaliações verificadas
            </span>
          </span>
        </div>
      </div>

      <div className="mt-12">
        <Carousel label="Depoimentos de clientes" itemClass="w-[85%] sm:w-[48%] lg:w-[32%]">
          {testimonials.map((t) => (
            <article key={t.name} className="surface-card flex h-full flex-col p-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {t.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.city}</span>
                </span>
              </div>
              <span className="mt-4 flex" aria-label={`${t.rating} de 5 estrelas`}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < t.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                  />
                ))}
              </span>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">“{t.text}”</p>
            </article>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
