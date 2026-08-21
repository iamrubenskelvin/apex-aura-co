import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Carousel({
  children,
  label,
  itemClass = "w-[78%] sm:w-[46%] lg:w-[31%] xl:w-[24%]",
}: {
  children: ReactNode[];
  label: string;
  itemClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-14 right-0 hidden gap-2 sm:flex">
        {([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            onClick={() => scrollBy(dir)}
            aria-label={dir === -1 ? `Anterior — ${label}` : `Próximo — ${label}`}
            className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-foreground transition-all hover:scale-110 hover:border-primary/50 hover:text-primary"
          >
            {dir === -1 ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        ))}
      </div>

      <div
        ref={ref}
        role="region"
        aria-label={label}
        className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => (
          <div key={i} className={`shrink-0 snap-start ${itemClass}`}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
