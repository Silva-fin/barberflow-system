import { Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/app/wordmark";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Wordmark />
            <p className="mt-3 text-xs text-muted-foreground">
              Gestão completa para negócios de serviço.
            </p>
          </div>
          <FooterCol title="Produto" items={[
            { label: "Módulos", to: "/modulos" },
            { label: "Monte seu Paladino", to: "/montar" },
            { label: "Preços", to: "/precos" },
          ]} />
          <FooterCol title="Explorar protótipo" items={[
            { label: "Vitrine demo", href: "/b/barbearia-do-zeca" },
            { label: "Painel do cliente", href: "/portal" },
            { label: "Gerenciar agendamento", href: "/manage/abc123" },
            { label: "Pesquisa NPS", href: "/nps/respond/survey-1" },
            { label: "Painel da plataforma", href: "/owner/tenants" },
          ]} />
          <FooterCol title="Conta" items={[
            { label: "Entrar", to: "/login" },
            { label: "Testar grátis", to: "/montar" },
          ]} />
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Paladino. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title, items,
}: {
  title: string;
  items: { label: string; to?: string; href?: string }[];
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-sidebar-primary">{title}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((it) => (
          <li key={it.label}>
            {it.to ? (
              <Link to={it.to} className="text-muted-foreground hover:text-foreground">
                {it.label}
              </Link>
            ) : (
              <a href={it.href} target="_blank" rel="noreferrer"
                 className="text-muted-foreground hover:text-foreground">
                {it.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}