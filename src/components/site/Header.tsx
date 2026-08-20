import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "./cart";
import { categories } from "@/data/products";

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="overflow-hidden border-b border-border bg-surface">
        <div className="flex w-max animate-[marquee_32s_linear_infinite] gap-12 py-2 text-xs font-medium tracking-wide text-muted-foreground">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 gap-12 pr-12">
              <span>Frete grátis acima de R$ 199</span>
              <span>Até 12x sem juros</span>
              <span>Envio em até 24h</span>
              <span>Produtos com laudo de pureza</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`transition-colors duration-300 ${
          scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border" : "bg-background"
        }`}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:px-8">
          <a href="#" className="flex shrink-0 items-center gap-2" aria-label="Forja Nutri — início">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground text-display text-lg">
              F
            </span>
            <span className="text-display text-lg sm:text-xl">
              Forja<span className="text-primary">Nutri</span>
            </span>
          </a>

          <div className="hidden min-w-0 lg:block">
            <label className="sr-only" htmlFor="busca">
              Buscar produtos
            </label>
            <div className="group flex items-center gap-3 rounded-full border border-border bg-surface px-5 py-3 transition-colors focus-within:border-primary/60">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                id="busca"
                type="search"
                placeholder="Buscar whey, creatina, pré-treino..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <nav className="flex shrink-0 items-center gap-1" aria-label="Ações">
            <button
              className="grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-all hover:scale-110 hover:bg-surface hover:text-foreground lg:hidden"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="hidden h-11 w-11 place-items-center rounded-full text-muted-foreground transition-all hover:scale-110 hover:bg-surface hover:text-foreground sm:grid"
              aria-label="Minha conta"
            >
              <User className="h-5 w-5" />
            </button>
            <button
              className="relative grid h-11 w-11 place-items-center rounded-full text-foreground transition-all hover:scale-110 hover:bg-surface"
              aria-label={`Carrinho com ${count} itens`}
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 animate-[scale-in_0.2s_ease-out] place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-full text-foreground transition-all hover:bg-surface xl:hidden"
              aria-label="Abrir menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>
        </div>

        <nav
          className="mx-auto hidden max-w-7xl gap-8 px-8 pb-4 text-sm font-medium text-muted-foreground xl:flex"
          aria-label="Categorias"
        >
          {categories.map((c) => (
            <a
              key={c.name}
              href="#produtos"
              className="relative py-1 transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100"
            >
              {c.name}
            </a>
          ))}
          <a href="#produtos" className="ml-auto font-semibold text-promo">
            Ofertas da semana
          </a>
        </nav>
      </div>

      {open && (
        <div className="animate-[fade-up_0.25s_ease-out] border-b border-border bg-background px-5 pb-6 xl:hidden">
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <a
                key={c.name}
                href="#produtos"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-surface px-4 py-3 text-sm font-medium transition-colors hover:bg-surface-2"
              >
                {c.name}
                <span className="ml-1 text-xs text-muted-foreground">{c.count}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
