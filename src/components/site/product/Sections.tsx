import { useState } from "react";
import { AlertTriangle, Check, ChevronDown, FlaskConical, Info, Leaf, Utensils } from "lucide-react";
import type { ProductDetail } from "@/data/product-details";

function SectionTitle({ kicker, title }: { kicker?: string; title: string }) {
  return (
    <div className="min-w-0">
      {kicker && (
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{kicker}</p>
      )}
      <h2 className="text-display mt-2 text-2xl sm:text-3xl">{title}</h2>
    </div>
  );
}

export function Highlights({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
      <SectionTitle kicker="Diferenciais" title="Por que escolher" />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((h) => (
          <li key={h} className="flex min-w-0 items-start gap-3 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0">{h}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function About({ about }: { about: ProductDetail["about"] }) {
  if (!about.intro) return null;
  return (
    <section id="descricao" className="min-w-0">
      <SectionTitle kicker="Descrição completa" title="Sobre o produto" />
      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {about.intro}
      </p>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {[
          { title: "Indicado para", items: about.indicatedFor },
          { title: "Características", items: about.features },
          { title: "Nossos diferenciais", items: about.differentials },
        ]
          .filter((b) => b.items.length > 0)
          .map((block) => (
            <div key={block.title} className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
                {block.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {block.items.map((item) => (
                  <li key={item} className="flex min-w-0 items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </section>
  );
}

export function Nutrition({
  rows,
  serving,
  aminos,
}: {
  rows?: ProductDetail["nutrition"];
  serving?: string;
  aminos?: ProductDetail["aminoAcids"];
}) {
  if (!rows || rows.length === 0) return null;
  return (
    <section id="nutricional" className="min-w-0">
      <SectionTitle kicker="Tabela oficial do fabricante" title="Informação nutricional" />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <FlaskConical className="h-4 w-4 text-primary" />
              {serving ?? "Porção"}
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Nutriente</th>
                <th className="px-3 py-3 text-right font-semibold">Qtd.</th>
                <th className="px-5 py-3 text-right font-semibold">%VD*</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 text-muted-foreground">{r.label}</td>
                  <td className="px-3 py-3 text-right font-semibold">{r.amount}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">{r.vd ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-5 py-4 text-[11px] leading-relaxed text-muted-foreground">
            *Percentual de valores diários fornecidos pela porção, com base em uma dieta de 2.000 kcal
            ou 8.400 kJ. Seus valores diários podem ser maiores ou menores dependendo das suas
            necessidades energéticas.
          </p>
        </div>

        {aminos && aminos.length > 0 && (
          <div className="min-w-0">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
              Perfil de aminoácidos
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {aminos.map((a) => (
                <li key={a.label} className="min-w-0 rounded-2xl border border-border bg-surface p-4">
                  <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">
                    {a.label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-primary">{a.amount}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export function Composition({
  ingredients,
  allergens,
  usage,
  warnings,
  storage,
}: {
  ingredients?: string;
  allergens?: string[];
  usage?: string;
  warnings?: string[];
  storage?: string;
}) {
  if (!ingredients && !usage && !warnings?.length) return null;
  return (
    <section className="grid gap-5 lg:grid-cols-3">
      {ingredients && (
        <article className="min-w-0 rounded-2xl border border-border bg-surface p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <Leaf className="h-4 w-4" />
            Ingredientes
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{ingredients}</p>
          {allergens && allergens.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {allergens.map((a) => (
                <li
                  key={a}
                  className="rounded-full border border-promo/50 bg-promo/10 px-3 py-1 text-[11px] font-semibold text-promo"
                >
                  {a}
                </li>
              ))}
            </ul>
          )}
        </article>
      )}

      {usage && (
        <article className="min-w-0 rounded-2xl border border-border bg-surface p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <Utensils className="h-4 w-4" />
            Como consumir
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{usage}</p>
        </article>
      )}

      {(warnings?.length || storage) && (
        <article className="min-w-0 rounded-2xl border border-border bg-surface/60 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Advertências
          </h2>
          <ul className="mt-4 space-y-3">
            {warnings?.map((w) => (
              <li key={w} className="flex min-w-0 items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0">{w}</span>
              </li>
            ))}
            {storage && (
              <li className="flex min-w-0 items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0">
                  <strong className="font-semibold text-foreground">Conservação:</strong> {storage}
                </span>
              </li>
            )}
          </ul>
        </article>
      )}
    </section>
  );
}

export function Faq({ items }: { items: ProductDetail["faq"] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (items.length === 0) return null;
  return (
    <section id="faq" className="min-w-0">
      <SectionTitle kicker="Tire suas dúvidas" title="Perguntas frequentes" />
      <div className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2"
              >
                <span className="min-w-0 text-sm font-semibold">{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-primary transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="animate-[fade-up_0.25s_ease-out] px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
