import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate, inputCls, Panel } from "@/components/account/shared";

export const Route = createFileRoute("/_authenticated/conta/avaliacoes")({ component: Page });

function Page() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["reviews-account", user.id],
    queryFn: async () => {
      const [{ data: delivered }, { data: reviews }, { data: profile }] = await Promise.all([
        supabase.from("orders").select("order_items(product_id, name, image)").eq("status", "entregue"),
        supabase.from("product_reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      ]);
      const products = new Map<string, { product_id: string; name: string; image: string }>();
      for (const o of delivered ?? []) for (const i of o.order_items) products.set(i.product_id, i);
      const reviewed = new Set((reviews ?? []).map((r) => r.product_id));
      return {
        pending: [...products.values()].filter((p) => !reviewed.has(p.product_id)),
        reviews: reviews ?? [],
        names: products,
        firstName: (profile?.full_name ?? "").split(" ")[0] || "Cliente",
      };
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["reviews-account", user.id] });

  async function remove(id: string) {
    if (!confirm("Excluir esta avaliação?")) return;
    await supabase.from("product_reviews").delete().eq("id", id);
    refresh();
  }

  return (
    <>
      <Panel title="Avaliar compras">
        <p className="mb-4 text-xs text-muted-foreground">
          Só é possível avaliar produtos de pedidos entregues, uma vez por produto. Isso garante avaliações reais.
        </p>
        {q.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : q.data?.pending.length ? (
          <ul className="space-y-4">
            {q.data.pending.map((p) => (
              <ReviewForm key={p.product_id} product={p} userId={user.id} author={q.data!.firstName} onDone={refresh} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum produto aguardando avaliação.</p>
        )}
      </Panel>
      {!!q.data?.reviews.length && (
        <Panel title="Minhas avaliações">
          <ul className="divide-y divide-border">
            {q.data.reviews.map((r) => (
              <li key={r.id} className="py-3 text-sm">
                <p className="font-semibold">{q.data!.names.get(r.product_id)?.name ?? r.product_id}</p>
                <Stars value={r.rating} />
                {r.title && <p className="mt-1 font-medium">{r.title}</p>}
                <p className="text-muted-foreground">{r.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {fmtDate(r.created_at)} {r.status === "oculta" && "· Oculta pela loja"} ·{" "}
                  <button onClick={() => remove(r.id)} className="text-destructive">Excluir</button>
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="mt-1 flex gap-1" role={onChange ? "radiogroup" : undefined} aria-label="Nota">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
          className="disabled:cursor-default"
        >
          <Star className={`h-5 w-5 ${n <= value ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({
  product,
  userId,
  author,
  onDone,
}: {
  product: { product_id: string; name: string; image: string };
  userId: string;
  author: string;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 10) return toast.error("Conte um pouco mais (mínimo 10 caracteres).");
    setBusy(true);
    const { error } = await supabase.from("product_reviews").insert({
      product_id: product.product_id,
      user_id: userId,
      author_name: author,
      rating,
      title: title.trim().slice(0, 120),
      body: body.trim().slice(0, 2000),
    });
    setBusy(false);
    if (error) return toast.error("Não foi possível enviar a avaliação.");
    toast.success("Obrigado pela avaliação!");
    onDone();
  }

  return (
    <li className="rounded-xl border border-border bg-background p-4">
      <form onSubmit={submit} className="space-y-3">
        <div className="flex items-center gap-3">
          <img src={product.image} alt="" className="h-12 w-12 rounded-lg bg-surface-2 object-contain p-1" />
          <p className="text-sm font-semibold">{product.name}</p>
        </div>
        <Stars value={rating} onChange={setRating} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (opcional)" aria-label="Título" className={inputCls} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="O que achou do produto?" aria-label="Avaliação" rows={3} className={inputCls} />
        <button disabled={busy} className="btn-base btn-primary px-5 py-2.5 text-sm disabled:opacity-60">{busy ? "Enviando…" : "Enviar avaliação"}</button>
      </form>
    </li>
  );
}
