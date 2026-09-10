import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, Star, X } from "lucide-react";
import { toast } from "sonner";
import { brl, pixPrice } from "@/data/products";
import { LOW_STOCK, type CatalogProduct } from "@/data/catalog";
import { useCart } from "@/components/site/cart";

export function QuickView({
  product,
  onClose,
}: {
  product: CatalogProduct;
  onClose: () => void;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [flavor, setFlavor] = useState(product.flavors[0] ?? "");
  const [weight, setWeight] = useState(product.weights[0] ?? "");
  const soldOut = product.stock <= 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleAdd = () => {
    const variant = [flavor, weight].filter(Boolean).join(" · ");
    add({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty,
      variant: variant || undefined,
      sku: product.sku,
    });
    toast.success("Produto adicionado ao carrinho.");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Visualização rápida de ${product.name}`}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-3xl animate-[fade-up_0.25s_ease-out] overflow-y-auto rounded-t-3xl border border-border bg-background p-5 sm:rounded-3xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{product.brand}</p>
          <button
            onClick={onClose}
            aria-label="Fechar visualização rápida"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-2xl bg-surface-2">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain p-6"
              loading="lazy"
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-display text-xl sm:text-2xl">{product.name}</h2>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="flex" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                  />
                ))}
              </span>
              <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
              <span>({product.reviews.toLocaleString("pt-BR")})</span>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">{product.description}</p>

            <div className="mt-4 flex items-end gap-2">
              {product.oldPrice && (
                <span className="text-sm text-muted-foreground line-through">{brl(product.oldPrice)}</span>
              )}
              <span className="text-2xl font-bold tracking-tight">{brl(product.price)}</span>
            </div>
            <p className="text-sm font-semibold text-primary">{brl(pixPrice(product.price))} no PIX</p>
            <p className="text-xs text-muted-foreground">12x de {brl(product.price / 12)} sem juros</p>

            {product.flavors.length > 1 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sabor</p>
                <div className="flex flex-wrap gap-2">
                  {product.flavors.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFlavor(f)}
                      aria-pressed={flavor === f}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        flavor === f ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:bg-surface-2"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.weights.length > 1 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tamanho</p>
                <div className="flex flex-wrap gap-2">
                  {product.weights.map((w) => (
                    <button
                      key={w}
                      onClick={() => setWeight(w)}
                      aria-pressed={weight === w}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        weight === w ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:bg-surface-2"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!soldOut && product.stock <= LOW_STOCK && (
              <p className="mt-4 text-xs font-semibold text-promo">Últimas unidades</p>
            )}

            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Diminuir quantidade"
                  className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-surface-2"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  aria-label="Aumentar quantidade"
                  className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-surface-2"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={soldOut}
                className="btn-base btn-primary flex-1 px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {soldOut ? "Esgotado" : "Adicionar ao carrinho"}
              </button>
            </div>

            <Link
              to="/produtos/$slug"
              params={{ slug: product.slug }}
              onClick={onClose}
              className="btn-base btn-ghost-outline mt-3 w-full px-6 py-3 text-sm"
            >
              Ver produto completo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
