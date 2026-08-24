import { useState } from "react";
import { BadgeCheck, MessageSquare, Star } from "lucide-react";
import type { ProductReview } from "@/data/product-details";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="flex" aria-label={`${value} de 5 estrelas`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`${size} ${i < Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
        />
      ))}
    </span>
  );
}

export function ReviewsPanel({
  reviews,
  rating,
  total,
}: {
  reviews: ProductReview[];
  rating: number;
  total: number;
}) {
  const [filter, setFilter] = useState<number | null>(null);
  const [limit, setLimit] = useState(3);

  if (reviews.length === 0) {
    return (
      <section id="avaliacoes" className="min-w-0">
        <h2 className="text-display text-2xl sm:text-3xl">Avaliações</h2>
        <div className="mt-6 grid place-items-center rounded-2xl border border-border bg-surface px-6 py-14 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Este produto ainda não possui avaliações. Seja o primeiro a avaliar.
          </p>
        </div>
      </section>
    );
  }

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const filtered = filter ? reviews.filter((r) => Math.round(r.rating) === filter) : reviews;

  return (
    <section id="avaliacoes" className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        Quem comprou aprova
      </p>
      <h2 className="text-display mt-2 text-2xl sm:text-3xl">Avaliações do produto</h2>

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="min-w-0 rounded-2xl border border-border bg-surface p-6">
          <p className="text-5xl font-bold leading-none">{rating.toFixed(1).replace(".", ",")}</p>
          <div className="mt-3">
            <Stars value={rating} size="h-5 w-5" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {total.toLocaleString("pt-BR")} avaliações
          </p>

          <ul className="mt-5 space-y-2">
            {distribution.map(({ star, count }) => {
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              const active = filter === star;
              return (
                <li key={star}>
                  <button
                    onClick={() => setFilter(active ? null : star)}
                    aria-pressed={active}
                    className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-surface-2 ${
                      active ? "bg-surface-2 text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <span className="shrink-0 font-semibold">{star}★</span>
                    <span className="h-1.5 min-w-0 overflow-hidden rounded-full bg-surface-2">
                      <span
                        className="block h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="shrink-0">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {filter && (
            <button
              onClick={() => setFilter(null)}
              className="mt-4 w-full rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:border-primary/50 hover:text-primary"
            >
              Limpar filtro
            </button>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          {filtered.slice(0, limit).map((r) => (
            <article key={r.id} className="min-w-0 rounded-2xl border border-border bg-surface p-5">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {r.initials}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Compra verificada
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3">
                    <Stars value={r.rating} size="h-3.5 w-3.5" />
                    <span className="text-xs text-muted-foreground">{fmtDate(r.date)}</span>
                    {r.variant && (
                      <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                        {r.variant}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {r.title && <h3 className="mt-4 text-sm font-semibold">{r.title}</h3>}
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              {r.photos && r.photos.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {r.photos.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt={`Foto enviada por ${r.name}`}
                      loading="lazy"
                      className="h-20 w-20 shrink-0 rounded-xl border border-border object-cover"
                    />
                  ))}
                </div>
              )}
            </article>
          ))}

          {filtered.length === 0 && (
            <p className="rounded-2xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted-foreground">
              Nenhuma avaliação com essa nota.
            </p>
          )}

          {limit < filtered.length && (
            <button
              onClick={() => setLimit((l) => l + 3)}
              className="btn-base btn-ghost-outline w-full px-6 py-3 text-sm"
            >
              Ver mais avaliações
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
