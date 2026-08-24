/**
 * FORJA NUTRI — conteúdo editorial/comercial da página de produto.
 *
 * IMPORTANTE: todo o conteúdo abaixo é DEMONSTRATIVO e existe apenas para
 * visualizar a interface. Cada campo é 1:1 com um campo do painel
 * administrativo e deve ser substituído pelos dados reais do fabricante.
 * Nenhuma informação nutricional, avaliação ou preço deve ser inventada em
 * produção — se o campo não estiver cadastrado, a seção não é renderizada.
 */
import { products, type Product } from "./products";

export type VariantOption = {
  id: string;
  label: string;
  available: boolean;
  /** diferença de preço em relação ao preço base (R$) */
  priceDelta?: number;
  image?: string;
  stock?: number;
};

export type VariantGroup = {
  id: string;
  label: string;
  options: VariantOption[];
};

export type NutritionRow = { label: string; amount: string; vd?: string };
export type AminoRow = { label: string; amount: string };
export type FaqItem = { q: string; a: string };

export type ProductReview = {
  id: string;
  name: string;
  initials: string;
  rating: number;
  date: string;
  title?: string;
  text: string;
  variant?: string;
  verified: boolean;
  photos?: string[];
};

export type ProductDetail = {
  sku: string;
  badges: string[];
  gallery: { type: "image" | "video"; src: string; caption: string; poster?: string }[];
  variants: VariantGroup[];
  highlights: string[];
  about: {
    intro: string;
    indicatedFor: string[];
    features: string[];
    differentials: string[];
  };
  /** porção de referência da tabela nutricional */
  servingLabel?: string;
  nutrition?: NutritionRow[];
  aminoAcids?: AminoRow[];
  ingredients?: string;
  allergens?: string[];
  usage?: string;
  warnings?: string[];
  storage?: string;
  faq: FaqItem[];
  reviews: ProductReview[];
  relatedIds: string[];
  bundleIds: string[];
  maxPerOrder?: number;
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const productSlug = (p: Product) => `${slugify(p.name)}`;

export const productBySlug = (slug: string) =>
  products.find((p) => productSlug(p) === slug);

const img = (p: Product) => p.image;

const flavorGroup = (options: [string, boolean][]): VariantGroup => ({
  id: "sabor",
  label: "Sabor",
  options: options.map(([label, available]) => ({
    id: slugify(label),
    label,
    available,
  })),
});

const baseReviews = (variantLabels: string[]): ProductReview[] => [
  {
    id: "r1",
    name: "Camila Duarte",
    initials: "CD",
    rating: 5,
    date: "2026-07-28",
    title: "Dissolve perfeito",
    text: "Terceira compra e nunca decepciona. Chegou em dois dias e a embalagem veio lacrada com selo do fabricante.",
    variant: variantLabels[0],
    verified: true,
  },
  {
    id: "r2",
    name: "Rafael Menezes",
    initials: "RM",
    rating: 5,
    date: "2026-07-12",
    title: "Laudo disponível",
    text: "O que me convenceu foi o laudo de pureza no site. Sabor equilibrado, sem aquele residual artificial.",
    variant: variantLabels[1] ?? variantLabels[0],
    verified: true,
  },
  {
    id: "r3",
    name: "Juliana Prado",
    initials: "JP",
    rating: 4,
    date: "2026-06-30",
    text: "Produto muito bom, só achei a embalagem um pouco difícil de fechar depois de aberta.",
    variant: variantLabels[0],
    verified: true,
  },
  {
    id: "r4",
    name: "Diego Almeida",
    initials: "DA",
    rating: 5,
    date: "2026-06-19",
    text: "Custo-benefício excelente no PIX. Já indiquei para o pessoal do treino.",
    variant: variantLabels[2] ?? variantLabels[0],
    verified: true,
  },
  {
    id: "r5",
    name: "Beatriz Lima",
    initials: "BL",
    rating: 3,
    date: "2026-05-22",
    text: "Qualidade ok, mas esperava um sabor mais suave. Entrega foi rápida.",
    variant: variantLabels[1] ?? variantLabels[0],
    verified: false,
  },
];

const genericFaq = (name: string): FaqItem[] => [
  {
    q: "Como devo armazenar o produto?",
    a: "Conserve em local seco e arejado, ao abrigo de luz e calor. Após aberto, mantenha a embalagem bem fechada.",
  },
  {
    q: "Qual é o prazo de validade?",
    a: "Enviamos sempre lotes com no mínimo 8 meses de validade. A data exata está impressa na embalagem.",
  },
  {
    q: "O produto é original?",
    a: `${name} é distribuído oficialmente pelo fabricante, com nota fiscal e laudo de análise por lote.`,
  },
  {
    q: "Posso trocar o sabor após a compra?",
    a: "Sim. Enquanto o pedido não for despachado, o time de atendimento troca o sabor sem custo.",
  },
];

const detail = (
  p: Product,
  overrides: Partial<ProductDetail> & { variants: VariantGroup[] },
): ProductDetail => {
  const flavors =
    overrides.variants.find((g) => g.id === "sabor")?.options.map((o) => o.label) ??
    overrides.variants[0]?.options.map((o) => o.label) ??
    [];
  return {
    sku: `FN-${p.id.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}`,
    badges: [
      ...(p.bestSeller ? ["Mais vendido"] : []),
      ...(p.oldPrice ? ["Oferta"] : []),
      ...((p.stockLeft ?? 999) < 50 ? ["Últimas unidades"] : []),
    ],
    gallery: [
      { type: "image", src: img(p), caption: `${p.name} — embalagem frontal` },
      { type: "image", src: img(p), caption: `${p.name} — vista lateral` },
      { type: "image", src: img(p), caption: `${p.name} — tabela nutricional` },
      { type: "image", src: img(p), caption: `${p.name} — imagem promocional` },
    ],
    highlights: [],
    about: {
      intro: "",
      indicatedFor: [],
      features: [],
      differentials: [],
    },
    faq: genericFaq(p.name),
    reviews: baseReviews(flavors),
    relatedIds: products.filter((o) => o.id !== p.id).slice(0, 6).map((o) => o.id),
    bundleIds: [],
    maxPerOrder: 6,
    ...overrides,
  };
};

const byId = (id: string) => products.find((p) => p.id === id)!;

export const productDetails: Record<string, ProductDetail> = {
  "whey-iso": detail(byId("whey-iso"), {
    variants: [
      flavorGroup([
        ["Chocolate", true],
        ["Morango", true],
        ["Baunilha", true],
        ["Cookies", false],
      ]),
      {
        id: "peso",
        label: "Peso",
        options: [
          { id: "450g", label: "450g", available: true, priceDelta: -70, stock: 120 },
          { id: "900g", label: "900g", available: true, priceDelta: 0, stock: 68 },
          { id: "2kg", label: "2kg", available: true, priceDelta: 180, stock: 14 },
        ],
      },
    ],
    highlights: [
      "27 g de proteína por dose",
      "Isolado com alta concentração proteica",
      "Baixo teor de carboidratos e gorduras",
      "Excelente solubilidade",
      "Laudo de pureza por lote",
    ],
    about: {
      intro:
        "Whey Isolate Pro é uma proteína isolada obtida por filtração cruzada, processo que preserva as frações proteicas e reduz lactose, gordura e carboidratos. Indicado para quem busca uma fonte proteica limpa, de rápida absorção e sabor equilibrado.",
      indicatedFor: [
        "Praticantes de musculação em fase de ganho de massa magra",
        "Atletas que precisam de proteína de rápida absorção pós-treino",
        "Pessoas com baixa tolerância à lactose",
        "Dietas com restrição de carboidratos",
      ],
      features: [
        "Proteína isolada por filtração cruzada",
        "30 doses por embalagem de 900 g",
        "Enriquecido com blend enzimático digestivo",
        "Sem adição de açúcares",
      ],
      differentials: [
        "Laudo de análise disponível por número de lote",
        "Rastreabilidade completa da matéria-prima",
        "Embalagem com barreira de oxigênio",
      ],
    },
    servingLabel: "Porção de 30 g (1 scoop)",
    nutrition: [
      { label: "Valor energético", amount: "120 kcal = 504 kJ", vd: "6%" },
      { label: "Carboidratos totais", amount: "1,5 g", vd: "1%" },
      { label: "Açúcares totais", amount: "0,9 g", vd: "—" },
      { label: "Proteínas", amount: "27 g", vd: "54%" },
      { label: "Gorduras totais", amount: "0,8 g", vd: "1%" },
      { label: "Gorduras saturadas", amount: "0,4 g", vd: "2%" },
      { label: "Fibra alimentar", amount: "0 g", vd: "0%" },
      { label: "Sódio", amount: "68 mg", vd: "3%" },
    ],
    aminoAcids: [
      { label: "Leucina", amount: "2.900 mg" },
      { label: "Isoleucina", amount: "1.700 mg" },
      { label: "Valina", amount: "1.600 mg" },
      { label: "BCAA (total)", amount: "6.200 mg" },
      { label: "Glutamina + Ácido glutâmico", amount: "4.800 mg" },
      { label: "Lisina", amount: "2.500 mg" },
    ],
    ingredients:
      "Proteína isolada do soro do leite, cacau alcalino, aroma idêntico ao natural, espessante goma xantana, blend enzimático (protease, lactase), edulcorantes sucralose e glicosídeos de esteviol.",
    allergens: ["Contém leite e derivados", "Contém traços de soja", "Não contém glúten"],
    usage:
      "Adicionar 1 porção (30 g) em 200 ml de água ou bebida de sua preferência. Misturar até homogeneizar. Consumir conforme orientação de nutricionista ou médico.",
    warnings: [
      "Este produto não substitui uma alimentação equilibrada e seu consumo deve ser orientado por nutricionista ou médico.",
      "Não contém quantidade significativa de fibra alimentar.",
      "Não recomendado para pessoas com alergia à proteína do leite.",
    ],
    storage:
      "Conservar em local fresco, seco e ao abrigo da luz. Após aberto, manter bem fechado e consumir em até 60 dias.",
    bundleIds: ["creatina", "bcaa"],
  }),

  creatina: detail(byId("creatina"), {
    variants: [
      {
        id: "peso",
        label: "Tamanho",
        options: [
          { id: "150g", label: "150g", available: true, priceDelta: -50, stock: 90 },
          { id: "300g", label: "300g", available: true, priceDelta: 0, stock: 42 },
          { id: "500g", label: "500g", available: false, priceDelta: 70 },
        ],
      },
    ],
    highlights: [
      "3 g de creatina monohidratada por dose",
      "Matéria-prima com pureza certificada",
      "Sem sabor — mistura em qualquer líquido",
      "100 doses na embalagem de 300 g",
    ],
    about: {
      intro:
        "Creatina monohidratada micronizada, o suplemento com maior respaldo científico para força e potência. Micronização reduz o tamanho da partícula, melhorando a dispersão em líquidos.",
      indicatedFor: [
        "Treinos de força e alta intensidade",
        "Esportes com esforços curtos e explosivos",
        "Fases de ganho de massa muscular",
      ],
      features: ["Monohidratada micronizada", "Sem aditivos ou corantes", "100 porções de 3 g"],
      differentials: ["Laudo de pureza por lote", "Peneiração fina para melhor solubilidade"],
    },
    servingLabel: "Porção de 3 g (1 colher medidora)",
    nutrition: [
      { label: "Valor energético", amount: "0 kcal = 0 kJ", vd: "0%" },
      { label: "Carboidratos totais", amount: "0 g", vd: "0%" },
      { label: "Proteínas", amount: "0 g", vd: "0%" },
      { label: "Gorduras totais", amount: "0 g", vd: "0%" },
      { label: "Sódio", amount: "0 mg", vd: "0%" },
      { label: "Creatina monohidratada", amount: "3.000 mg", vd: "—" },
    ],
    ingredients: "Creatina monohidratada micronizada. Não contém glúten.",
    usage:
      "Adicionar 1 porção (3 g) em 200 ml de água, suco ou bebida de sua preferência. Consumir diariamente conforme orientação de nutricionista ou médico.",
    warnings: [
      "Este produto não substitui uma alimentação equilibrada e seu consumo deve ser orientado por nutricionista ou médico.",
      "Mantenha uma ingestão adequada de água ao longo do dia.",
    ],
    storage: "Conservar em local seco e arejado, longe da umidade.",
    bundleIds: ["whey-iso", "barra-proteica"],
  }),

  "pre-treino": detail(byId("pre-treino"), {
    variants: [
      flavorGroup([
        ["Frutas Vermelhas", true],
        ["Limão Siciliano", true],
        ["Uva", true],
        ["Melancia", false],
      ]),
    ],
    highlights: [
      "200 mg de cafeína por dose",
      "3,2 g de beta-alanina",
      "Dosagens transparentes no rótulo",
      "30 doses por pote",
    ],
    about: {
      intro:
        "Pré-treino com blend de estimulantes e precursores de óxido nítrico em dosagens declaradas no rótulo, sem blends proprietários.",
      indicatedFor: [
        "Treinos de alta intensidade",
        "Sessões longas de musculação",
        "Atletas habituados à cafeína",
      ],
      features: ["Rótulo aberto", "Sem blend proprietário", "Solubilidade rápida"],
      differentials: ["Dose de cafeína declarada", "Sem corantes artificiais"],
    },
    servingLabel: "Porção de 10 g (1 scoop)",
    nutrition: [
      { label: "Valor energético", amount: "12 kcal = 50 kJ", vd: "1%" },
      { label: "Carboidratos totais", amount: "3 g", vd: "1%" },
      { label: "Proteínas", amount: "0 g", vd: "0%" },
      { label: "Gorduras totais", amount: "0 g", vd: "0%" },
      { label: "Sódio", amount: "120 mg", vd: "5%" },
      { label: "Beta-alanina", amount: "3.200 mg", vd: "—" },
      { label: "Cafeína anidra", amount: "200 mg", vd: "—" },
    ],
    ingredients:
      "Beta-alanina, citrulina malato, cafeína anidra, taurina, acidulante ácido cítrico, aroma idêntico ao natural, edulcorante sucralose.",
    usage:
      "Adicionar 1 porção (10 g) em 300 ml de água, 20 a 30 minutos antes do treino. Não exceder a dose diária recomendada.",
    warnings: [
      "Contém cafeína. Não recomendado para crianças, gestantes, lactantes, idosos e pessoas sensíveis à cafeína.",
      "Este produto não substitui uma alimentação equilibrada e seu consumo deve ser orientado por nutricionista ou médico.",
    ],
    storage: "Conservar em local seco e arejado. Manter bem fechado após o uso.",
    bundleIds: ["creatina", "bcaa"],
  }),

  bcaa: detail(byId("bcaa"), {
    variants: [
      {
        id: "tamanho",
        label: "Quantidade",
        options: [
          { id: "60caps", label: "60 caps", available: true, priceDelta: -25, stock: 80 },
          { id: "120caps", label: "120 caps", available: true, priceDelta: 0, stock: 120 },
        ],
      },
    ],
    highlights: [
      "Proporção 2:1:1 de leucina, isoleucina e valina",
      "Cápsulas de fácil deglutição",
      "Sem sabor e sem edulcorantes",
    ],
    about: {
      intro:
        "Aminoácidos de cadeia ramificada em cápsulas, na proporção clássica 2:1:1, para quem prefere praticidade em vez de pó.",
      indicatedFor: ["Rotinas de treino intenso", "Períodos de restrição calórica"],
      features: ["120 cápsulas", "Sem sabor", "Vegetariano"],
      differentials: ["Cápsula de liberação rápida", "Rastreabilidade por lote"],
    },
    servingLabel: "Porção de 4 cápsulas",
    nutrition: [
      { label: "Valor energético", amount: "8 kcal = 34 kJ", vd: "0%" },
      { label: "Carboidratos totais", amount: "0 g", vd: "0%" },
      { label: "Proteínas", amount: "2 g", vd: "4%" },
      { label: "Gorduras totais", amount: "0 g", vd: "0%" },
      { label: "Sódio", amount: "0 mg", vd: "0%" },
    ],
    aminoAcids: [
      { label: "Leucina", amount: "1.000 mg" },
      { label: "Isoleucina", amount: "500 mg" },
      { label: "Valina", amount: "500 mg" },
      { label: "BCAA (total)", amount: "2.000 mg" },
    ],
    ingredients:
      "L-leucina, L-isoleucina, L-valina, agente de revestimento hidroxipropilmetilcelulose (cápsula), antiumectante dióxido de silício.",
    usage: "Consumir 4 cápsulas ao dia com água, conforme orientação de nutricionista ou médico.",
    warnings: [
      "Este produto não substitui uma alimentação equilibrada e seu consumo deve ser orientado por nutricionista ou médico.",
    ],
    storage: "Conservar em local seco e ao abrigo da luz.",
    bundleIds: ["whey-iso", "creatina"],
  }),
};

/** Fallback para produtos ainda sem ficha completa cadastrada no painel. */
export const getProductDetail = (p: Product): ProductDetail =>
  productDetails[p.id] ??
  detail(p, {
    variants: [],
    highlights: [],
  });
