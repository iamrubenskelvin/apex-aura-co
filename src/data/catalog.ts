/**
 * FORJA NUTRI — camada de catálogo.
 *
 * Toda a vitrine (catálogo, categorias, marcas, objetivos e busca) lê APENAS
 * deste módulo. Nenhuma página deve declarar produtos por conta própria.
 * Cada campo abaixo é 1:1 com um campo do futuro painel administrativo,
 * o que permite trocar este arquivo por uma consulta ao banco sem alterar UI.
 */
import { products as baseProducts, type Product } from "./products";
import { slugify } from "./product-details";

import whey from "@/assets/product-whey.png";
import creatine from "@/assets/product-creatine.png";
import preworkout from "@/assets/product-preworkout.png";
import bcaa from "@/assets/product-bcaa.png";
import mass from "@/assets/product-mass.png";
import thermo from "@/assets/product-thermo.png";
import vitamin from "@/assets/product-vitamin.png";
import bar from "@/assets/product-bar.png";

export type CatalogProduct = Product & {
  slug: string;
  sku: string;
  subcategory: string;
  description: string;
  goals: string[];
  flavors: string[];
  weights: string[];
  tags: string[];
  stock: number;
  status: "ativo" | "inativo";
  createdAt: string;
  sales: number;
  isNew?: boolean;
};

/* ---------------------------------------------------------------- taxonomia */

export type CategoryNode = {
  name: string;
  slug: string;
  image: string;
  description: string;
  banner: { title: string; subtitle: string; cta?: string };
  seo: { title: string; text: string; faq: { q: string; a: string }[] };
  children?: { name: string; slug: string }[];
};

const faq = (name: string) => [
  {
    q: `Como escolher ${name.toLowerCase()}?`,
    a: "Considere seu objetivo, sua rotina de treino e a orientação de um nutricionista. Em caso de dúvida, nosso atendimento ajuda na escolha.",
  },
  {
    q: "Os produtos são originais?",
    a: "Trabalhamos apenas com distribuição oficial, nota fiscal e laudo de análise por lote.",
  },
  {
    q: "Em quanto tempo recebo meu pedido?",
    a: "Pedidos aprovados até 16h são despachados no mesmo dia útil. O prazo final depende do seu CEP.",
  },
];

export const categoryTree: CategoryNode[] = [
  {
    name: "Whey Protein",
    slug: "whey-protein",
    image: whey,
    description: "Proteínas do soro do leite para recuperação e ganho de massa magra.",
    banner: { title: "WHEY PROTEIN", subtitle: "Proteínas para potencializar sua rotina.", cta: "Ver ofertas" },
    seo: {
      title: "Tudo sobre Whey Protein",
      text: "O whey protein é uma fonte proteica de rápida absorção derivada do soro do leite. As versões concentrada, isolada e hidrolisada diferem no grau de filtragem, no teor de lactose e na velocidade de digestão. A escolha depende do seu objetivo, da sua tolerância à lactose e do seu orçamento.",
      faq: faq("Whey Protein"),
    },
    children: [
      { name: "Whey Concentrado", slug: "whey-concentrado" },
      { name: "Whey Isolado", slug: "whey-isolado" },
      { name: "Whey Hidrolisado", slug: "whey-hidrolisado" },
      { name: "Blends", slug: "blends" },
    ],
  },
  {
    name: "Creatina",
    slug: "creatina",
    image: creatine,
    description: "Creatina monohidratada para força, potência e volume muscular.",
    banner: { title: "CREATINA", subtitle: "O suplemento com maior respaldo científico." },
    seo: {
      title: "Creatina: o básico bem feito",
      text: "A creatina monohidratada é utilizada para dar suporte a esforços curtos e intensos. A forma micronizada facilita a dispersão em líquidos. O uso contínuo é mais relevante do que o horário da dose.",
      faq: faq("Creatina"),
    },
    children: [
      { name: "Monohidratada", slug: "monohidratada" },
      { name: "Micronizada", slug: "micronizada" },
    ],
  },
  {
    name: "Pré-Treino",
    slug: "pre-treino",
    image: preworkout,
    description: "Fórmulas com cafeína, beta-alanina e precursores de óxido nítrico.",
    banner: { title: "PRÉ-TREINO", subtitle: "Energia e foco para treinos intensos." },
    seo: {
      title: "Como usar pré-treino",
      text: "Pré-treinos combinam estimulantes e precursores de óxido nítrico. Prefira rótulos abertos, com dosagens declaradas. Se você é sensível à cafeína, existem versões sem estimulantes.",
      faq: faq("Pré-Treino"),
    },
    children: [
      { name: "Com cafeína", slug: "com-cafeina" },
      { name: "Sem cafeína", slug: "sem-cafeina" },
    ],
  },
  {
    name: "Hipercalórico",
    slug: "hipercalorico",
    image: mass,
    description: "Alta densidade calórica para quem tem dificuldade em ganhar peso.",
    banner: { title: "HIPERCALÓRICOS", subtitle: "Calorias de qualidade para fase de volume." },
    seo: {
      title: "Hipercalóricos e fase de volume",
      text: "Hipercalóricos concentram carboidratos e proteínas em uma única dose, úteis quando a alimentação sozinha não fecha a meta calórica do dia.",
      faq: faq("Hipercalórico"),
    },
  },
  {
    name: "Aminoácidos",
    slug: "aminoacidos",
    image: bcaa,
    description: "BCAA, glutamina e aminoácidos essenciais para recuperação.",
    banner: { title: "AMINOÁCIDOS", subtitle: "Suporte à recuperação entre as sessões." },
    seo: {
      title: "Aminoácidos na prática",
      text: "BCAA, EAA e glutamina são usados como suporte à recuperação. Eles complementam — nunca substituem — a ingestão proteica total do dia.",
      faq: faq("Aminoácidos"),
    },
    children: [
      { name: "BCAA", slug: "bcaa" },
      { name: "Glutamina", slug: "glutamina" },
      { name: "EAA", slug: "eaa" },
    ],
  },
  {
    name: "Vitaminas",
    slug: "vitaminas",
    image: vitamin,
    description: "Multivitamínicos, minerais e ômegas para saúde e bem-estar.",
    banner: { title: "VITAMINAS E MINERAIS", subtitle: "Base para saúde e consistência nos treinos." },
    seo: {
      title: "Vitaminas e minerais",
      text: "Multivitamínicos ajudam a cobrir lacunas alimentares. A necessidade individual deve ser avaliada por exames e por um profissional de saúde.",
      faq: faq("Vitaminas"),
    },
    children: [
      { name: "Multivitamínicos", slug: "multivitaminicos" },
      { name: "Minerais", slug: "minerais" },
      { name: "Ômegas", slug: "omegas" },
    ],
  },
  {
    name: "Termogênicos",
    slug: "termogenicos",
    image: thermo,
    description: "Fórmulas para dar suporte à rotina de definição.",
    banner: { title: "TERMOGÊNICOS", subtitle: "Suporte para a fase de definição." },
    seo: {
      title: "Termogênicos com responsabilidade",
      text: "Termogênicos costumam ser baseados em cafeína e extratos vegetais. O resultado depende principalmente do déficit calórico e do treino.",
      faq: faq("Termogênicos"),
    },
  },
  {
    name: "Barras",
    slug: "barras",
    image: bar,
    description: "Barras e snacks proteicos para a rotina fora de casa.",
    banner: { title: "BARRAS PROTEICAS", subtitle: "Praticidade sem abrir mão da proteína." },
    seo: {
      title: "Barras proteicas",
      text: "Barras são uma alternativa prática para lanches, com boa relação entre proteína e calorias. Confira sempre o teor de açúcares.",
      faq: faq("Barras"),
    },
  },
  {
    name: "Acessórios",
    slug: "acessorios",
    image: creatine,
    description: "Coqueteleiras, doseadores e itens de treino.",
    banner: { title: "ACESSÓRIOS", subtitle: "Itens que acompanham sua rotina." },
    seo: {
      title: "Acessórios de treino",
      text: "Coqueteleiras, doseadores e utilitários que facilitam o consumo diário dos suplementos.",
      faq: faq("Acessórios"),
    },
  },
];

export const categoryBySlug = (slug: string) => categoryTree.find((c) => c.slug === slug);

export type Goal = { name: string; slug: string; description: string; educational: string };

export const goals: Goal[] = [
  {
    name: "Ganho de massa",
    slug: "ganho-de-massa",
    description: "Proteínas, hipercalóricos e creatina para construir massa magra.",
    educational:
      "Ganhar massa exige superávit calórico consistente, treino progressivo e ingestão proteica adequada ao longo do dia. Os suplementos aqui reunidos facilitam bater essas metas.",
  },
  {
    name: "Hipertrofia",
    slug: "hipertrofia",
    description: "Suporte proteico e de força para o crescimento muscular.",
    educational:
      "Hipertrofia é resultado de estímulo mecânico, recuperação e nutrição. Proteína e creatina são os itens com melhor respaldo para esse contexto.",
  },
  {
    name: "Performance",
    slug: "performance",
    description: "Energia, foco e resistência para treinar melhor.",
    educational:
      "Performance depende de sono, periodização e nutrição peri-treino. Cafeína, beta-alanina e carboidratos são os suportes mais usados.",
  },
  {
    name: "Recuperação",
    slug: "recuperacao",
    description: "Aminoácidos e proteínas para o pós-treino.",
    educational:
      "A recuperação acontece entre as sessões. Ingestão proteica distribuída, hidratação e sono são os pilares.",
  },
  {
    name: "Emagrecimento",
    slug: "emagrecimento",
    description: "Suporte para rotinas em déficit calórico.",
    educational:
      "Emagrecer depende de déficit calórico sustentável. Proteínas ajudam na saciedade e na manutenção da massa magra.",
  },
  {
    name: "Energia",
    slug: "energia",
    description: "Estimulantes e carboidratos para os dias mais pesados.",
    educational:
      "Fontes de energia rápida e estimulantes devem respeitar sua tolerância individual, principalmente à cafeína.",
  },
  {
    name: "Saúde e bem-estar",
    slug: "saude-e-bem-estar",
    description: "Vitaminas, minerais e ômegas para o dia a dia.",
    educational:
      "Consistência vale mais que dose alta. Avalie com exames e acompanhamento profissional quais nutrientes fazem sentido para você.",
  },
  {
    name: "Definição muscular",
    slug: "definicao-muscular",
    description: "Combinação de proteína magra e termogênicos.",
    educational:
      "Definição é o resultado de perder gordura preservando massa magra: treino de força, proteína alta e paciência.",
  },
];

export const goalBySlug = (slug: string) => goals.find((g) => g.slug === slug);

export const supplementTypes = [
  "Whey Protein",
  "Creatina",
  "Pré-Treino",
  "Hipercalórico",
  "BCAA",
  "Glutamina",
  "Vitaminas",
  "Minerais",
  "Termogênicos",
  "Barras",
  "Acessórios",
];

export type BrandInfo = { name: string; slug: string; description: string };

export const brandList: BrandInfo[] = [
  { name: "Forja Prime", slug: "forja-prime", description: "Nossa linha própria: fórmulas diretas, rótulo aberto e laudo por lote." },
  { name: "Titan Fuel", slug: "titan-fuel", description: "Especialista em alta densidade calórica e produtos de volume." },
  { name: "Ignite Labs", slug: "ignite-labs", description: "Estimulantes e fórmulas de performance com dosagens declaradas." },
  { name: "Vita Core", slug: "vita-core", description: "Vitaminas, minerais e suporte diário para saúde e bem-estar." },
  { name: "Raw Athletics", slug: "raw-athletics", description: "Suplementação sem aditivos, focada em atletas." },
  { name: "NorteNutri", slug: "nortenutri", description: "Custo-benefício com qualidade auditada." },
  { name: "Peak Origin", slug: "peak-origin", description: "Matéria-prima importada e rastreável." },
  { name: "Ferro & Fibra", slug: "ferro-e-fibra", description: "Snacks, barras e praticidade para a rotina." },
];

export const brandBySlug = (slug: string) => brandList.find((b) => b.slug === slug);

/* ------------------------------------------------------------------ produtos */

type Meta = {
  subcategory: string;
  goals: string[];
  flavors: string[];
  weights: string[];
  tags: string[];
  description: string;
  createdAt: string;
  sales: number;
};

const metaById: Record<string, Meta> = {
  "whey-iso": {
    subcategory: "Whey Isolado",
    goals: ["Ganho de massa", "Hipertrofia", "Recuperação", "Definição muscular"],
    flavors: ["Chocolate", "Morango", "Baunilha", "Cookies"],
    weights: ["450g", "900g", "2kg"],
    tags: ["proteína", "isolado", "pós-treino", "low carb"],
    description: "Proteína isolada por filtração cruzada, com alta concentração proteica e baixa lactose.",
    createdAt: "2026-05-02",
    sales: 3120,
  },
  creatina: {
    subcategory: "Monohidratada",
    goals: ["Hipertrofia", "Performance", "Ganho de massa"],
    flavors: ["Neutro"],
    weights: ["150g", "300g", "500g"],
    tags: ["força", "potência", "creapure"],
    description: "Creatina monohidratada micronizada, sem sabor, com pureza certificada por lote.",
    createdAt: "2026-04-11",
    sales: 4890,
  },
  "pre-treino": {
    subcategory: "Com cafeína",
    goals: ["Performance", "Energia"],
    flavors: ["Frutas Vermelhas", "Limão Siciliano", "Uva", "Melancia"],
    weights: ["300g"],
    tags: ["cafeína", "beta-alanina", "foco"],
    description: "Pré-treino de rótulo aberto com 200 mg de cafeína e 3,2 g de beta-alanina por dose.",
    createdAt: "2026-06-20",
    sales: 1980,
  },
  bcaa: {
    subcategory: "BCAA",
    goals: ["Recuperação", "Performance"],
    flavors: ["Neutro"],
    weights: ["60 caps", "120 caps"],
    tags: ["aminoácidos", "cápsulas", "2:1:1"],
    description: "Aminoácidos de cadeia ramificada em cápsulas, na proporção 2:1:1.",
    createdAt: "2026-03-18",
    sales: 1140,
  },
  hipercalorico: {
    subcategory: "Mass Gainer",
    goals: ["Ganho de massa", "Hipertrofia"],
    flavors: ["Chocolate", "Baunilha"],
    weights: ["1,5kg", "3kg"],
    tags: ["volume", "calorias", "bulking"],
    description: "Mistura de carboidratos e proteínas para fechar a meta calórica em fase de volume.",
    createdAt: "2026-02-27",
    sales: 860,
  },
  termogenico: {
    subcategory: "Cafeína",
    goals: ["Emagrecimento", "Definição muscular", "Energia"],
    flavors: ["Neutro"],
    weights: ["60 caps", "100 caps"],
    tags: ["cafeína", "definição", "cápsulas"],
    description: "Cápsulas com cafeína e extratos vegetais para dar suporte à fase de definição.",
    createdAt: "2026-06-05",
    sales: 1520,
  },
  multivitaminico: {
    subcategory: "Multivitamínicos",
    goals: ["Saúde e bem-estar", "Recuperação"],
    flavors: ["Neutro"],
    weights: ["90 caps"],
    tags: ["vitaminas", "imunidade", "diário"],
    description: "Multivitamínico completo com 23 vitaminas e minerais em dose diária única.",
    createdAt: "2026-01-30",
    sales: 1710,
  },
  "barra-proteica": {
    subcategory: "Barras proteicas",
    goals: ["Recuperação", "Definição muscular", "Saúde e bem-estar"],
    flavors: ["Chocolate", "Cookies", "Morango"],
    weights: ["12un"],
    tags: ["snack", "praticidade", "lanche"],
    description: "Barra com 20 g de proteína e cobertura de chocolate, ideal para lanches.",
    createdAt: "2026-07-09",
    sales: 740,
  },
};

const defaultMeta: Meta = {
  subcategory: "Geral",
  goals: ["Saúde e bem-estar"],
  flavors: ["Neutro"],
  weights: ["Padrão"],
  tags: [],
  description: "",
  createdAt: "2026-01-01",
  sales: 100,
};

const sku = (id: string) => `FN-${id.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}`;

const fromBase = (p: Product): CatalogProduct => {
  const meta = metaById[p.id] ?? defaultMeta;
  return {
    ...p,
    slug: slugify(p.name),
    sku: sku(p.id),
    status: "ativo",
    stock: p.stockLeft ?? 0,
    ...meta,
  };
};

/** Itens complementares do catálogo (demonstrativos, mesmo formato do painel). */
type Extra = {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  tag: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  stock: number;
  goals: string[];
  flavors: string[];
  weights: string[];
  tags: string[];
  description: string;
  createdAt: string;
  sales: number;
  isNew?: boolean;
  bestSeller?: boolean;
};

const extras: Extra[] = [
  { id: "whey-conc-1kg", name: "Whey Concentrado 80% 1kg", brand: "NorteNutri", category: "Whey Protein", subcategory: "Whey Concentrado", tag: "Massa magra", price: 149.9, oldPrice: 189.9, rating: 4.6, reviews: 1204, image: whey, stock: 210, goals: ["Ganho de massa", "Hipertrofia"], flavors: ["Chocolate", "Baunilha", "Morango"], weights: ["900g", "1kg"], tags: ["proteína", "concentrado"], description: "Whey concentrado com 24 g de proteína por dose e ótimo custo por grama.", createdAt: "2026-03-05", sales: 2100 },
  { id: "whey-hidro", name: "Whey Hidrolisado 900g", brand: "Peak Origin", category: "Whey Protein", subcategory: "Whey Hidrolisado", tag: "Recuperação", price: 259.9, oldPrice: 319.9, rating: 4.8, reviews: 640, image: whey, stock: 34, goals: ["Recuperação", "Hipertrofia"], flavors: ["Baunilha", "Chocolate"], weights: ["900g"], tags: ["proteína", "hidrolisado", "rápida absorção"], description: "Proteína pré-digerida, de absorção acelerada e teor mínimo de lactose.", createdAt: "2026-06-28", sales: 520, isNew: true },
  { id: "whey-blend-2kg", name: "Whey Blend 3W 2kg", brand: "Raw Athletics", category: "Whey Protein", subcategory: "Blends", tag: "Massa magra", price: 279.9, rating: 4.5, reviews: 410, image: whey, stock: 0, goals: ["Ganho de massa"], flavors: ["Chocolate", "Cookies"], weights: ["2kg"], tags: ["proteína", "blend"], description: "Blend de proteínas concentrada, isolada e hidrolisada em uma só fórmula.", createdAt: "2026-02-14", sales: 300 },
  { id: "whey-veg", name: "Proteína Vegetal 900g", brand: "Vita Core", category: "Whey Protein", subcategory: "Blends", tag: "Massa magra", price: 179.9, oldPrice: 209.9, rating: 4.4, reviews: 288, image: whey, stock: 88, goals: ["Saúde e bem-estar", "Recuperação"], flavors: ["Baunilha", "Neutro"], weights: ["900g"], tags: ["vegano", "proteína vegetal"], description: "Blend de ervilha e arroz com perfil de aminoácidos completo.", createdAt: "2026-07-02", sales: 260, isNew: true },
  { id: "creatina-500", name: "Creatina Micronizada 500g", brand: "Peak Origin", category: "Creatina", subcategory: "Micronizada", tag: "Força", price: 199.9, oldPrice: 239.9, rating: 4.9, reviews: 1870, image: creatine, stock: 76, goals: ["Hipertrofia", "Performance"], flavors: ["Neutro"], weights: ["500g"], tags: ["força", "micronizada"], description: "Creatina micronizada em embalagem econômica de 500 g.", createdAt: "2026-04-22", sales: 2450, bestSeller: true },
  { id: "creatina-caps", name: "Creatina em Cápsulas 120 caps", brand: "Forja Prime", category: "Creatina", subcategory: "Monohidratada", tag: "Força", price: 119.9, rating: 4.6, reviews: 520, image: creatine, stock: 140, goals: ["Hipertrofia", "Performance"], flavors: ["Neutro"], weights: ["120 caps"], tags: ["força", "cápsulas", "praticidade"], description: "Creatina monohidratada em cápsulas para quem prefere praticidade.", createdAt: "2026-05-19", sales: 610 },
  { id: "pre-sem-cafeina", name: "Pré-Treino Zero Cafeína 300g", brand: "Ignite Labs", category: "Pré-Treino", subcategory: "Sem cafeína", tag: "Energia", price: 139.9, rating: 4.5, reviews: 372, image: preworkout, stock: 62, goals: ["Performance"], flavors: ["Limão Siciliano", "Uva"], weights: ["300g"], tags: ["sem cafeína", "pump", "noturno"], description: "Fórmula de pump sem estimulantes, indicada para treinos noturnos.", createdAt: "2026-06-11", sales: 340 },
  { id: "beta-alanina", name: "Beta-Alanina 200g", brand: "Raw Athletics", category: "Pré-Treino", subcategory: "Com cafeína", tag: "Energia", price: 109.9, oldPrice: 129.9, rating: 4.4, reviews: 218, image: preworkout, stock: 45, goals: ["Performance", "Energia"], flavors: ["Neutro"], weights: ["200g"], tags: ["beta-alanina", "resistência"], description: "Beta-alanina pura para suporte à resistência em séries longas.", createdAt: "2026-05-27", sales: 190 },
  { id: "cafeina-caps", name: "Cafeína 210mg 60 caps", brand: "Ignite Labs", category: "Pré-Treino", subcategory: "Com cafeína", tag: "Energia", price: 59.9, rating: 4.7, reviews: 905, image: preworkout, stock: 300, goals: ["Energia", "Performance", "Emagrecimento"], flavors: ["Neutro"], weights: ["60 caps"], tags: ["cafeína", "foco"], description: "Cafeína anidra em cápsulas com dose padronizada.", createdAt: "2026-01-15", sales: 1230 },
  { id: "mass-6kg", name: "Mass Gainer Extreme 6kg", brand: "Titan Fuel", category: "Hipercalórico", subcategory: "Mass Gainer", tag: "Volume", price: 349.9, oldPrice: 429.9, rating: 4.5, reviews: 380, image: mass, stock: 18, goals: ["Ganho de massa"], flavors: ["Chocolate", "Baunilha", "Morango"], weights: ["6kg"], tags: ["bulking", "calorias"], description: "Versão econômica de 6 kg para fases longas de volume.", createdAt: "2026-02-02", sales: 410 },
  { id: "maltodextrina", name: "Maltodextrina 1kg", brand: "NorteNutri", category: "Hipercalórico", subcategory: "Carboidratos", tag: "Energia", price: 49.9, rating: 4.3, reviews: 240, image: mass, stock: 260, goals: ["Energia", "Ganho de massa"], flavors: ["Neutro", "Laranja"], weights: ["1kg"], tags: ["carboidrato", "intra-treino"], description: "Carboidrato de rápida absorção para uso intra e pós-treino.", createdAt: "2026-01-08", sales: 520 },
  { id: "glutamina", name: "Glutamina 300g", brand: "Forja Prime", category: "Aminoácidos", subcategory: "Glutamina", tag: "Recuperação", price: 89.9, oldPrice: 109.9, rating: 4.6, reviews: 615, image: bcaa, stock: 130, goals: ["Recuperação", "Saúde e bem-estar"], flavors: ["Neutro"], weights: ["300g"], tags: ["glutamina", "imunidade"], description: "L-glutamina pura, sem sabor, para suporte à recuperação.", createdAt: "2026-03-29", sales: 700 },
  { id: "eaa", name: "EAA Essential 250g", brand: "Peak Origin", category: "Aminoácidos", subcategory: "EAA", tag: "Recuperação", price: 149.9, rating: 4.7, reviews: 330, image: bcaa, stock: 54, goals: ["Recuperação", "Hipertrofia"], flavors: ["Frutas Vermelhas", "Limão Siciliano"], weights: ["250g"], tags: ["aminoácidos essenciais", "intra-treino"], description: "Nove aminoácidos essenciais em pó, para uso intra-treino.", createdAt: "2026-07-16", sales: 280, isNew: true },
  { id: "bcaa-po", name: "BCAA em Pó 200g", brand: "Raw Athletics", category: "Aminoácidos", subcategory: "BCAA", tag: "Recuperação", price: 79.9, rating: 4.2, reviews: 190, image: bcaa, stock: 0, goals: ["Recuperação"], flavors: ["Uva", "Melancia"], weights: ["200g"], tags: ["bcaa", "pó"], description: "BCAA 2:1:1 em pó com boa solubilidade.", createdAt: "2026-02-20", sales: 150 },
  { id: "omega3", name: "Ômega 3 TG 120 caps", brand: "Vita Core", category: "Vitaminas", subcategory: "Ômegas", tag: "Imunidade", price: 99.9, oldPrice: 119.9, rating: 4.8, reviews: 1080, image: vitamin, stock: 190, goals: ["Saúde e bem-estar"], flavors: ["Neutro"], weights: ["120 caps"], tags: ["ômega", "epa", "dha"], description: "Óleo de peixe na forma triglicerídea, com alta concentração de EPA e DHA.", createdAt: "2026-01-22", sales: 1400 },
  { id: "vitamina-d", name: "Vitamina D3 2000UI 120 caps", brand: "Vita Core", category: "Vitaminas", subcategory: "Minerais", tag: "Imunidade", price: 49.9, rating: 4.9, reviews: 1450, image: vitamin, stock: 320, goals: ["Saúde e bem-estar"], flavors: ["Neutro"], weights: ["120 caps"], tags: ["vitamina d", "imunidade"], description: "Vitamina D3 em cápsulas softgel de dose diária.", createdAt: "2026-02-10", sales: 1980, bestSeller: true },
  { id: "zma", name: "ZMA 90 caps", brand: "Forja Prime", category: "Vitaminas", subcategory: "Minerais", tag: "Recuperação", price: 69.9, rating: 4.4, reviews: 410, image: vitamin, stock: 96, goals: ["Recuperação", "Saúde e bem-estar"], flavors: ["Neutro"], weights: ["90 caps"], tags: ["zinco", "magnésio", "sono"], description: "Zinco, magnésio e vitamina B6 para suporte ao descanso.", createdAt: "2026-04-04", sales: 430 },
  { id: "termo-liquido", name: "Termogênico Líquido 60ml", brand: "Ignite Labs", category: "Termogênicos", subcategory: "Cafeína", tag: "Definição", price: 79.9, oldPrice: 99.9, rating: 4.3, reviews: 350, image: thermo, stock: 22, goals: ["Emagrecimento", "Definição muscular"], flavors: ["Neutro"], weights: ["60ml"], tags: ["termogênico", "líquido"], description: "Fórmula concentrada em gotas, com dosagem ajustável.", createdAt: "2026-05-08", sales: 380 },
  { id: "cla", name: "CLA 1000mg 90 caps", brand: "NorteNutri", category: "Termogênicos", subcategory: "Ácidos graxos", tag: "Definição", price: 59.9, rating: 4.1, reviews: 260, image: thermo, stock: 150, goals: ["Emagrecimento"], flavors: ["Neutro"], weights: ["90 caps"], tags: ["cla", "definição"], description: "Ácido linoleico conjugado em cápsulas softgel.", createdAt: "2026-03-12", sales: 290 },
  { id: "barra-nuts", name: "Barra Proteica Nuts 12un", brand: "Ferro & Fibra", category: "Barras", subcategory: "Barras proteicas", tag: "Praticidade", price: 74.9, oldPrice: 94.9, rating: 4.6, reviews: 320, image: bar, stock: 240, goals: ["Definição muscular", "Saúde e bem-estar"], flavors: ["Amendoim", "Cookies"], weights: ["12un"], tags: ["barra", "snack"], description: "Barra com castanhas, 20 g de proteína e baixo teor de açúcares.", createdAt: "2026-06-25", sales: 420 },
  { id: "pasta-amendoim", name: "Pasta de Amendoim Proteica 1kg", brand: "Ferro & Fibra", category: "Barras", subcategory: "Snacks", tag: "Praticidade", price: 44.9, rating: 4.7, reviews: 890, image: bar, stock: 175, goals: ["Ganho de massa", "Saúde e bem-estar"], flavors: ["Chocolate", "Neutro"], weights: ["1kg"], tags: ["pasta", "amendoim"], description: "Pasta integral com proteína adicionada e sem açúcar refinado.", createdAt: "2026-04-30", sales: 960 },
  { id: "coqueteleira", name: "Coqueteleira Forja 700ml", brand: "Forja Prime", category: "Acessórios", subcategory: "Coqueteleiras", tag: "Praticidade", price: 39.9, oldPrice: 49.9, rating: 4.8, reviews: 1330, image: creatine, stock: 400, goals: ["Saúde e bem-estar"], flavors: ["Neutro"], weights: ["700ml"], tags: ["coqueteleira", "shaker"], description: "Coqueteleira com mola misturadora, tampa vedante e escala em ml.", createdAt: "2026-01-05", sales: 2200 },
  { id: "porta-caps", name: "Porta Cápsulas Semanal", brand: "Forja Prime", category: "Acessórios", subcategory: "Organizadores", tag: "Praticidade", price: 24.9, rating: 4.5, reviews: 210, image: creatine, stock: 0, goals: ["Saúde e bem-estar"], flavors: ["Neutro"], weights: ["Unidade"], tags: ["organizador", "cápsulas"], description: "Organizador semanal com sete compartimentos independentes.", createdAt: "2026-02-18", sales: 180 },
];

const fromExtra = (e: Extra): CatalogProduct => ({
  id: e.id,
  name: e.name,
  brand: e.brand,
  category: e.category,
  tag: e.tag,
  price: e.price,
  ...(e.oldPrice !== undefined ? { oldPrice: e.oldPrice } : {}),
  rating: e.rating,
  reviews: e.reviews,
  image: e.image,
  ...(e.oldPrice ? { badge: `-${Math.round((1 - e.price / e.oldPrice) * 100)}%` } : {}),
  ...(e.bestSeller ? { bestSeller: true } : {}),
  stockLeft: e.stock,
  stockTotal: Math.max(e.stock, 1) * 3,
  slug: slugify(e.name),
  sku: sku(e.id),
  subcategory: e.subcategory,
  description: e.description,
  goals: e.goals,
  flavors: e.flavors,
  weights: e.weights,
  tags: e.tags,
  stock: e.stock,
  status: "ativo",
  createdAt: e.createdAt,
  sales: e.sales,
  ...(e.isNew ? { isNew: true } : {}),
});

export const catalog: CatalogProduct[] = [
  ...baseProducts.map(fromBase),
  ...extras.map(fromExtra),
].filter((p) => p.status === "ativo");

export const catalogBySlug = (slug: string) => catalog.find((p) => p.slug === slug);
export const catalogById = (id: string) => catalog.find((p) => p.id === id);

/** Limite abaixo do qual mostramos "Últimas unidades" (configurável no painel). */
export const LOW_STOCK = 40;
export const SHOW_EXACT_STOCK = false;

/* -------------------------------------------------------------------- filtros */

export type Filters = {
  q: string;
  categorias: string[];
  subcategorias: string[];
  marcas: string[];
  objetivos: string[];
  tipos: string[];
  sabores: string[];
  pesos: string[];
  precoMin: number | null;
  precoMax: number | null;
  nota: number | null;
  disponivel: boolean;
  promo: boolean;
};

export const emptyFilters: Filters = {
  q: "",
  categorias: [],
  subcategorias: [],
  marcas: [],
  objetivos: [],
  tipos: [],
  sabores: [],
  pesos: [],
  precoMin: null,
  precoMax: null,
  nota: null,
  disponivel: false,
  promo: false,
};

export const priceBounds = (() => {
  const prices = catalog.map((p) => p.price);
  return { min: 0, max: Math.ceil(Math.max(...prices) / 50) * 50 };
})();

const norm = (v: string) =>
  v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const searchHaystack = (p: CatalogProduct) =>
  norm(
    [
      p.name,
      p.brand,
      p.category,
      p.subcategory,
      p.tag,
      p.sku,
      p.description,
      ...p.tags,
      ...p.flavors,
      ...p.goals,
      ...p.weights,
    ].join(" "),
  );

export function matchesQuery(p: CatalogProduct, query: string) {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = searchHaystack(p);
  return terms.every((t) => hay.includes(t));
}

export function filterCatalog(list: CatalogProduct[], f: Filters): CatalogProduct[] {
  return list.filter((p) => {
    if (f.q && !matchesQuery(p, f.q)) return false;
    if (f.categorias.length && !f.categorias.includes(slugify(p.category))) return false;
    if (f.subcategorias.length && !f.subcategorias.includes(slugify(p.subcategory))) return false;
    if (f.marcas.length && !f.marcas.includes(slugify(p.brand))) return false;
    if (f.objetivos.length && !p.goals.some((g) => f.objetivos.includes(slugify(g)))) return false;
    if (f.tipos.length && !f.tipos.includes(slugify(p.category))) return false;
    if (f.sabores.length && !p.flavors.some((s) => f.sabores.includes(slugify(s)))) return false;
    if (f.pesos.length && !p.weights.some((w) => f.pesos.includes(slugify(w)))) return false;
    if (f.precoMin !== null && p.price < f.precoMin) return false;
    if (f.precoMax !== null && p.price > f.precoMax) return false;
    if (f.nota !== null && p.rating < f.nota) return false;
    if (f.disponivel && p.stock <= 0) return false;
    if (f.promo && !p.oldPrice) return false;
    return true;
  });
}

export const sortOptions = [
  { value: "relevancia", label: "Mais relevantes" },
  { value: "vendidos", label: "Mais vendidos" },
  { value: "recentes", label: "Mais recentes" },
  { value: "desconto", label: "Maior desconto" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "avaliacao", label: "Melhor avaliação" },
  { value: "populares", label: "Mais populares" },
] as const;

export type SortValue = (typeof sortOptions)[number]["value"];

const discount = (p: CatalogProduct) => (p.oldPrice ? 1 - p.price / p.oldPrice : 0);

export function sortCatalog(list: CatalogProduct[], sort: SortValue): CatalogProduct[] {
  const out = [...list];
  switch (sort) {
    case "vendidos":
      return out.sort((a, b) => b.sales - a.sales);
    case "recentes":
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "desconto":
      return out.sort((a, b) => discount(b) - discount(a));
    case "menor-preco":
      return out.sort((a, b) => a.price - b.price);
    case "maior-preco":
      return out.sort((a, b) => b.price - a.price);
    case "avaliacao":
      return out.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "populares":
      return out.sort((a, b) => b.reviews - a.reviews);
    default:
      return out.sort(
        (a, b) =>
          Number(!!b.bestSeller) - Number(!!a.bestSeller) ||
          b.sales * b.rating - a.sales * a.rating,
      );
  }
}

/* --------------------------------------------------------------------- facets */

export type FacetItem = { value: string; label: string; count: number };

const countBy = (
  list: CatalogProduct[],
  pick: (p: CatalogProduct) => string[],
): FacetItem[] => {
  const map = new Map<string, FacetItem>();
  for (const p of list) {
    for (const label of pick(p)) {
      if (!label) continue;
      const value = slugify(label);
      const cur = map.get(value);
      if (cur) cur.count += 1;
      else map.set(value, { value, label, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
};

export type Facets = {
  categorias: FacetItem[];
  subcategorias: FacetItem[];
  marcas: FacetItem[];
  objetivos: FacetItem[];
  tipos: FacetItem[];
  sabores: FacetItem[];
  pesos: FacetItem[];
};

export function buildFacets(list: CatalogProduct[]): Facets {
  return {
    categorias: countBy(list, (p) => [p.category]),
    subcategorias: countBy(list, (p) => [p.subcategory]),
    marcas: countBy(list, (p) => [p.brand]),
    objetivos: countBy(list, (p) => p.goals),
    tipos: countBy(list, (p) => [p.category]),
    sabores: countBy(list, (p) => p.flavors),
    pesos: countBy(list, (p) => p.weights),
  };
}

/* --------------------------------------------------------- busca / sugestões */

export function searchSuggestions(query: string) {
  const q = norm(query.trim());
  if (!q) return { produtos: [], categorias: [], marcas: [] };
  return {
    produtos: catalog.filter((p) => matchesQuery(p, query)).slice(0, 6),
    categorias: categoryTree.filter((c) => norm(c.name).includes(q)).slice(0, 4),
    marcas: brandList.filter((b) => norm(b.name).includes(q)).slice(0, 4),
  };
}

export const popularProducts = sortCatalog(catalog, "vendidos").slice(0, 8);
