import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Field, inputCls } from "./shared";

export type Address = Database["public"]["Tables"]["addresses"]["Row"];

const empty = { label: "Casa", recipient: "", cep: "", street: "", number: "", complement: "", district: "", city: "", state: "" };

export function AddressForm({
  userId,
  initial,
  makeDefault,
  onDone,
  onCancel,
}: {
  userId: string;
  initial?: Address | undefined;
  makeDefault?: boolean;
  onDone: (id: string) => void;
  onCancel?: () => void;
}) {
  const [f, setF] = useState(initial ? { ...empty, ...initial } : empty);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function lookupCep(cep: string) {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const j = (await r.json()) as { logradouro?: string; bairro?: string; localidade?: string; uf?: string; erro?: boolean };
      if (j.erro) return;
      setF((prev) => ({
        ...prev,
        street: j.logradouro || prev.street,
        district: j.bairro || prev.district,
        city: j.localidade || prev.city,
        state: j.uf || prev.state,
      }));
    } catch {
      /* preenchimento manual */
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      label: f.label, recipient: f.recipient, cep: f.cep.replace(/\D/g, ""), street: f.street, number: f.number,
      complement: f.complement, district: f.district, city: f.city, state: f.state.toUpperCase().slice(0, 2),
      user_id: userId,
      ...(makeDefault ? { is_default: true } : {}),
    };
    const res = initial
      ? await supabase.from("addresses").update(payload).eq("id", initial.id).select("id").single()
      : await supabase.from("addresses").insert(payload).select("id").single();
    setBusy(false);
    if (res.error || !res.data) return toast.error("Não foi possível salvar o endereço.");
    toast.success("Endereço salvo!");
    onDone(res.data.id);
  }

  return (
    <form onSubmit={save} className="grid gap-3 sm:grid-cols-6">
      <Field label="Apelido" className="sm:col-span-2"><input value={f.label} onChange={set("label")} className={inputCls} placeholder="Casa, Trabalho…" /></Field>
      <Field label="Quem recebe" className="sm:col-span-4"><input required value={f.recipient} onChange={set("recipient")} className={inputCls} /></Field>
      <Field label="CEP" className="sm:col-span-2">
        <input required value={f.cep} onChange={set("cep")} onBlur={(e) => lookupCep(e.target.value)} inputMode="numeric" className={inputCls} placeholder="00000-000" />
      </Field>
      <Field label="Rua" className="sm:col-span-4"><input required value={f.street} onChange={set("street")} className={inputCls} /></Field>
      <Field label="Número" className="sm:col-span-2"><input required value={f.number} onChange={set("number")} className={inputCls} /></Field>
      <Field label="Complemento" className="sm:col-span-4"><input value={f.complement} onChange={set("complement")} className={inputCls} /></Field>
      <Field label="Bairro" className="sm:col-span-2"><input required value={f.district} onChange={set("district")} className={inputCls} /></Field>
      <Field label="Cidade" className="sm:col-span-3"><input required value={f.city} onChange={set("city")} className={inputCls} /></Field>
      <Field label="UF" className="sm:col-span-1"><input required maxLength={2} value={f.state} onChange={set("state")} className={inputCls} /></Field>
      <div className="flex gap-2 sm:col-span-6">
        <button disabled={busy} className="btn-base btn-primary px-6 py-3 text-sm disabled:opacity-60">{busy ? "Salvando…" : "Salvar endereço"}</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-base btn-ghost-outline px-6 py-3 text-sm">Cancelar</button>}
      </div>
    </form>
  );
}

export function formatAddress(a: Pick<Address, "street" | "number" | "complement" | "district" | "city" | "state" | "cep">) {
  return `${a.street}, ${a.number}${a.complement ? ` — ${a.complement}` : ""} · ${a.district}, ${a.city}/${a.state} · CEP ${a.cep}`;
}
