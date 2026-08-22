import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import heroDefault from "@/assets/hero-athlete.jpg";
import heroStrength from "@/assets/hero-strength.jpg";
import heroRecovery from "@/assets/hero-recovery.jpg";

const slides = [
  {
    image: heroDefault,
    eyebrow: "Nova linha performance",
    title: ["Combustível", "para quem", "não recua."],
    subtitle: "Suplementos de alta pureza, com dosagens completas e testados lote a lote.",
  },
  {
    image: heroStrength,
    eyebrow: "Semana da força",
    title: ["Mais carga", "na barra,", "menos desculpa."],
    subtitle: "Creatina e pré-treino com até 30% off e envio em 24h para todo o Brasil.",
  },
  {
    image: heroRecovery,
    eyebrow: "Recuperação inteligente",
    title: ["Treino puxado", "pede", "retorno rápido."],
    subtitle: "Whey isolado, BCAA e vitaminas para você voltar melhor no dia seguinte.",
  },
];

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => window.clearInterval(id);
  }, []);

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const delta = e.changedTouches[0]!.clientX - touchX.current;
    if (Math.abs(delta) > 50) {
      setIndex((i) => (i + (delta < 0 ? 1 : slides.length - 1)) % slides.length);
    }
    touchX.current = null;
  };

  return (
    <section
      className="relative min-h-[86vh] overflow-hidden"
      aria-roledescription="carrossel"
      aria-label="Campanhas em destaque"
      onTouchStart={(e) => (touchX.current = e.touches[0]!.clientX)}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, i) => (
        <img
          key={slide.eyebrow}
          src={slide.image}
          alt={slide.title.join(" ")}
          width={1600}
          height={1000}
          fetchPriority={i === 0 ? "high" : "low"}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
            i === index ? "opacity-60" : "opacity-0"
          }`}
        />
      ))}
      <div
        className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[86vh] max-w-7xl items-center px-5 py-24 lg:px-8">
        <div key={index} className="max-w-2xl">
          <span className="inline-flex animate-[fade-up_0.6s_ease-out_both] items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            {slides[index]!.eyebrow}
          </span>

          <h1
            className="text-display mt-6 text-5xl sm:text-6xl lg:text-7xl"
            style={{ animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 80ms both" }}
          >
            {slides[index]!.title[0]}
            <br />
            {slides[index]!.title[1]}
            <br />
            <span className="text-primary">{slides[index]!.title[2]}</span>
          </h1>

          <p
            className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{ animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 160ms both" }}
          >
            {slides[index]!.subtitle}
          </p>

          <div
            className="mt-10 flex flex-col gap-3 sm:flex-row"
            style={{ animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 240ms both" }}
          >
            <a href="#produtos" className="btn-base btn-primary px-8 py-4 text-base">
              Comprar agora
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#categorias" className="btn-base btn-ghost-outline px-8 py-4 text-base">
              Conheça a linha
            </a>
          </div>

          <dl
            className="mt-14 grid max-w-lg grid-cols-3 gap-6"
            style={{ animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 320ms both" }}
          >
            {[
              ["+180 mil", "clientes ativos"],
              ["4.9/5", "média de avaliações"],
              ["24h", "para postagem"],
            ].map(([value, label]) => (
              <div key={label} className="min-w-0">
                <dt className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {value}
                </dt>
                <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-3">
        {slides.map((s, i) => (
          <button
            key={s.eyebrow}
            onClick={() => setIndex(i)}
            aria-label={`Ir para campanha ${i + 1}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? "w-10 bg-primary" : "w-4 bg-foreground/30 hover:bg-foreground/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
