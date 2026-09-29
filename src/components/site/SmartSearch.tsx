import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock, Flame, Search, X } from "lucide-react";
import { initialCatalogSearch } from "@/components/catalog/search-params";
import { brl } from "@/data/products";
import { popularProducts, searchSuggestions } from "@/data/catalog";
import { popularSearches } from "@/data/products";

const RECENT_KEY = "forja:recent-searches";

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function SmartSearch({ autoFocus = false, onClose }: { autoFocus?: boolean; onClose?: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecent(readRecent());
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const q = query.trim();
  const results = useMemo(() => searchSuggestions(q), [q]);
  const empty = !!q && !results.produtos.length && !results.categorias.length && !results.marcas.length;

  const persist = (list: string[]) => {
    setRecent(list);
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch {
      /* storage indisponível */
    }
  };

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  const submit = (term: string) => {
    const value = term.trim();
    if (!value) return;
    persist([value, ...recent.filter((r) => r !== value)].slice(0, 6));
    close();
    navigate({ to: "/buscar", search: { q: value } as never });
  };

  return (
    <div ref={wrapRef} className="relative min-w-0">
      <label className="sr-only" htmlFor="busca">
        Buscar produtos
      </label>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        role="search"
        className="group flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-2.5 transition-colors focus-within:border-primary/60"
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <input
          id="busca"
          type="search"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar whey, creatina, pré-treino..."
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {(query || onClose) && (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => {
              setQuery("");
              onClose?.();
            }}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-50 max-h-[70vh] animate-[fade-up_0.2s_ease-out] overflow-y-auto rounded-2xl border border-border bg-popover/95 p-4 shadow-[var(--shadow-soft)] backdrop-blur-xl">
          {!q && (
            <div className="space-y-5">
              {recent.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> Pesquisas recentes
                    </p>
                    <button
                      onClick={() => persist([])}
                      className="text-xs text-muted-foreground underline transition-colors hover:text-foreground"
                    >
                      Apagar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        onClick={() => submit(r)}
                        className="rounded-full bg-surface px-3 py-1.5 text-xs transition-colors hover:bg-surface-2"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Flame className="h-3.5 w-3.5 text-promo" /> Populares agora
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((r) => (
                    <button
                      key={r}
                      onClick={() => submit(r)}
                      className="rounded-full bg-surface px-3 py-1.5 text-xs transition-colors hover:bg-surface-2"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {q && (
            <div className="space-y-5">
              {results.produtos.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Produtos
                  </p>
                  <ul className="space-y-1">
                    {results.produtos.map((p) => (
                      <li key={p.id}>
                        <Link
                          to="/produtos/$slug"
                          params={{ slug: p.slug }}
                          onClick={close}
                          className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            width={48}
                            height={48}
                            loading="lazy"
                            className="h-12 w-12 shrink-0 rounded-lg bg-surface-2 object-contain p-1"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{p.name}</span>
                            <span className="block text-xs text-muted-foreground">{p.brand}</span>
                          </span>
                          <span className="shrink-0 text-sm font-bold text-primary">{brl(p.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.categorias.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Categorias
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {results.categorias.map((c) => (
                      <Link
                        key={c.slug}
                        to="/categoria/$slug"
                        search={initialCatalogSearch}
                        params={{ slug: c.slug }}
                        onClick={close}
                        className="rounded-full bg-surface px-3 py-1.5 text-xs transition-colors hover:bg-surface-2"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.marcas.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Marcas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {results.marcas.map((b) => (
                      <Link
                        key={b.slug}
                        to="/marca/$slug"
                        search={initialCatalogSearch}
                        params={{ slug: b.slug }}
                        onClick={close}
                        className="rounded-full bg-surface px-3 py-1.5 text-xs transition-colors hover:bg-surface-2"
                      >
                        {b.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {empty ? (
                <div>
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Nada encontrado para “{query}”. Veja o que está em alta:
                  </p>
                  <ul className="space-y-1">
                    {popularProducts.slice(0, 4).map((p) => (
                      <li key={p.id}>
                        <Link
                          to="/produtos/$slug"
                          params={{ slug: p.slug }}
                          onClick={close}
                          className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            width={40}
                            height={40}
                            loading="lazy"
                            className="h-10 w-10 shrink-0 rounded-lg bg-surface-2 object-contain p-1"
                          />
                          <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <button
                  onClick={() => submit(query)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface px-4 py-3 text-sm font-semibold transition-colors hover:text-primary"
                >
                  Ver todos os resultados <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
