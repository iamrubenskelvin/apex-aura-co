import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { hydrateCatalog, resolveImage, type CatalogProduct } from "@/data/catalog";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export function rowToProduct(r: ProductRow): CatalogProduct {
  const price = Number(r.price);
  const oldPrice = r.old_price != null ? Number(r.old_price) : undefined;
  return {
    id: r.id,
    slug: r.slug,
    sku: r.sku,
    name: r.name,
    brand: r.brand,
    category: r.category,
    subcategory: r.subcategory,
    tag: r.tag,
    description: r.description,
    price,
    ...(oldPrice && oldPrice > price ? { oldPrice } : {}),
    rating: Number(r.rating),
    reviews: r.reviews,
    image: resolveImage(r.image),
    ...(r.badge ? { badge: r.badge } : {}),
    ...(r.best_seller ? { bestSeller: true } : {}),
    ...(r.is_new ? { isNew: true } : {}),
    ...(r.featured ? { featured: true } : {}),
    stockLeft: r.stock,
    stockTotal: r.stock_total ?? Math.max(r.stock, 1) * 3,
    stock: r.stock,
    goals: r.goals,
    flavors: r.flavors,
    weights: r.weights,
    tags: r.tags,
    status: r.status === "ativo" ? "ativo" : "inativo",
    sales: r.sales,
    createdAt: r.created_at,
  };
}

/** Leitura pública dos produtos ativos (vitrine). */
export const fetchPublicProducts = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await sb
    .from("products")
    .select("*")
    .eq("status", "ativo")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

let lastSync = 0;
let pending: Promise<void> | null = null;
const TTL = 30_000;

/** Garante que o catálogo em memória reflete o banco (cache curto). */
export function ensureCatalog(force = false) {
  if (!force && Date.now() - lastSync < TTL) return Promise.resolve();
  if (pending) return pending;
  pending = fetchPublicProducts()
    .then((rows) => {
      hydrateCatalog(rows.map(rowToProduct));
      lastSync = Date.now();
    })
    .catch((e) => {
      console.error("Falha ao sincronizar catálogo", e);
    })
    .finally(() => {
      pending = null;
    });
  return pending;
}
