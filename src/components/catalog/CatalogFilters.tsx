import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, Star } from "lucide-react";
import { brl } from "@/data/products";
import { priceBounds, type Facets, type FacetItem } from "@/data/catalog";
import { toggleInList, type CatalogSearch, type MultiKey } from "./search-params";

export type FilterGroupKey = MultiKey | "preco" | "nota" | "disponibilidade" | "promocao";

const ALL_GROUPS: FilterGroupKey[] = [
  "categoria",
  "subcategoria",
  "marca",
  "preco",
  "objetivo",
  "tipo",
  "sabor",
  "peso",
  "nota",
  "disponibilidade",
  "promocao",
];

const LABELS: Record<FilterGroupKey, string> = {
  categoria: "Categoria",
  subcategoria: "Subcategoria",
  marca: "Marca",
  preco: "Preço",
  objetivo: "Objetivo",
  tipo: "Tipo de suplemento",
  sabor: "Sabor",
  peso: "Peso / tamanho",
  nota: "Avaliação",
  disponibilidade: "Disponibilidade",
  promocao: "Promoção",
};

function Accordion({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function CheckList({
  name,
  items,
  selected,
  onToggle,
}: {
  name: string;
  items: FacetItem[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 6);
  if (!items.length) return <p className="text-xs text-muted-foreground">Sem opções disponíveis.</p>;
  return (
    <div className="space-y-2.5">
      {visible.map((item) => {
        const id = `${name}-${item.value}`;
        return (
          <div key={item.value} className="flex items-center gap-3">
            <input
              id={id}
              type="checkbox"
              checked={selected.includes(item.value)}
              onChange={() => onToggle(item.value)}
              className="h-4 w-4 shrink-0 cursor-pointer accent-[var(--primary)]"
            />
            <label
              htmlFor={id}
              className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="truncate">{item.label}</span>
              <span className="shrink-0 text-xs opacity-70">({item.count})</span>
            </label>
          </div>
        );
      })}
      {items.length > 6 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-semibold text-primary transition-opacity hover:opacity-80"
        >
          {expanded ? "Ver menos" : `Ver mais ${items.length - 6}`}
        </button>
      )}
    </div>
  );
}

function PriceFilter({
  min,
  max,
  onApply,
}: {
  min: number | undefined;
  max: number | undefined;
  onApply: (min: number | undefined, max: number | undefined) => void;
}) {
  const [lo, setLo] = useState(min ?? priceBounds.min);
  const [hi, setHi] = useState(max ?? priceBounds.max);

  useEffect(() => {
    setLo(min ?? priceBounds.min);
    setHi(max ?? priceBounds.max);
  }, [min, max]);

  const commit = (nextLo: number, nextHi: number) => {
    const a = Math.max(priceBounds.min, Math.min(nextLo, nextHi));
    const b = Math.min(priceBounds.max, Math.max(nextLo, nextHi));
    onApply(a > priceBounds.min ? a : undefined, b < priceBounds.max ? b : undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{brl(lo)}</span>
        <span>
          {brl(hi)}
          {hi >= priceBounds.max ? "+" : ""}
        </span>
      </div>
      <label className="sr-only" htmlFor="preco-slider">
        Preço máximo
      </label>
      <input
        id="preco-slider"
        type="range"
        min={priceBounds.min}
        max={priceBounds.max}
        step={10}
        value={hi}
        onChange={(e) => setHi(Number(e.target.value))}
        onMouseUp={() => commit(lo, hi)}
        onTouchEnd={() => commit(lo, hi)}
        onKeyUp={() => commit(lo, hi)}
        className="w-full cursor-pointer accent-[var(--primary)]"
      />
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="preco-min">
            Preço mínimo
          </label>
          <input
            id="preco-min"
            type="number"
            inputMode="numeric"
            value={lo}
            min={priceBounds.min}
            max={priceBounds.max}
            onChange={(e) => setLo(Number(e.target.value))}
            onBlur={() => commit(lo, hi)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary/60"
          />
        </div>
        <span className="text-muted-foreground">—</span>
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="preco-max">
            Preço máximo
          </label>
          <input
            id="preco-max"
            type="number"
            inputMode="numeric"
            value={hi}
            min={priceBounds.min}
            max={priceBounds.max}
            onChange={(e) => setHi(Number(e.target.value))}
            onBlur={() => commit(lo, hi)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary/60"
          />
        </div>
      </div>
    </div>
  );
}

export function CatalogFilters({
  facets,
  search,
  patch,
  hide = [],
}: {
  facets: Facets;
  search: CatalogSearch;
  patch: (p: Partial<CatalogSearch>) => void;
  hide?: FilterGroupKey[];
}) {
  const groups = ALL_GROUPS.filter((g) => !hide.includes(g));

  const facetFor = (key: MultiKey): FacetItem[] => {
    switch (key) {
      case "categoria":
        return facets.categorias;
      case "subcategoria":
        return facets.subcategorias;
      case "marca":
        return facets.marcas;
      case "objetivo":
        return facets.objetivos;
      case "tipo":
        return facets.tipos;
      case "sabor":
        return facets.sabores;
      case "peso":
        return facets.pesos;
    }
  };

  const toggle = (key: MultiKey, value: string) =>
    patch({ [key]: toggleInList(search[key], value), pagina: 1 } as Partial<CatalogSearch>);

  return (
    <div>
      {groups.map((group) => {
        if (group === "preco") {
          return (
            <Accordion key={group} title={LABELS[group]}>
              <PriceFilter
                min={search.preco_min}
                max={search.preco_max}
                onApply={(lo, hi) => patch({ preco_min: lo, preco_max: hi, pagina: 1 })}
              />
            </Accordion>
          );
        }
        if (group === "nota") {
          return (
            <Accordion key={group} title={LABELS[group]} defaultOpen={false}>
              <div className="space-y-2">
                {[5, 4, 3, 2].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => patch({ nota: search.nota === n ? undefined : n, pagina: 1 })}
                    aria-pressed={search.nota === n}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                      search.nota === n ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:bg-surface"
                    }`}
                  >
                    <span className="flex" aria-hidden="true">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < n ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                        />
                      ))}
                    </span>
                    <span>{n === 5 ? "5 estrelas" : `${n} ou mais`}</span>
                  </button>
                ))}
              </div>
            </Accordion>
          );
        }
        if (group === "disponibilidade") {
          return (
            <Accordion key={group} title={LABELS[group]} defaultOpen={false}>
              <div className="flex gap-2">
                {[
                  { label: "Todos", value: false },
                  { label: "Disponível", value: true },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => patch({ disponivel: opt.value, pagina: 1 })}
                    aria-pressed={search.disponivel === opt.value}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      search.disponivel === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-muted-foreground hover:bg-surface-2"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Accordion>
          );
        }
        if (group === "promocao") {
          return (
            <Accordion key={group} title={LABELS[group]} defaultOpen={false}>
              <div className="flex items-center gap-3">
                <input
                  id="filtro-promo"
                  type="checkbox"
                  checked={search.promo}
                  onChange={() => patch({ promo: !search.promo, pagina: 1 })}
                  className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
                />
                <label htmlFor="filtro-promo" className="cursor-pointer text-sm text-muted-foreground">
                  Somente produtos em promoção
                </label>
              </div>
            </Accordion>
          );
        }
        const items = facetFor(group);
        if (!items.length) return null;
        return (
          <Accordion key={group} title={LABELS[group]} defaultOpen={group === "categoria" || group === "marca"}>
            <CheckList
              name={group}
              items={items}
              selected={search[group] ? search[group].split(",") : []}
              onToggle={(v) => toggle(group, v)}
            />
          </Accordion>
        );
      })}
    </div>
  );
}
