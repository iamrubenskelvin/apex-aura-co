import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { brl, flashDeals, pixPrice } from "@/data/products";
import { useCart } from "./cart";

function useCountdown(hours = 5) {
  const [left, setLeft] = useState(hours * 3600);
  useEffect(() => {
    const id = window.setInterval(() => setLeft((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return [pad(Math.floor(left / 3600)), pad(Math.floor((left % 3600) / 60)), pad(left % 60)];
}

export function FlashDeals() {
  const { add } = useCart();
  const [h, m, s] = useCountdown();

  return (
    <section id="ofertas" className="border-y border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-promo">
              <Zap className="h-4 w-4" /> Ofertas relâmpago
            </p>
            <h2 className="text-display mt-3 text-3xl sm:text-4xl">Termina em breve</h2>
          </div>
          <div className="flex items-center gap-2" aria-label={`Termina em ${h}h ${m}m ${s}s`}>
            {[
              [h, "hrs"],
              [m, "min"],
              [s, "seg"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="min-w-16 rounded-xl border border-border bg-background px-3 py-2 text-center"
              >
                <span className="block text-2xl font-bold tabular-nums text-promo">{value}</span>
                <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {flashDeals.map((p, i) => {
            const total = p.stockTotal ?? 100;
            const left = p.stockLeft ?? 10;
            const soldPct = Math.round(((total - left) / total) * 100);
            return (
              <article
                key={p.id}
                className="surface-card flex flex-col p-4"
                style={{ animation: `fade-up 0.5s ease-out ${i * 70}ms both` }}
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-2">
                  <img
                    src={p.image}
                    alt={p.name}
                    width={600}
                    height={600}
                    loading="lazy"
                    className="h-full w-full object-contain p-4 transition-transform duration-700 hover:scale-110"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-promo px-3 py-1 text-xs font-bold text-promo-foreground">
                    {p.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-semibold leading-snug">{p.name}</h3>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-xs text-muted-foreground line-through">{brl(p.oldPrice!)}</span>
                  <span className="text-xl font-bold">{brl(p.price)}</span>
                </div>
                <p className="text-xs font-semibold text-primary">{brl(pixPrice(p.price))} no PIX</p>

                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-promo to-primary transition-all duration-700"
                      style={{ width: `${soldPct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {soldPct}% vendidos · restam {left} unidades
                  </p>
                </div>

                <button
                  onClick={() => add(p.id)}
                  className="btn-base btn-primary mt-4 w-full px-5 py-3 text-sm"
                >
                  Aproveitar oferta
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
