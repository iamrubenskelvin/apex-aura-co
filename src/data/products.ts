import whey from "@/assets/product-whey.png";
import creatine from "@/assets/product-creatine.png";
import preworkout from "@/assets/product-preworkout.png";
import bcaa from "@/assets/product-bcaa.png";
import mass from "@/assets/product-mass.png";
import thermo from "@/assets/product-thermo.png";
import vitamin from "@/assets/product-vitamin.png";
import bar from "@/assets/product-bar.png";

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  tag: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  bestSeller?: boolean;
  stockTotal?: number;
  stockLeft?: number;
};

export const products: Product[] = [
  {
    id: "whey-iso",
    name: "Whey Isolate Pro 900g",
    brand: "Forja Prime",
    category: "Whey Protein",
    tag: "Massa magra",
    price: 189.9,
    oldPrice: 249.9,
    rating: 4.9,
    reviews: 2841,
    image: whey,
    badge: "-24%",
    bestSeller: true,
    stockTotal: 400,
    stockLeft: 68,
  },
  {
    id: "creatina",
    name: "Creatina Monohidratada 300g",
    brand: "Forja Prime",
    category: "Creatina",
    tag: "Força",
    price: 129.9,
    oldPrice: 159.9,
    rating: 5,
    reviews: 4102,
    image: creatine,
    badge: "-19%",
    bestSeller: true,
    stockTotal: 500,
    stockLeft: 42,
  },
  {
    id: "pre-treino",
    name: "Pré-Treino Ignite 300g",
    brand: "Ignite Labs",
    category: "Pré-Treino",
    tag: "Energia",
    price: 149.9,
    oldPrice: 199.9,
    rating: 4.8,
    reviews: 1673,
    image: preworkout,
    badge: "-25%",
    stockTotal: 300,
    stockLeft: 95,
  },
  {
    id: "bcaa",
    name: "BCAA 2:1:1 — 120 caps",
    brand: "Forja Prime",
    category: "Aminoácidos",
    tag: "Recuperação",
    price: 89.9,
    rating: 4.7,
    reviews: 934,
    image: bcaa,
    stockTotal: 250,
    stockLeft: 120,
  },
  {
    id: "hipercalorico",
    name: "Mass Gainer 3kg",
    brand: "Titan Fuel",
    category: "Hipercalórico",
    tag: "Volume",
    price: 219.9,
    oldPrice: 279.9,
    rating: 4.6,
    reviews: 712,
    image: mass,
    badge: "-21%",
    stockTotal: 200,
    stockLeft: 31,
  },
  {
    id: "termogenico",
    name: "Termogênico Burn 100 caps",
    brand: "Ignite Labs",
    category: "Termogênicos",
    tag: "Definição",
    price: 99.9,
    oldPrice: 139.9,
    rating: 4.5,
    reviews: 1288,
    image: thermo,
    badge: "-29%",
    bestSeller: true,
    stockTotal: 350,
    stockLeft: 57,
  },
  {
    id: "multivitaminico",
    name: "Multivitamínico Daily 90 caps",
    brand: "Vita Core",
    category: "Vitaminas",
    tag: "Imunidade",
    price: 79.9,
    rating: 4.8,
    reviews: 1540,
    image: vitamin,
    stockTotal: 400,
    stockLeft: 180,
  },
  {
    id: "barra-proteica",
    name: "Barra Proteica Choco 12un",
    brand: "Forja Prime",
    category: "Barras",
    tag: "Praticidade",
    price: 69.9,
    oldPrice: 89.9,
    rating: 4.7,
    reviews: 613,
    image: bar,
    badge: "-22%",
    stockTotal: 600,
    stockLeft: 210,
  },
];

export const featured = products;
export const bestSellers = products.filter((p) => p.bestSeller || p.rating >= 4.7);
export const flashDeals = products.filter((p) => p.oldPrice).slice(0, 4);

export const categories = [
  { name: "Whey Protein", count: 42, image: whey },
  { name: "Creatina", count: 18, image: creatine },
  { name: "Pré-Treino", count: 24, image: preworkout },
  { name: "Hipercalórico", count: 14, image: mass },
  { name: "Aminoácidos", count: 27, image: bcaa },
  { name: "Vitaminas", count: 56, image: vitamin },
  { name: "Termogênicos", count: 21, image: thermo },
  { name: "Barras", count: 19, image: bar },
  { name: "Acessórios", count: 33, image: creatine },
];

export const brands = [
  "Forja Prime",
  "Titan Fuel",
  "Ignite Labs",
  "Vita Core",
  "Raw Athletics",
  "NorteNutri",
  "Peak Origin",
  "Ferro & Fibra",
];

export const popularSearches = ["Whey isolado", "Creatina 300g", "Pré-treino sem cafeína", "Barra proteica"];

export const testimonials = [
  {
    name: "Camila Duarte",
    city: "Fortaleza, CE",
    rating: 5,
    text: "Chegou em 2 dias e o whey dissolve perfeito. Já é minha terceira compra.",
    initials: "CD",
  },
  {
    name: "Rafael Menezes",
    city: "São Paulo, SP",
    rating: 5,
    text: "Laudo de pureza disponível no site foi o que me convenceu. Produto original.",
    initials: "RM",
  },
  {
    name: "Juliana Prado",
    city: "Curitiba, PR",
    rating: 4,
    text: "Atendimento respondeu no WhatsApp em minutos e trocaram o sabor sem burocracia.",
    initials: "JP",
  },
  {
    name: "Diego Almeida",
    city: "Belo Horizonte, MG",
    rating: 5,
    text: "Pré-treino com dosagem completa de verdade. Rendimento subiu bastante.",
    initials: "DA",
  },
  {
    name: "Beatriz Lima",
    city: "Recife, PE",
    rating: 5,
    text: "Embalagem impecável e preço no PIX melhor que qualquer marketplace.",
    initials: "BL",
  },
];

export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const pixPrice = (value: number) => value * 0.9;
