import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { brl, pixPrice } from "@/data/products";
import { useCart } from "./cart";

export function MiniCart() {
  const { open, setOpen, lines, subtotal, setQty, remove, count } = useCart();

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        aria-hidden={!open}
        className={`fixed inset-0 z-[70] bg-background/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Mini carrinho"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-[80] flex h-dvh w-full max-w-sm flex-col border-l border-border bg-surface transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-5 py-4">
          <h2 className="min-w-0 truncate text-sm font-semibold uppercase tracking-widest">
            Seu carrinho ({count})
          </h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar carrinho"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
            <button onClick={() => setOpen(false)} className="btn-base btn-primary px-6 py-3 text-sm">
              Continuar comprando
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {lines.map((l) => (
                <li key={l.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-2">
                    <img src={l.image} alt={l.name} loading="lazy" className="h-full w-full object-contain p-2" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{l.name}</p>
                    {l.variant && <p className="mt-0.5 text-xs text-muted-foreground">{l.variant}</p>}
                    <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                      <span className="inline-flex items-center rounded-full border border-border">
                        <button
                          onClick={() => setQty(l.id, l.qty - 1)}
                          aria-label="Diminuir quantidade"
                          className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{l.qty}</span>
                        <button
                          onClick={() => setQty(l.id, l.qty + 1)}
                          aria-label="Aumentar quantidade"
                          className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </span>
                      <span className="text-right text-sm font-bold">{brl(l.price * l.qty)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(l.id)}
                    aria-label={`Remover ${l.name}`}
                    className="col-span-2 justify-self-end text-xs text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                    Remover
                  </button>
                </li>
              ))}
            </ul>

            <footer className="space-y-3 border-t border-border px-5 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold">{brl(subtotal)}</span>
              </div>
              <p className="text-xs text-primary">
                {brl(pixPrice(subtotal))} no PIX (10% de desconto)
              </p>
              <button className="btn-base btn-primary w-full px-6 py-4 text-sm">
                Finalizar compra
              </button>
              <button
                onClick={() => setOpen(false)}
                className="btn-base btn-ghost-outline w-full px-6 py-3 text-sm"
              >
                Continuar comprando
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
