import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "./cart";
import { SmartSearch } from "./SmartSearch";

const nav = [
  { label: "Início", href: "#topo" },
  { label: "Suplementos", href: "#produtos" },
  { label: "Objetivos", href: "#categorias" },
  { label: "Marcas", href: "#marcas" },
  { label: "Promoções", href: "#ofertas" },
  { label: "Blog", href: "#newsletter" },
  { label: "Contato", href: "#rodape" },
];

export function Header() {
  const { count, wishlist } = useCart();
  const [open, setOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header id="topo" className="sticky top-0 z-50">
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
        className={`transition-all duration-300 ${
          scrolled
            ? "border-b border-border bg-background/70 backdrop-blur-xl backdrop-saturate-150"
            : "bg-background"
        }`}
      >
        <div
          className={`mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 transition-all duration-300 lg:px-8 ${
            scrolled ? "py-2" : "py-4"
          }`}
        >
          <a href="#topo" className="flex shrink-0 items-center gap-2" aria-label="Forja Nutri — início">
            <svg
              viewBox="0 0 40 40"
              role="img"
              aria-hidden="true"
              className={`shrink-0 transition-all duration-300 ${scrolled ? "h-8 w-8" : "h-9 w-9"}`}
            >
              <rect width="40" height="40" rx="12" fill="var(--primary)" />
              <path
                d="M13 29V11h15v4.6h-9.6v3.2H27v4.6h-8.6V29z"
                fill="var(--primary-foreground)"
              />
            </svg>
            <span
              className={`text-display transition-all duration-300 ${scrolled ? "text-base sm:text-lg" : "text-lg sm:text-xl"}`}
            >
              Forja<span className="text-primary">Nutri</span>
            </span>
          </a>

          <nav
            className="hidden min-w-0 items-center justify-center gap-6 text-sm font-medium text-muted-foreground xl:flex"
            aria-label="Principal"
          >
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative py-1 transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden min-w-0 xl:hidden lg:block lg:w-64">
            <SmartSearch />
          </div>

          <nav className="flex shrink-0 items-center gap-1" aria-label="Ações">
            <div className="hidden w-72 xl:block">
              <SmartSearch />
            </div>
            <button
              onClick={() => setMobileSearch((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-all hover:scale-110 hover:bg-surface hover:text-foreground lg:hidden"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="hidden h-10 w-10 place-items-center rounded-full text-muted-foreground transition-all hover:scale-110 hover:bg-surface hover:text-foreground sm:grid"
              aria-label="Minha conta"
            >
              <User className="h-5 w-5" />
            </button>
            <button
              className="relative hidden h-10 w-10 place-items-center rounded-full text-muted-foreground transition-all hover:scale-110 hover:bg-surface hover:text-foreground sm:grid"
              aria-label={`Lista de desejos com ${wishlist.length} itens`}
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-promo px-1 text-[11px] font-bold text-promo-foreground">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button
              className="relative grid h-10 w-10 place-items-center rounded-full text-foreground transition-all hover:scale-110 hover:bg-surface"
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
              className="grid h-10 w-10 place-items-center rounded-full text-foreground transition-all hover:bg-surface xl:hidden"
              aria-label="Abrir menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>
        </div>

        {mobileSearch && (
          <div className="animate-[fade-up_0.2s_ease-out] px-5 pb-4 lg:hidden">
            <SmartSearch autoFocus onClose={() => setMobileSearch(false)} />
          </div>
        )}
      </div>

      {open && (
        <div className="animate-[fade-up_0.25s_ease-out] border-b border-border bg-background/95 px-5 pb-6 pt-2 backdrop-blur-xl xl:hidden">
          <div className="grid grid-cols-2 gap-2">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl bg-surface px-4 py-3 text-sm font-medium transition-colors hover:bg-surface-2"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
