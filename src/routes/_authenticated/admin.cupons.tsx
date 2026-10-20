import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/data/products";
import { Field, fmtDate, inputCls } from "@/components/account/shared";

export const Route = createFileRoute("/_authenticated/admin/cupons")({ component: Page });

const empty = { code: "", description: "", discount_type: "percent", value: "10", min_subtotal: "0", first_purchase_only: false, max_uses_per_user: "1", expires_at: "" };

function Page() {
  const qc = useQueryClient();
  const [f, setF] = useState(empty);
  const q = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => (await supabase.from("coupons").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-coupons"] });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("coupons").insert({
      code: f.code.trim().toUpperCase(),
      description: f.description,
      discount_type: f.discount_type,
      value: Number(f.value),
      min_subtotal: Number(f.min_subtotal) || 0,
      first_purchase_only: f.first_purchase_only,
      max_uses_per_user: Math.max(1, Number(f.max_uses_per_user) || 1),
      expires_at: f.expires_at ? new Date(`${f.expires_at}T23:59:59`).toISOString() : null,
    });
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Já existe um cupom com esse código." : "Não foi possível criar.");
      return;
    }
    toast.success("Cupom criado!");
    setF(empty);
    refresh();
  }
  async function toggle(code: string, active: boolean) {
    await supabase.from("coupons").update({ active }).eq("code", code);
    refresh();
  }
  async function remove(code: string) {
    if (!confirm(`Excluir o cupom ${code}?`)) return;
    await supabase.from("coupons").delete().eq("code", code);
    refresh();
  }
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cupons</h1>
      <form onSubmit={create} className="grid gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-4">
        <Field label="Código"><input required value={f.code} onChange={set("code")} className={inputCls} /></Field>
        <Field label="Tipo">
          <select value={f.discount_type} onChange={set("discount_type")} className={inputCls}>
            <option value="percent">Porcentagem</option>
            <option value="fixed">Valor fixo (R$)</option>
          </select>
        </Field>
        <Field label="Valor"><input required type="number" min="0.01" step="0.01" value={f.value} onChange={set("value")} className={inputCls} /></Field>
        <Field label="Compra mínima (R$)"><input type="number" min="0" step="0.01" value={f.min_subtotal} onChange={set("min_subtotal")} className={inputCls} /></Field>
        <Field label="Descrição" className="sm:col-span-2"><input value={f.description} onChange={set("description")} className={inputCls} /></Field>
        <Field label="Usos por cliente"><input type="number" min="1" value={f.max_uses_per_user} onChange={set("max_uses_per_user")} className={inputCls} /></Field>
        <Field label="Válido até"><input type="date" value={f.expires_at} onChange={set("expires_at")} className={inputCls} /></Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-3">
          <input type="checkbox" checked={f.first_purchase_only} onChange={(e) => setF({ ...f, first_purchase_only: e.target.checked })} /> Só na primeira compra
        </label>
        <button className="btn-base btn-primary px-4 py-2 text-sm">Criar cupom</button>
      </form>
      <ul className="space-y-2">
        {q.data?.map((c) => (
          <li key={c.code} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 text-sm">
            <div>
              <p className="font-mono font-bold">{c.code} <span className="font-sans font-normal text-muted-foreground">· {c.discount_type === "percent" ? `${Number(c.value)}%` : brl(Number(c.value))}</span></p>
              <p className="text-xs text-muted-foreground">
                {Number(c.min_subtotal) > 0 && `mín. ${brl(Number(c.min_subtotal))} · `}{c.first_purchase_only && "1ª compra · "}{c.max_uses_per_user}× por cliente{c.expires_at && ` · até ${fmtDate(c.expires_at)}`}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => toggle(c.code, !c.active)} className={c.active ? "text-primary" : "text-muted-foreground"}>{c.active ? "Ativo" : "Inativo"}</button>
              <button onClick={() => remove(c.code)} className="text-destructive">Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
