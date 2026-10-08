/**
 * Estado do catálogo na URL — permite compartilhar, recarregar e usar
 * voltar/avançar do navegador sem perder filtros.
 */
import { emptyFilters, priceBounds, sortOptions, type Filters, type SortValue } from "@/data/catalog";

export type CatalogSearch = {
  q: string;
  categoria: string;
  subcategoria: string;
  marca: string;
  objetivo: string;
  tipo: string;
  sabor: string;
  peso: string;
  preco_min: number | undefined;
  preco_max: number | undefined;
  nota: number | undefined;
  disponivel: boolean;
  promo: boolean;
  ordenar: SortValue;
  pagina: number;
  porPagina: number;
};

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
};
const bool = (v: unknown) => v === true || v === "true" || v === "1";

const sorts = sortOptions.map((s) => s.value) as string[];

export function validateCatalogSearch(
  search: Partial<Record<keyof CatalogSearch, unknown>>,
): CatalogSearch {
  const ordenar = str(search["ordenar"]);
  return {
    q: str(search["q"]).slice(0, 100),
    categoria: str(search["categoria"]),
    subcategoria: str(search["subcategoria"]),
    marca: str(search["marca"]),
    objetivo: str(search["objetivo"]),
    tipo: str(search["tipo"]),
    sabor: str(search["sabor"]),
    peso: str(search["peso"]),
    preco_min: num(search["preco_min"]),
    preco_max: num(search["preco_max"]),
    nota: num(search["nota"]),
    disponivel: bool(search["disponivel"]),
    promo: bool(search["promo"]),
    ordenar: (sorts.includes(ordenar) ? ordenar : "relevancia") as SortValue,
    pagina: Math.max(1, num(search["pagina"]) ?? 1),
    porPagina: [12, 24, 48].includes(num(search["porPagina"]) ?? 0)
      ? (num(search["porPagina"]) as number)
      : 24,
  };
}

const list = (v: string) => (v ? v.split(",").filter(Boolean) : []);

export function searchToFilters(s: CatalogSearch): Filters {
  return {
    ...emptyFilters,
    q: s.q,
    categorias: list(s.categoria),
    subcategorias: list(s.subcategoria),
    marcas: list(s.marca),
    objetivos: list(s.objetivo),
    tipos: list(s.tipo),
    sabores: list(s.sabor),
    pesos: list(s.peso),
    precoMin: s.preco_min ?? null,
    precoMax: s.preco_max ?? null,
    nota: s.nota ?? null,
    disponivel: s.disponivel,
    promo: s.promo,
  };
}

export const defaultPrice = priceBounds;

/** Chaves de filtro multi-seleção presentes na URL. */
export const multiKeys = [
  "categoria",
  "subcategoria",
  "marca",
  "objetivo",
  "tipo",
  "sabor",
  "peso",
] as const;

export type MultiKey = (typeof multiKeys)[number];

export function toggleInList(current: string, value: string) {
  const arr = list(current);
  const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  return next.join(",");
}

export const clearedSearch: Partial<CatalogSearch> = {
  categoria: "",
  subcategoria: "",
  marca: "",
  objetivo: "",
  tipo: "",
  sabor: "",
  peso: "",
  preco_min: undefined,
  preco_max: undefined,
  nota: undefined,
  disponivel: false,
  promo: false,
  pagina: 1,
};

/** Search padrão para links que apenas abrem a página sem filtros. */
export const initialCatalogSearch: CatalogSearch = validateCatalogSearch({});
