import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/data/products";
import { resolveImage } from "@/data/catalog";
import { ensureCatalog } from "@/lib/catalog-sync";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminProducts,
});

function AdminProducts() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const list = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const rows = useMemo(() => {
    const t = q.toLowerCase();
    return (list.data ?? []).filter((p) =>
      [p.name, p.brand, p.category, p.sku].some((v) => v.toLowerCase().includes(t)),
    );
  }, [list.data, q]);

  async function remove(id: string, name: string) {
    if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Produto excluído.");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    ensureCatalog(true);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <span className="text-sm text-muted-foreground">{list.data?.length ?? 0} cadastrados</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, marca, categoria ou SKU"
          className="ml-auto w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-primary sm:w-80"
        />
        <Link
          to="/admin/produtos/$id"
          params={{ id: "novo" }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Novo produto
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3">Produto</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Estoque</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {list.isLoading && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Carregando…</td></tr>
            )}
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-surface/60">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={resolveImage(p.image)} alt="" className="h-10 w-10 rounded-lg bg-surface-2 object-contain" />
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.brand} · {p.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{p.category}</td>
                <td className="p-3">
                  {brl(Number(p.price))}
                  {p.old_price && <div className="text-xs text-muted-foreground line-through">{brl(Number(p.old_price))}</div>}
                </td>
                <td className={`p-3 ${p.stock === 0 ? "text-promo" : ""}`}>{p.stock === 0 ? "Esgotado" : p.stock}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${p.status === "ativo" ? "bg-primary/15 text-primary" : "bg-surface-2 text-muted-foreground"}`}>
                    {p.status === "ativo" ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Link to="/admin/produtos/$id" params={{ id: p.id }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2" aria-label={`Editar ${p.name}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button onClick={() => remove(p.id, p.name)} className="grid h-8 w-8 place-items-center rounded-lg text-promo hover:bg-surface-2" aria-label={`Excluir ${p.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
