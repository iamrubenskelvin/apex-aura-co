import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Panel } from "@/components/account/shared";
import { AddressForm, formatAddress, type Address } from "@/components/account/AddressForm";

export const Route = createFileRoute("/_authenticated/conta/enderecos")({ component: AddressesPage });

export function useAddresses(userId: string) {
  return useQuery({
    queryKey: ["addresses", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("addresses").select("*").order("is_default", { ascending: false }).order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

function AddressesPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const q = useAddresses(user.id);
  const [editing, setEditing] = useState<Address | "novo" | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["addresses", user.id] });

  async function makeDefault(id: string) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    refresh();
  }
  async function remove(id: string) {
    if (!confirm("Remover este endereço?")) return;
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) toast.error("Não foi possível remover.");
    refresh();
  }

  return (
    <Panel
      title="Endereços"
      action={!editing && <button onClick={() => setEditing("novo")} className="btn-base btn-primary px-4 py-2 text-sm">Novo endereço</button>}
    >
      {editing ? (
        <AddressForm
          userId={user.id}
          initial={editing === "novo" ? undefined : editing}
          makeDefault={editing === "novo" && (q.data?.length ?? 0) === 0}
          onDone={() => {
            setEditing(null);
            refresh();
          }}
          onCancel={() => setEditing(null)}
        />
      ) : q.data?.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {q.data.map((a) => (
            <li key={a.id} className="rounded-xl border border-border bg-background p-4 text-sm">
              <p className="font-semibold">
                {a.label} {a.is_default && <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">Principal</span>}
              </p>
              <p className="mt-1 text-muted-foreground">{a.recipient}</p>
              <p className="mt-1 text-muted-foreground">{formatAddress(a)}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <button onClick={() => setEditing(a)} className="hover:text-primary">Editar</button>
                {!a.is_default && <button onClick={() => makeDefault(a.id)} className="hover:text-primary">Tornar principal</button>}
                <button onClick={() => remove(a.id)} className="text-destructive">Remover</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{q.isLoading ? "Carregando…" : "Nenhum endereço salvo ainda."}</p>
      )}
    </Panel>
  );
}
