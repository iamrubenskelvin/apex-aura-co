import { useState } from "react";
import { Heart, Star } from "lucide-react";
import { brl, type Product } from "@/data/products";
import { useCart } from "./cart";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { add } = useCart();
  const [loaded, setLoaded] = useState(false);
  const [fav, setFav] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article
      className="surface-card group flex flex-col overflow-hidden p-4 sm:p-5"
      style={{ animation: `fade-up 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 80}ms both` }}
    >
      <div className="relative mb-5 aspect-square overflow-hidden rounded-xl bg-surface-2">
        {!loaded && <div className="skeleton absolute inset-0" aria-hidden="true" />}
        <img
          src={product.image}
          alt={`${product.name} — suplemento Forja Nutri`}
          width={800}
          height={800}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-contain p-4 transition-all duration-700 group-hover:scale-105 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {product.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
              product.badge.startsWith("-")
                ? "bg-promo text-promo-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {product.badge}
          </span>
        )}

        <button
          onClick={() => setFav((v) => !v)}
          aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={fav}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-background/70 backdrop-blur transition-all hover:scale-110"
        >
          <Heart
            className={`h-4 w-4 transition-all ${fav ? "scale-110 fill-promo text-promo" : "text-muted-foreground"}`}
          />
        </button>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{product.tag}</p>
      <h3 className="mt-2 min-w-0 text-base font-semibold leading-snug">{product.name}</h3>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
        <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
        <span>({product.reviews.toLocaleString("pt-BR")})</span>
      </div>

      <div className="mt-4 flex items-end gap-2">
        {product.oldPrice && (
          <span className="text-sm text-muted-foreground line-through">{brl(product.oldPrice)}</span>
        )}
        <span className="text-2xl font-bold tracking-tight text-primary">{brl(product.price)}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        12x de {brl(product.price / 12)} sem juros
      </p>

      <button
        onClick={handleAdd}
        className="btn-base btn-primary mt-5 w-full px-6 py-3.5 text-sm"
      >
        {added ? "Adicionado ✓" : "Comprar agora"}
      </button>
    </article>
  );
}
