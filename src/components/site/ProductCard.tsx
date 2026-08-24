import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { brl, pixPrice, type Product } from "@/data/products";
import { productSlug } from "@/data/product-details";
import { useCart } from "./cart";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add, wishlist, toggleWish } = useCart();
  const [loaded, setLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const fav = wishlist.includes(product.id);

  const handleAdd = () => {
    add({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article
      className="surface-card group flex h-full flex-col overflow-hidden p-4 sm:p-5"
      style={{ animation: `fade-up 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 70}ms both` }}
    >
      <div className="relative mb-5 aspect-square overflow-hidden rounded-xl bg-surface-2">
        {!loaded && <div className="skeleton absolute inset-0" aria-hidden="true" />}
        <Link
          to="/produtos/$slug"
          params={{ slug: productSlug(product) }}
          aria-label={`Ver ${product.name}`}
          className="block h-full w-full"
        >
          <img
            src={product.image}
            alt={`${product.name} — ${product.brand}`}
            width={800}
            height={800}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-contain p-4 transition-all duration-700 group-hover:scale-110 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </Link>


        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.badge && (
            <span className="rounded-full bg-promo px-3 py-1 text-xs font-bold text-promo-foreground">
              {product.badge}
            </span>
          )}
          {product.bestSeller && (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              Mais vendido
            </span>
          )}
        </div>

        <button
          onClick={() => toggleWish(product.id)}
          aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={fav}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-background/70 backdrop-blur transition-all hover:scale-110"
        >
          <Heart
            className={`h-4 w-4 transition-all ${fav ? "scale-110 fill-promo text-promo" : "text-muted-foreground"}`}
          />
        </button>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{product.brand}</p>
      <h3 className="mt-2 min-w-0 text-base font-semibold leading-snug">
        <Link
          to="/produtos/$slug"
          params={{ slug: productSlug(product) }}
          className="transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
      </h3>

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

      <div className="mt-4 flex items-end gap-2">
        {product.oldPrice && (
          <span className="text-sm text-muted-foreground line-through">{brl(product.oldPrice)}</span>
        )}
        <span className="text-2xl font-bold tracking-tight text-foreground">{brl(product.price)}</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-primary">
        {brl(pixPrice(product.price))} no PIX
      </p>
      <p className="text-xs text-muted-foreground">12x de {brl(product.price / 12)} sem juros</p>

      <div className="mt-auto pt-5 transition-all duration-300 sm:translate-y-1 sm:opacity-90 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
        <button onClick={handleAdd} className="btn-base btn-primary w-full px-6 py-3 text-sm">
          Comprar agora
        </button>
        <button
          onClick={handleAdd}
          className="btn-base btn-ghost-outline mt-2 w-full px-6 py-3 text-sm"
        >
          <ShoppingCart className="h-4 w-4" />
          {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
        </button>
      </div>
    </article>
  );
}
