import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type CartContextValue = {
  count: number;
  add: (id: string) => void;
  lastAdded: string | null;
};

const CartContext = createContext<CartContextValue>({
  count: 0,
  add: () => {},
  lastAdded: null,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const add = useCallback((id: string) => {
    setItems((prev) => [...prev, id]);
    setLastAdded(id);
  }, []);

  const value = useMemo(
    () => ({ count: items.length, add, lastAdded }),
    [items.length, add, lastAdded],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
