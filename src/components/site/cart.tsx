import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  variant?: string | undefined;
  sku?: string | undefined;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "id">) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  wishlist: string[];
  toggleWish: (id: string) => void;
  recent: string[];
  pushRecent: (id: string) => void;
};

const noop = () => {};

const CartContext = createContext<CartContextValue>({
  lines: [],
  count: 0,
  subtotal: 0,
  add: noop,
  setQty: noop,
  remove: noop,
  open: false,
  setOpen: noop,
  wishlist: [],
  toggleWish: noop,
  recent: [],
  pushRecent: noop,
});

const KEYS = {
  cart: "forja:cart",
  wish: "forja:wishlist",
  recent: "forja:recent",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage indisponível */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hidrata depois da montagem para não divergir do HTML do servidor.
  useEffect(() => {
    setLines(read<CartLine[]>(KEYS.cart, []));
    setWishlist(read<string[]>(KEYS.wish, []));
    setRecent(read<string[]>(KEYS.recent, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) write(KEYS.cart, lines);
  }, [lines, hydrated]);
  useEffect(() => {
    if (hydrated) write(KEYS.wish, wishlist);
  }, [wishlist, hydrated]);
  useEffect(() => {
    if (hydrated) write(KEYS.recent, recent);
  }, [recent, hydrated]);

  const add = useCallback((line: Omit<CartLine, "id">) => {
    const id = `${line.productId}::${line.variant ?? "default"}`;
    setLines((prev) => {
      const existing = prev.find((l) => l.id === id);
      if (existing) {
        return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + line.qty } : l));
      }
      return [...prev, { ...line, id }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const toggleWish = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const pushRecent = useCallback((id: string) => {
    setRecent((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 8));
  }, []);

  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.price, 0);

  const value = useMemo(
    () => ({
      lines,
      count,
      subtotal,
      add,
      setQty,
      remove,
      open,
      setOpen,
      wishlist,
      toggleWish,
      recent,
      pushRecent,
    }),
    [lines, count, subtotal, add, setQty, remove, open, wishlist, toggleWish, recent, pushRecent],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
