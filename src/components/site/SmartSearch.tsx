import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Flame, Search, X } from "lucide-react";
import { brands, brl, categories, popularSearches, products } from "@/data/products";

const RECENT = ["Creatina", "Whey isolado", "BCAA"];

export function SmartSearch({ autoFocus = false, onClose }: { autoFocus?: boolean; onClose?: () => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return { produtos: [], cats: [], marcas: [] };
    return {
      produtos: products
        .filter((p) => (p.name + p.brand + p.category + p.tag).toLowerCase().includes(q))
        .slice(0, 5),
      cats: categories.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4),
      marcas: brands.filter((b) => b.toLowerCase().includes(q)).slice(0, 4),
    };
  }, [q]);

  const empty = q && !results.produtos.length && !results.cats.length && !results.marcas.length;

  return (
    <div ref={wrapRef} className="relative min-w-0">
      <label className="sr-only" htmlFor="busca">
        Buscar produtos
      </label>
      <div className="group flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-2.5 transition-colors focus-within:border-primary/60">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <input
          id="busca"
          type="search"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-50 max-h-[70vh] animate-[fade-up_0.2s_ease-out] overflow-y-auto rounded-2xl border border-border bg-popover/95 p-4 shadow-[var(--shadow-soft)] backdrop-blur-xl">
          {!q && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Pesquisas recentes
                </p>
                <div className="flex flex-wrap gap-2">
                  {RECENT.map((r) => (
                    <button
                      key={r}
                      onClick={() => setQuery(r)}
                      className="rounded-full bg-surface px-3 py-1.5 text-xs transition-colors hover:bg-surface-2"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Flame className="h-3.5 w-3.5 text-promo" /> Populares agora
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((r) => (
                    <button
                      key={r}
                      onClick={() => setQuery(r)}
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
                        <a
                          href="#produtos"
                          onClick={() => setOpen(false)}
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
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.cats.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Categorias
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {results.cats.map((c) => (
                      <a
                        key={c.name}
                        href="#categorias"
                        onClick={() => setOpen(false)}
                        className="rounded-full bg-surface px-3 py-1.5 text-xs transition-colors hover:bg-surface-2"
                      >
                        {c.name}
                      </a>
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
                      <a
                        key={b}
                        href="#marcas"
                        onClick={() => setOpen(false)}
                        className="rounded-full bg-surface px-3 py-1.5 text-xs transition-colors hover:bg-surface-2"
                      >
                        {b}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {empty && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nada encontrado para “{query}”. Tente “whey” ou “creatina”.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
