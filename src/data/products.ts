import whey from "@/assets/product-whey.png";
import creatine from "@/assets/product-creatine.png";
import preworkout from "@/assets/product-preworkout.png";
import bcaa from "@/assets/product-bcaa.png";

export type Product = {
  id: string;
  name: string;
  tag: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
};

export const products: Product[] = [
  {
    id: "whey-iso",
    name: "Whey Isolate Pro 900g",
    tag: "Massa magra",
    price: 189.9,
    oldPrice: 249.9,
    rating: 4.9,
    reviews: 2841,
    image: whey,
    badge: "-24%",
  },
  {
    id: "creatina",
    name: "Creatina Monohidratada 300g",
    tag: "Força",
    price: 129.9,
    oldPrice: 159.9,
    rating: 5.0,
    reviews: 4102,
    image: creatine,
    badge: "Mais vendido",
  },
  {
    id: "pre-treino",
    name: "Pré-Treino Ignite 300g",
    tag: "Energia",
    price: 149.9,
    oldPrice: 199.9,
    rating: 4.8,
    reviews: 1673,
    image: preworkout,
    badge: "-25%",
  },
  {
    id: "bcaa",
    name: "BCAA 2:1:1 — 120 caps",
    tag: "Recuperação",
    price: 89.9,
    rating: 4.7,
    reviews: 934,
    image: bcaa,
  },
];

export const categories = [
  { name: "Proteínas", count: 42 },
  { name: "Creatina", count: 18 },
  { name: "Pré-treino", count: 24 },
  { name: "Emagrecimento", count: 31 },
  { name: "Vitaminas", count: 56 },
  { name: "Combos", count: 12 },
];

export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
