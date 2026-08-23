import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, ImageOff, X, ZoomIn } from "lucide-react";
import type { ProductDetail } from "@/data/product-details";

type Media = ProductDetail["gallery"][number];

export function Gallery({ media, alt, badges }: { media: Media[]; alt: string; badges: string[] }) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [full, setFull] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const trackRef = useRef<HTMLDivElement>(null);
  const current = media[index];

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + media.length) % media.length);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full, media.length]);

  // Mantém o índice em sincronia com o swipe no mobile.
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  if (media.length === 0 || !current) {
    return (
      <div className="grid aspect-square w-full place-items-center rounded-3xl border border-border bg-surface text-muted-foreground">
        <div className="text-center">
          <ImageOff className="mx-auto h-8 w-8" />
          <p className="mt-2 text-sm">Imagem indisponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {/* MOBILE — swipe horizontal + pinch-to-zoom nativo */}
      <div className="relative lg:hidden">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="-mx-5 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {media.map((m, i) => (
            <div key={i} className="w-screen shrink-0 snap-center px-5">
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-surface">
                <img
                  src={m.src}
                  alt={`${alt} — ${m.caption}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  onLoad={() => setLoaded((p) => ({ ...p, [i]: true }))}
                  className={`h-full w-full touch-pan-x touch-pinch-zoom object-contain p-6 transition-opacity duration-500 ${
                    loaded[i] ? "opacity-100" : "opacity-0"
                  }`}
                />
                {!loaded[i] && <div className="skeleton absolute inset-0" aria-hidden="true" />}
              </div>
            </div>
          ))}
        </div>
        <span className="absolute bottom-3 right-8 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur">
          {index + 1}/{media.length}
        </span>
        <div className="pointer-events-none absolute left-8 top-4 flex flex-col gap-2">
          {badges.map((b) => (
            <span
              key={b}
              className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* DESKTOP — principal + miniaturas */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-[88px_minmax(0,1fr)]">
        <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
          {media.map((m, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Ver ${m.caption}`}
              aria-current={i === index}
              className={`aspect-square shrink-0 overflow-hidden rounded-xl border bg-surface transition-all ${
                i === index
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              <img src={m.src} alt={m.caption} loading="lazy" className="h-full w-full object-contain p-2" />
            </button>
          ))}
        </div>

        <div
          className="group relative aspect-square overflow-hidden rounded-3xl border border-border bg-surface"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
          }}
          onMouseLeave={() => setZoom(false)}
        >
          <img
            src={current.src}
            alt={`${alt} — ${current.caption}`}
            loading="eager"
            decoding="async"
            style={{ transformOrigin: origin }}
            className={`h-full w-full object-contain p-10 transition-transform duration-300 ${
              zoom ? "scale-[2.1] cursor-zoom-out" : "cursor-zoom-in"
            }`}
            onClick={() => setZoom((v) => !v)}
          />

          <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground"
              >
                {b}
              </span>
            ))}
          </div>

          <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => setZoom((v) => !v)}
              aria-label="Ampliar imagem"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background/80 backdrop-blur transition-colors hover:text-primary"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setFull(true)}
              aria-label="Ver em tela cheia"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background/80 backdrop-blur transition-colors hover:text-primary"
            >
              <Expand className="h-4 w-4" />
            </button>
          </div>

          {media.length > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                aria-label="Imagem anterior"
                className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 opacity-0 backdrop-blur transition-all hover:text-primary group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Próxima imagem"
                className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 opacity-0 backdrop-blur transition-all hover:text-primary group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-4 py-1 text-xs text-muted-foreground backdrop-blur">
            {current.caption}
          </p>
        </div>
      </div>

      {full && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-background/95 backdrop-blur-xl">
          <div className="flex justify-end p-5">
            <button
              onClick={() => setFull(false)}
              aria-label="Fechar tela cheia"
              className="grid h-11 w-11 place-items-center rounded-full border border-border"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-10">
            <img
              src={current.src}
              alt={`${alt} — ${current.caption}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="flex justify-center gap-3 pb-8">
            {media.map((m, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Ver ${m.caption}`}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
