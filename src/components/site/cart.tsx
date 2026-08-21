import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type CartContextValue = {
  count: number;
  add: (id: string) => void;
  lastAdded: string | null;
  wishlist: string[];
  toggleWish: (id: string) => void;
};

const CartContext = createContext<CartContextValue>({
  count: 0,
  add: () => {},
  lastAdded: null,
  wishlist: [],
  toggleWish: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const add = useCallback((id: string) => {
    setItems((prev) => [...prev, id]);
    setLastAdded(id);
  }, []);

  const toggleWish = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const value = useMemo(
    () => ({ count: items.length, add, lastAdded, wishlist, toggleWish }),
    [items.length, add, lastAdded, wishlist, toggleWish],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
