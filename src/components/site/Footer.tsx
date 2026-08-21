import { Facebook, Instagram, Lock, ShieldCheck, Youtube } from "lucide-react";

const columns = [
  {
    title: "Institucional",
    links: ["Sobre a Forja Nutri", "Laudos de pureza", "Trabalhe conosco", "Blog"],
  },
  { title: "Atendimento", links: ["Central de ajuda", "Rastrear pedido", "Trocas e devoluções", "Fretes e prazos"] },
  { title: "Minha Conta", links: ["Entrar", "Meus pedidos", "Lista de desejos", "Meus dados"] },
];

const socials = [
  { icon: Instagram, label: "Instagram" },
  { icon: Facebook, label: "Facebook" },
  { icon: Youtube, label: "YouTube" },
];

const payments = ["PIX", "Visa", "Master", "Elo", "Amex", "Boleto"];

export function Footer() {
  return (
    <footer id="rodape" className="border-t border-border bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {columns.map((col) => (
          <nav key={col.title} className="min-w-0" aria-label={col.title}>
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#topo" className="transition-colors hover:text-primary">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Redes Sociais</h2>
          <div className="mt-4 flex gap-2">
            {socials.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#topo"
                aria-label={label}
                className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-all hover:scale-110 hover:border-primary/50 hover:text-primary"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          <p className="mt-6 text-sm font-semibold">Formas de pagamento</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {payments.map((p) => (
              <span
                key={p}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-primary" /> Site seguro SSL
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Compra protegida
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-5 py-8 text-center text-xs leading-relaxed text-muted-foreground lg:px-8">
        <p className="mx-auto max-w-3xl">
          Forja Nutri Comércio de Suplementos LTDA · CNPJ 00.000.000/0001-00 · Fortaleza/CE. Os
          produtos e informações deste site não substituem orientação médica ou nutricional.
        </p>
        <p className="mt-3">© {new Date().getFullYear()} Forja Nutri. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
