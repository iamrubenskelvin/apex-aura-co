import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Check,
  CreditCard,
  Facebook,
  Heart,
  Link2,
  Lock,
  Minus,
  Package,
  Plus,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { brl, pixPrice, type Product } from "@/data/products";
import type { ProductDetail } from "@/data/product-details";
import { useCart } from "../cart";

const INSTALLMENTS = 12;

type Selection = Record<string, string>;

export function BuyBox({
  product,
  detail,
  onSelectionChange,
}: {
  product: Product;
  detail: ProductDetail;
  onSelectionChange?: (label: string) => void;
}) {
  const { add, setOpen, wishlist, toggleWish } = useCart();
  const [selection, setSelection] = useState<Selection>(() =>
    Object.fromEntries(
      detail.variants.map((g) => [
        g.id,
        (g.options.find((o) => o.available && !o.priceDelta) ??
          g.options.find((o) => o.available) ??
          g.options[0])?.id ?? "",
      ]),
    ),
  );
  const [qty, setQty] = useState(1);
  const [shareOpen, setShareOpen] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  const fav = wishlist.includes(product.id);

  const chosen = useMemo(
    () =>
      detail.variants.map((g) => ({
        group: g,
        option: g.options.find((o) => o.id === selection[g.id]) ?? g.options[0],
      })),
    [detail.variants, selection],
  );

  const variantLabel = chosen
    .map(({ group, option }) => (option ? `${group.label}: ${option.label}` : ""))
    .filter(Boolean)
    .join(" • ");

  const priceDelta = chosen.reduce((sum, c) => sum + (c.option?.priceDelta ?? 0), 0);
  const price = Math.max(0, product.price + priceDelta);
  const oldPrice = product.oldPrice ? product.oldPrice + priceDelta : undefined;
  const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0;

  const variantStock = chosen.reduce<number | undefined>(
    (min, c) => (c.option?.stock === undefined ? min : Math.min(min ?? Infinity, c.option.stock)),
    undefined,
  );
  const stock = variantStock ?? product.stockLeft ?? 0;
  const soldOut = stock <= 0;
  const lowStock = !soldOut && stock <= 15;
  const maxQty = Math.min(detail.maxPerOrder ?? 99, stock || 1);

  const sku = `${detail.sku}${chosen.map((c) => (c.option ? `-${c.option.id.toUpperCase()}` : "")).join("")}`;

  useEffect(() => {
    onSelectionChange?.(variantLabel);
  }, [variantLabel, onSelectionChange]);

  useEffect(() => {
    setQty((q) => Math.min(Math.max(1, q), Math.max(1, maxQty)));
  }, [maxQty]);

  useEffect(() => {
    const el = buyRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([entry]) => setShowSticky(!(entry?.isIntersecting ?? true)), {
      threshold: 0,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const addToCart = () => {
    if (soldOut) return false;
    add({
      productId: product.id,
      name: product.name,
      image: product.image,
      price,
      qty,
      variant: variantLabel || undefined,
      sku,
    });
    return true;
  };

  const handleAdd = () => {
    if (!addToCart()) return;
    toast.success("Produto adicionado ao carrinho.", {
      description: `${product.name}${variantLabel ? ` — ${variantLabel}` : ""}`,
    });
  };

  const handleBuyNow = () => {
    if (!addToCart()) return;
    setOpen(true);
    toast.success("Item reservado. Finalize sua compra.");
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: product.name, url: shareUrl });
        return;
      } catch {
        /* usuário cancelou */
      }
    }
    setShareOpen((v) => !v);
  };

  return (
    <div className="min-w-0">
      {/* IDENTIFICAÇÃO */}
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{product.brand}</p>
      <h1 className="text-display mt-2 text-2xl leading-tight sm:text-3xl lg:text-4xl">{product.name}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="flex" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(product.rating) ? "fill-primary text-primary" : "text-muted-foreground/40"
                }`}
              />
            ))}
          </span>
          <span className="font-semibold text-foreground">
            {product.rating.toFixed(1).replace(".", ",")}
          </span>
          <a href="#avaliacoes" className="underline-offset-4 hover:text-primary hover:underline">
            ({product.reviews.toLocaleString("pt-BR")} avaliações)
          </a>
        </span>
        <span>Categoria: {product.category}</span>
        <span className="truncate">SKU: {sku}</span>
      </div>

      {detail.badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {detail.badges.map((b) => (
            <span
              key={b}
              className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary"
            >
              {b}
            </span>
          ))}
        </div>
      )}

      <p className="mt-4 flex items-center gap-2 text-sm font-semibold">
        {soldOut ? (
          <span className="text-destructive">Produto esgotado</span>
        ) : lowStock ? (
          <span className="text-promo">Estoque baixo — restam {stock} unidades</span>
        ) : (
          <span className="text-primary">
            <Check className="mr-1 inline h-4 w-4" />
            Produto disponível
          </span>
        )}
      </p>

      {/* PREÇO */}
      <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
        {oldPrice && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground line-through">{brl(oldPrice)}</span>
            <span className="rounded-full bg-promo px-2.5 py-0.5 text-xs font-bold text-promo-foreground">
              -{discount}%
            </span>
          </div>
        )}
        <p className="mt-1 text-4xl font-bold tracking-tight">{brl(price)}</p>
        <p className="mt-2 text-base font-semibold text-primary">
          {brl(pixPrice(price))} <span className="text-sm font-medium">no PIX (10% off)</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          ou em até {INSTALLMENTS}x de {brl(price / INSTALLMENTS)} sem juros no cartão
        </p>
      </div>

      {/* VARIAÇÕES */}
      {detail.variants.map((group) => (
        <fieldset key={group.id} className="mt-6">
          <legend className="text-sm font-semibold">
            {group.label}:{" "}
            <span className="text-muted-foreground">
              {group.options.find((o) => o.id === selection[group.id])?.label}
            </span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.options.map((o) => {
              const active = selection[group.id] === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  disabled={!o.available}
                  aria-pressed={active}
                  onClick={() => setSelection((prev) => ({ ...prev, [group.id]: o.id }))}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  } ${!o.available ? "cursor-not-allowed line-through opacity-40 hover:border-border" : ""}`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {/* QUANTIDADE + AÇÕES */}
      <div ref={buyRef} className="mt-6">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <div className="inline-flex shrink-0 items-center rounded-full border border-border">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Diminuir quantidade"
              className="grid h-12 w-12 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-base font-bold" aria-live="polite">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty}
              aria-label="Aumentar quantidade"
              className="grid h-12 w-12 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="min-w-0 text-xs text-muted-foreground">
            {soldOut
              ? "Sem estoque no momento."
              : `Limite de ${maxQty} unidades por pedido.`}
          </p>
        </div>

        <button
          onClick={handleBuyNow}
          disabled={soldOut}
          className="btn-base btn-primary mt-4 w-full px-8 py-5 text-base uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Zap className="h-5 w-5" />
          {soldOut ? "Produto esgotado" : "Comprar agora"}
        </button>
        <button
          onClick={handleAdd}
          disabled={soldOut}
          className="btn-base btn-ghost-outline mt-3 w-full px-8 py-4 text-sm uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingCart className="h-4 w-4" />
          Adicionar ao carrinho
        </button>

        <div className="relative mt-3 flex gap-3">
          <button
            onClick={() => {
              toggleWish(product.id);
              toast.success(fav ? "Removido dos favoritos." : "Salvo nos favoritos.");
            }}
            aria-pressed={fav}
            className="btn-base flex-1 border border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
          >
            <Heart className={`h-4 w-4 ${fav ? "fill-promo text-promo" : ""}`} />
            {fav ? "Favoritado" : "Favoritar"}
          </button>
          <button
            onClick={handleShare}
            className="btn-base flex-1 border border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </button>

          {shareOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-56 animate-[fade-up_0.2s_ease-out] rounded-2xl border border-border bg-surface p-2 shadow-[var(--shadow-soft)]">
              {[
                {
                  label: "WhatsApp",
                  icon: Share2,
                  href: `https://wa.me/?text=${encodeURIComponent(`${product.name} — ${shareUrl}`)}`,
                },
                {
                  label: "Facebook",
                  icon: Facebook,
                  href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                },
                {
                  label: "X",
                  icon: Share2,
                  href: `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`,
                },
              ].map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-surface-2"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </a>
              ))}
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(shareUrl);
                  toast.success("Link copiado.");
                  setShareOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-surface-2"
              >
                <Link2 className="h-4 w-4 text-primary" />
                Copiar link
              </button>
            </div>
          )}
        </div>
      </div>

      <ShippingCalculator />

      <ul className="mt-6 grid grid-cols-2 gap-3">
        {[
          { icon: Truck, label: "Entrega rápida", text: "Postagem em 24h" },
          { icon: Lock, label: "Compra segura", text: "Site criptografado" },
          { icon: CreditCard, label: "Pagamento protegido", text: "Antifraude ativo" },
          { icon: BadgeCheck, label: "Produto original", text: "Laudo por lote" },
        ].map(({ icon: Icon, label, text }) => (
          <li key={label} className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-surface p-3">
            <Icon className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold">{label}</span>
              <span className="block truncate text-[11px] text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ul>

      {/* BARRA FIXA MOBILE */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl transition-transform duration-300 lg:hidden ${
          showSticky ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-none">{brl(price)}</p>
            <p className="mt-1 truncate text-[11px] text-primary">{brl(pixPrice(price))} no PIX</p>
          </div>
          <button
            onClick={handleBuyNow}
            disabled={soldOut}
            className="btn-base btn-primary shrink-0 px-6 py-3.5 text-sm uppercase disabled:opacity-40"
          >
            {soldOut ? "Esgotado" : "Comprar agora"}
          </button>
        </div>
      </div>
    </div>
  );
}

type ShippingQuote = { carrier: string; service: string; eta: string; price: number };

function ShippingCalculator() {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<ShippingQuote[] | null>(null);
  const [error, setError] = useState("");

  const digits = cep.replace(/\D/g, "");

  const calc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (digits.length !== 8) {
      setError("Digite um CEP válido com 8 dígitos.");
      return;
    }
    setError("");
    setLoading(true);
    // Estrutura pronta para integração real (Correios/Melhor Envio).
    // Enquanto não houver integração configurada, exibimos a tabela padrão da loja.
    await new Promise((r) => setTimeout(r, 700));
    setQuotes([
      { carrier: "Correios", service: "PAC", eta: "5 a 8 dias úteis", price: 18.9 },
      { carrier: "Correios", service: "SEDEX", eta: "2 a 4 dias úteis", price: 29.9 },
      { carrier: "Transportadora", service: "Expressa", eta: "1 a 2 dias úteis", price: 39.9 },
    ]);
    setLoading(false);
  };

  return (
    <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Package className="h-4 w-4 text-primary" />
        Calcular frete e prazo
      </h2>
      <form onSubmit={calc} className="mt-3 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="cep" className="sr-only">
          Digite seu CEP
        </label>
        <input
          id="cep"
          inputMode="numeric"
          value={cep}
          onChange={(e) => setCep(e.target.value.replace(/[^\d-]/g, "").slice(0, 9))}
          placeholder="Digite seu CEP"
          className="min-w-0 flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm outline-none transition-colors focus:border-primary/60"
        />
        <button type="submit" disabled={loading} className="btn-base btn-primary px-6 py-3 text-sm">
          {loading ? "Calculando..." : "Calcular frete"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {quotes && (
        <ul className="mt-4 divide-y divide-border">
          {quotes.map((q) => (
            <li key={q.service} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2.5 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-semibold">
                  {q.service} — {q.carrier}
                </span>
                <span className="block text-xs text-muted-foreground">{q.eta}</span>
              </span>
              <span className="shrink-0 self-center font-bold text-primary">{brl(q.price)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
