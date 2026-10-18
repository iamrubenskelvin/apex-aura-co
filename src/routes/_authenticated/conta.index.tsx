import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Field, inputCls, isValidCpf, Panel } from "@/components/account/shared";

export const Route = createFileRoute("/_authenticated/conta/")({ component: ProfilePage });

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [form, setForm] = useState({ full_name: "", phone: "", cpf: "", birth_date: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (q.data)
      setForm({
        full_name: q.data.full_name,
        phone: q.data.phone,
        cpf: q.data.cpf,
        birth_date: q.data.birth_date ?? "",
      });
  }, [q.data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (form.cpf && !isValidCpf(form.cpf)) return toast.error("CPF inválido.");
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      cpf: form.cpf.replace(/\D/g, ""),
      birth_date: form.birth_date || null,
      updated_at: new Date().toISOString(),
    });
    setBusy(false);
    if (error) return toast.error("Não foi possível salvar.");
    toast.success("Dados salvos!");
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <Panel title="Meus dados">
      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo" className="sm:col-span-2">
            <input required value={form.full_name} onChange={set("full_name")} className={inputCls} autoComplete="name" />
          </Field>
          <Field label="E-mail">
            <input value={user.email ?? ""} disabled className={`${inputCls} opacity-60`} />
          </Field>
          <Field label="Celular">
            <input value={form.phone} onChange={set("phone")} className={inputCls} inputMode="tel" autoComplete="tel" placeholder="(85) 90000-0000" />
          </Field>
          <Field label="CPF">
            <input value={form.cpf} onChange={set("cpf")} className={inputCls} inputMode="numeric" placeholder="000.000.000-00" />
          </Field>
          <Field label="Data de nascimento">
            <input type="date" value={form.birth_date} onChange={set("birth_date")} className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <button disabled={busy} className="btn-base btn-primary px-6 py-3 text-sm disabled:opacity-60">
              {busy ? "Salvando…" : "Salvar dados"}
            </button>
          </div>
        </form>
      )}
    </Panel>
  );
}
