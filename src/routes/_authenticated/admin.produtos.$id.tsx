import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brandList, categoryTree, goals, productImages, resolveImage } from "@/data/catalog";
import { slugify } from "@/data/product-details";
import { ensureCatalog } from "@/lib/catalog-sync";

export const Route = createFileRoute("/_authenticated/admin/produtos/$id")({
  component: EditProduct,
});

type Form = {
  name: string; slug: string; sku: string; brand: string; category: string; subcategory: string;
  tag: string; description: string; price: string; old_price: string; stock: string; image: string;
  goals: string[]; flavors: string; weights: string; tags: string; status: string;
  best_seller: boolean; is_new: boolean; featured: boolean; sort_order: string;
};

const empty: Form = {
  name: "", slug: "", sku: "", brand: brandList[0]?.name ?? "", category: categoryTree[0]?.name ?? "",
  subcategory: "", tag: "", description: "", price: "", old_price: "", stock: "0", image: "whey",
  goals: [], flavors: "", weights: "", tags: "", status: "ativo",
  best_seller: false, is_new: false, featured: false, sort_order: "100",
};

const list = (s: string) => s.split(",").map((v) => v.trim()).filter(Boolean);
const field = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function EditProduct() {
  const { id } = Route.useParams();
  const isNew = id === "novo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [f, setF] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);

  const q = useQuery({
    queryKey: ["admin-product", id],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const p = q.data;
    if (!p) return;
    setF({
      name: p.name, slug: p.slug, sku: p.sku, brand: p.brand, category: p.category,
      subcategory: p.subcategory, tag: p.tag, description: p.description,
      price: String(p.price), old_price: p.old_price != null ? String(p.old_price) : "",
      stock: String(p.stock), image: p.image, goals: p.goals,
      flavors: p.flavors.join(", "), weights: p.weights.join(", "), tags: p.tags.join(", "),
      status: p.status, best_seller: p.best_seller, is_new: p.is_new, featured: p.featured,
      sort_order: String(p.sort_order),
    });
  }, [q.data]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));
  const subs = categoryTree.find((c) => c.name === f.category)?.children ?? [];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(f.price.replace(",", "."));
    const old = f.old_price ? Number(f.old_price.replace(",", ".")) : null;
    if (!f.name.trim() || !(price > 0)) { toast.error("Informe nome e preço válido."); return; }
    const slug = f.slug.trim() || slugify(f.name);
    const badge = old && old > price ? `-${Math.round((1 - price / old) * 100)}%` : null;
    const row = {
      name: f.name.trim(), slug, sku: f.sku.trim(), brand: f.brand, category: f.category,
      subcategory: f.subcategory, tag: f.tag, description: f.description, price,
      old_price: old && old > price ? old : null, badge, stock: Math.max(0, parseInt(f.stock) || 0),
      image: f.image.trim() || "whey", goals: f.goals, flavors: list(f.flavors), weights: list(f.weights),
      tags: list(f.tags), status: f.status, best_seller: f.best_seller, is_new: f.is_new,
      featured: f.featured, sort_order: parseInt(f.sort_order) || 0, updated_at: new Date().toISOString(),
    };
    setSaving(true);
    const { error } = isNew
      ? await supabase.from("products").insert({ ...row, id: slug })
      : await supabase.from("products").update(row).eq("id", id);
    setSaving(false);
    if (error) { toast.error(error.code === "23505" ? "Já existe um produto com esse endereço (slug)." : error.message); return; }
    toast.success(isNew ? "Produto criado." : "Alterações salvas.");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["admin-product", id] });
    await ensureCatalog(true);
    navigate({ to: "/admin" });
  }

  if (!isNew && q.isLoading) return <p className="text-muted-foreground">Carregando…</p>;
  if (!isNew && !q.data) return <p>Produto não encontrado.</p>;

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-2" aria-label="Voltar">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">{isNew ? "Novo produto" : f.name}</h1>
        <button disabled={saving} className="ml-auto rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Informações">
            <L label="Nome"><input className={field} value={f.name} onChange={(e) => set("name", e.target.value)} required /></L>
            <div className="grid gap-3 sm:grid-cols-2">
              <L label="Endereço (slug)"><input className={field} value={f.slug} placeholder={slugify(f.name || "nome-do-produto")} onChange={(e) => set("slug", e.target.value)} /></L>
              <L label="SKU"><input className={field} value={f.sku} onChange={(e) => set("sku", e.target.value)} /></L>
            </div>
            <L label="Descrição"><textarea rows={4} className={field} value={f.description} onChange={(e) => set("description", e.target.value)} /></L>
            <L label="Etiqueta curta (ex.: Massa magra)"><input className={field} value={f.tag} onChange={(e) => set("tag", e.target.value)} /></L>
          </Card>

          <Card title="Preço e estoque">
            <div className="grid gap-3 sm:grid-cols-3">
              <L label="Preço (R$)"><input className={field} inputMode="decimal" value={f.price} onChange={(e) => set("price", e.target.value)} required /></L>
              <L label="Preço antigo (promoção)"><input className={field} inputMode="decimal" value={f.old_price} onChange={(e) => set("old_price", e.target.value)} /></L>
              <L label="Estoque"><input className={field} type="number" min={0} value={f.stock} onChange={(e) => set("stock", e.target.value)} /></L>
            </div>
            <p className="text-xs text-muted-foreground">Preencha o preço antigo para mostrar o produto como promoção. O selo de desconto é calculado sozinho.</p>
          </Card>

          <Card title="Variações e busca">
            <L label="Sabores (separados por vírgula)"><input className={field} value={f.flavors} onChange={(e) => set("flavors", e.target.value)} /></L>
            <L label="Pesos / tamanhos (separados por vírgula)"><input className={field} value={f.weights} onChange={(e) => set("weights", e.target.value)} /></L>
            <L label="Palavras-chave (separadas por vírgula)"><input className={field} value={f.tags} onChange={(e) => set("tags", e.target.value)} /></L>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Imagem">
            <img src={resolveImage(f.image)} alt="" className="mx-auto h-40 w-40 rounded-xl bg-surface-2 object-contain" />
            <div className="flex flex-wrap gap-2">
              {Object.keys(productImages).map((k) => (
                <button type="button" key={k} onClick={() => set("image", k)} className={`rounded-lg border p-1 ${f.image === k ? "border-primary" : "border-border"}`} aria-label={`Usar imagem ${k}`}>
                  <img src={productImages[k]} alt="" className="h-10 w-10 object-contain" />
                </button>
              ))}
            </div>
            <label className="btn-base btn-ghost-outline w-full cursor-pointer px-4 py-3 text-sm">
              Enviar foto do computador
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) return void toast.error("A foto precisa ter até 5 MB.");
                  const t = toast.loading("Enviando foto…");
                  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
                  const path = `${crypto.randomUUID()}.${ext}`;
                  const up = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
                  if (up.error) return void toast.error("Não foi possível enviar a foto.", { id: t });
                  const signed = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
                  if (signed.error || !signed.data) return void toast.error("Não foi possível gerar o link da foto.", { id: t });
                  set("image", signed.data.signedUrl);
                  toast.success("Foto enviada. Salve o produto para aplicar.", { id: t });
                }}
              />
            </label>
            <L label="Ou cole o endereço de uma imagem"><input className={field} value={productImages[f.image] ? "" : f.image} placeholder="https://…" onChange={(e) => set("image", e.target.value)} /></L>
          </Card>

          <Card title="Organização">
            <L label="Status">
              <select className={field} value={f.status} onChange={(e) => set("status", e.target.value)}>
                <option value="ativo">Ativo (aparece na loja)</option>
                <option value="inativo">Inativo (escondido)</option>
              </select>
            </L>
            <L label="Marca">
              <select className={field} value={f.brand} onChange={(e) => set("brand", e.target.value)}>
                {brandList.map((b) => <option key={b.slug}>{b.name}</option>)}
              </select>
            </L>
            <L label="Categoria">
              <select className={field} value={f.category} onChange={(e) => { set("category", e.target.value); set("subcategory", ""); }}>
                {categoryTree.map((c) => <option key={c.slug}>{c.name}</option>)}
              </select>
            </L>
            <L label="Subcategoria">
              {subs.length ? (
                <select className={field} value={f.subcategory} onChange={(e) => set("subcategory", e.target.value)}>
                  <option value="">—</option>
                  {subs.map((s) => <option key={s.slug}>{s.name}</option>)}
                </select>
              ) : (
                <input className={field} value={f.subcategory} onChange={(e) => set("subcategory", e.target.value)} />
              )}
            </L>
            <L label="Ordem de exibição"><input className={field} type="number" value={f.sort_order} onChange={(e) => set("sort_order", e.target.value)} /></L>
          </Card>

          <Card title="Objetivos">
            <div className="flex flex-wrap gap-2">
              {goals.map((g) => {
                const on = f.goals.includes(g.name);
                return (
                  <button type="button" key={g.slug} onClick={() => set("goals", on ? f.goals.filter((x) => x !== g.name) : [...f.goals, g.name])}
                    className={`rounded-full border px-3 py-1 text-xs ${on ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>
                    {g.name}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Destaques">
            {([["featured", "Destaque na home"], ["best_seller", "Mais vendido"], ["is_new", "Lançamento"]] as const).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} className="accent-[var(--primary)]" />
                {label}
              </label>
            ))}
          </Card>
        </div>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
