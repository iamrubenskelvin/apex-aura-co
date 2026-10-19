import { createFileRoute, Link } from "@tanstack/react-router";
import { catalogById } from "@/data/catalog";
import { useCart } from "@/components/site/cart";
import { ProductCard } from "@/components/site/ProductCard";
import { Panel } from "@/components/account/shared";

export const Route = createFileRoute("/_authenticated/conta/favoritos")({ component: Page });

function Page() {
  const { wishlist } = useCart();
  const items = wishlist.map((id) => catalogById(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <Panel title={`Favoritos (${items.length})`}>
      {items.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Toque no coração dos produtos para salvá-los aqui. <Link to="/produtos" search={{}} className="text-primary">Ver produtos</Link>
        </p>
      )}
    </Panel>
  );
}
