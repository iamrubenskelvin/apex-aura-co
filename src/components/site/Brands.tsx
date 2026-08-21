import { brands } from "@/data/products";

export function Brands() {
  return (
    <section id="marcas" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Parceiros oficiais</p>
        <h2 className="text-display mt-3 text-3xl sm:text-4xl">Marcas que trabalhamos</h2>
      </div>

      <div className="mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-[marquee_36s_linear_infinite] gap-4 hover:[animation-play-state:paused]">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 gap-4 pr-4">
              {brands.map((b) => (
                <span
                  key={b}
                  className="grid h-20 w-44 place-items-center rounded-2xl border border-border bg-surface px-6 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground opacity-60 grayscale transition-all duration-300 hover:scale-105 hover:text-primary hover:opacity-100 hover:grayscale-0"
                >
                  {b}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
