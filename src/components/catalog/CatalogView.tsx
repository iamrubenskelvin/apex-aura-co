import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, PackageSearch, SlidersHorizontal, X } from "lucide-react";
import {
  buildFacets,
  filterCatalog,
  sortCatalog,
  sortOptions,
  type CatalogProduct,
  type SortValue,
} from "@/data/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { CatalogFilters, type FilterGroupKey } from "./CatalogFilters";
import { QuickView } from "./QuickView";
import {
  clearedSearch,
  initialCatalogSearch,
  multiKeys,
  searchToFilters,
  toggleInList,
  type CatalogSearch,
  type MultiKey,
} from "./search-params";

function SkeletonCard() {
  return (
    <div className="surface-card flex h-full flex-col p-4 sm:p-5" aria-hidden="true">
      <div className="skeleton mb-5 aspect-square rounded-xl" />
      <div className="skeleton h-3 w-20 rounded-full" />
      <div className="skeleton mt-3 h-4 w-full rounded-full" />
      <div className="skeleton mt-2 h-4 w-2/3 rounded-full" />
      <div className="skeleton mt-4 h-6 w-28 rounded-full" />
      <div className="skeleton mt-5 h-11 w-full rounded-full" />
    </div>
  );
}

const CHIP_GROUP_LABEL: Record<MultiKey, string> = {
  categoria: "Categoria",
  subcategoria: "Subcategoria",
  marca: "Marca",
  objetivo: "Objetivo",
  tipo: "Tipo",
  sabor: "Sabor",
  peso: "Peso",
};

export function CatalogView({
  products,
  search,
  patch,
  hideFilters = [],
  emptyExtra,
}: {
  products: CatalogProduct[];
  search: CatalogSearch;
  patch: (p: Partial<CatalogSearch>) => void;
  hideFilters?: FilterGroupKey[];
  emptyExtra?: ReactNode;
}) {
  const isMobile = useIsMobile();
  const [mobileFilters, setMobileFilters] = useState(false);
  const [quick, setQuick] = useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [mobileExtraPages, setMobileExtraPages] = useState(0);

  const scopeFacets = useMemo(() => buildFacets(products), [products]);
  const filters = useMemo(() => searchToFilters(search), [search]);
  const filtered = useMemo(() => filterCatalog(products, filters), [products, filters]);
  const sorted = useMemo(() => sortCatalog(filtered, search.ordenar), [filtered, search.ordenar]);
  const facets = useMemo(() => buildFacets(filtered), [filtered]);

  const perPage = search.porPagina;
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const page = Math.min(search.pagina, totalPages);
  const start = (page - 1) * perPage;
  const visible = sorted.slice(0, start + perPage * (1 + mobileExtraPages));
  const pageItems = sorted.slice(start, start + perPage);

  const key = JSON.stringify(filters) + search.ordenar;
  useEffect(() => {
    setLoading(true);
    setMobileExtraPages(0);
    const t = window.setTimeout(() => setLoading(false), 220);
    return () => window.clearTimeout(t);
  }, [key]);

  useEffect(() => {
    if (mobileFilters) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFilters]);

  const labelFor = (group: MultiKey, value: string) => {
    const source = scopeFacets[
      group === "categoria"
        ? "categorias"
        : group === "subcategoria"
          ? "subcategorias"
          : group === "marca"
            ? "marcas"
            : group === "objetivo"
              ? "objetivos"
              : group === "tipo"
                ? "tipos"
                : group === "sabor"
                  ? "sabores"
                  : "pesos"
    ];
    return source.find((f) => f.value === value)?.label ?? value;
  };

  type Chip = { key: string; label: string; clear: () => void };
  const chips: Chip[] = [];
  for (const group of multiKeys) {
    if (hideFilters.includes(group)) continue;
    for (const value of search[group] ? search[group].split(",") : []) {
      chips.push({
        key: `${group}-${value}`,
        label: `${CHIP_GROUP_LABEL[group]}: ${labelFor(group, value)}`,
        clear: () => patch({ [group]: toggleInList(search[group], value), pagina: 1 } as Partial<CatalogSearch>),
      });
    }
  }
  if (search.preco_min !== undefined || search.preco_max !== undefined) {
    chips.push({
      key: "preco",
      label: `Preço: ${search.preco_min ?? 0} – ${search.preco_max ?? "∞"}`,
      clear: () => patch({ preco_min: undefined, preco_max: undefined, pagina: 1 }),
    });
  }
  if (search.nota !== undefined) {
    chips.push({
      key: "nota",
      label: `${search.nota}★ ou mais`,
      clear: () => patch({ nota: undefined, pagina: 1 }),
    });
  }
  if (search.disponivel) {
    chips.push({ key: "disp", label: "Disponível", clear: () => patch({ disponivel: false, pagina: 1 }) });
  }
  if (search.promo) {
    chips.push({ key: "promo", label: "Em promoção", clear: () => patch({ promo: false, pagina: 1 }) });
  }

  const clearAll = () => patch(clearedSearch);

  const pageNumbers = useMemo(() => {
    const out: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i += 1) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) out.push(i);
      else if (out[out.length - 1] !== "...") out.push("...");
    }
    return out;
  }, [totalPages, page]);

  const filtersNode = (
    <CatalogFilters facets={facets} search={search} patch={patch} hide={hideFilters} />
  );

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12">
        {/* FILTROS DESKTOP */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto pr-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest">Filtros</h2>
              {chips.length > 0 && (
                <button onClick={clearAll} className="text-xs font-semibold text-primary hover:opacity-80">
                  Limpar
                </button>
              )}
            </div>
            <div className="mt-2">{filtersNode}</div>
          </div>
        </aside>

        <div className="min-w-0">
          {/* BARRA DE CONTROLE */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              <span className="font-semibold text-foreground">{sorted.length}</span>{" "}
              {sorted.length === 1 ? "produto encontrado" : "produtos encontrados"}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFilters(true)}
                className="btn-base btn-ghost-outline px-4 py-2.5 text-xs lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtrar{chips.length ? ` (${chips.length})` : ""}
              </button>
              <label className="sr-only" htmlFor="ordenar">
                Ordenar por
              </label>
              <select
                id="ordenar"
                value={search.ordenar}
                onChange={(e) => patch({ ordenar: e.target.value as SortValue, pagina: 1 })}
                className="rounded-full border border-border bg-surface px-4 py-2.5 text-xs font-medium outline-none transition-colors focus:border-primary/60"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CHIPS */}
          {chips.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button
                  key={c.key}
                  onClick={c.clear}
                  className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  {c.label}
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">Remover filtro</span>
                </button>
              ))}
              <button onClick={clearAll} className="text-xs font-semibold text-primary hover:opacity-80">
                Limpar todos
              </button>
            </div>
          )}

          {/* GRID */}
          {loading ? (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="mt-12 grid place-items-center rounded-3xl border border-border bg-surface px-6 py-16 text-center">
              <PackageSearch className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <h2 className="text-display mt-5 text-2xl">Nenhum produto encontrado</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Tente remover alguns filtros ou realizar uma nova busca.
              </p>
              <button onClick={clearAll} className="btn-base btn-primary mt-6 px-8 py-3.5 text-sm">
                Limpar filtros
              </button>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {scopeFacets.categorias.slice(0, 6).map((c) => (
                  <Link
                    key={c.value}
                    to="/categoria/$slug"
                    search={initialCatalogSearch}
                    params={{ slug: c.value }}
                    className="rounded-full bg-surface-2 px-4 py-2 text-xs transition-colors hover:text-primary"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
              {emptyExtra}
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {(isMobile ? visible : pageItems).map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} onQuickView={() => setQuick(p)} />
                ))}
              </div>

              {/* CARREGAR MAIS (mobile) */}
              {visible.length < sorted.length && (
                <div className="mt-10 sm:hidden">
                  <button
                    onClick={() => setMobileExtraPages((v) => v + 1)}
                    className="btn-base btn-ghost-outline w-full px-6 py-3.5 text-sm"
                  >
                    Carregar mais produtos
                  </button>
                </div>
              )}

              {/* PAGINAÇÃO (desktop/tablet) */}
              {totalPages > 1 && (
                <nav
                  aria-label="Paginação"
                  className="mt-12 hidden flex-wrap items-center justify-center gap-2 sm:flex"
                >
                  <button
                    onClick={() => patch({ pagina: Math.max(1, page - 1) })}
                    disabled={page === 1}
                    className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {pageNumbers.map((n, i) =>
                    n === "..." ? (
                      <span key={`gap-${i}`} className="px-2 text-sm text-muted-foreground">
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => patch({ pagina: n })}
                        aria-current={n === page ? "page" : undefined}
                        className={`h-10 min-w-10 rounded-full px-3 text-sm font-semibold transition-colors ${
                          n === page
                            ? "bg-primary text-primary-foreground"
                            : "border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {n}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => patch({ pagina: Math.min(totalPages, page + 1) })}
                    disabled={page === totalPages}
                    className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                    aria-label="Próxima página"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {/* FILTROS MOBILE */}
      {mobileFilters && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filtros"
          className="fixed inset-0 z-[70] flex items-end bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileFilters(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setMobileFilters(false);
          }}
        >
          <div className="max-h-[88vh] w-full animate-[fade-up_0.25s_ease-out] overflow-y-auto rounded-t-3xl border-t border-border bg-background p-5 pb-32">
            <div className="flex items-center justify-between">
              <h2 className="text-display text-lg">Filtrar</h2>
              <button
                onClick={() => setMobileFilters(false)}
                aria-label="Fechar filtros"
                className="grid h-9 w-9 place-items-center rounded-full bg-surface text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2">{filtersNode}</div>
            <div className="fixed inset-x-0 bottom-0 flex gap-3 border-t border-border bg-background/95 p-4 backdrop-blur-xl">
              <button
                onClick={() => {
                  clearAll();
                  setMobileFilters(false);
                }}
                className="btn-base btn-ghost-outline flex-1 px-4 py-3.5 text-sm"
              >
                Limpar filtros
              </button>
              <button
                onClick={() => setMobileFilters(false)}
                className="btn-base btn-primary flex-1 px-4 py-3.5 text-sm"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {quick && <QuickView product={quick} onClose={() => setQuick(null)} />}
    </div>
  );
}
