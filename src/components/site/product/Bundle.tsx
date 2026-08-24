import { Plus } from "lucide-react";
import { toast } from "sonner";
import { brl, pixPrice, type Product } from "@/data/products";
import { useCart } from "../cart";

const BUNDLE_DISCOUNT = 0.08;

export function Bundle({ items }: { items: Product[] }) {
  const { add, setOpen } = useCart();
  if (items.length < 2) return null;

  const total = items.reduce((sum, p) => sum + p.price, 0);
  const comboPrice = total * (1 - BUNDLE_DISCOUNT);
  const savings = total - comboPrice;

  const buyCombo = () => {
    items.forEach((p) =>
      add({ productId: p.id, name: p.name, image: p.image, price: p.price, qty: 1 }),
    );
    setOpen(true);
    toast.success("Combo adicionado ao carrinho.");
  };

  return (
    <section className="min-w-0 rounded-3xl border border-border bg-surface p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-promo">Compre junto</p>
      <h2 className="text-display mt-2 text-2xl sm:text-3xl">Combine e economize</h2>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          {items.map((p, i) => (
            <div key={p.id} className="flex items-center gap-4">
              {i > 0 && <Plus className="h-5 w-5 shrink-0 text-primary" />}
              <div className="w-28 min-w-0 text-center">
                <span className="grid aspect-square place-items-center overflow-hidden rounded-2xl border border-border bg-background">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-contain p-3"
                  />
                </span>
                <p className="mt-2 line-clamp-2 text-xs font-medium">{p.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{brl(p.price)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground line-through">{brl(total)}</p>
          <p className="mt-1 text-3xl font-bold">{brl(comboPrice)}</p>
          <p className="mt-1 text-sm font-semibold text-primary">
            {brl(pixPrice(comboPrice))} no PIX
          </p>
          <p className="mt-2 inline-block rounded-full bg-promo/15 px-3 py-1 text-xs font-bold text-promo">
            Economize {brl(savings)}
          </p>
          <button onClick={buyCombo} className="btn-base btn-primary mt-5 w-full px-6 py-4 text-sm uppercase">
            Comprar combo
          </button>
        </div>
      </div>
    </section>
  );
}
