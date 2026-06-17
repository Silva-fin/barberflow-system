import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Calendar, BarChart3, Wallet, Users, Store, CalendarCheck, Star, ExternalLink, UserCircle, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wordmark } from "@/components/app/wordmark";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Paladino — Gestão para negócios de serviço" },
      { name: "description", content: "Plataforma multi-tenant para gestão de negócios de serviço. Agenda, equipe, caixa e operação em um só painel." },
      { property: "og:title", content: "Paladino — Gestão para negócios de serviço" },
      { property: "og:description", content: "Plataforma multi-tenant para gestão de negócios de serviço." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { login } = useAuth();
  const navigate = useNavigate();

  async function openPlatform() {
    await login("platform@paladino.com", "demo", "PLATFORM_OWNER");
    navigate({ to: "/owner/tenants" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center">
            <Wordmark />
          </Link>
          <nav className="flex shrink-0 items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link
              to="/login"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 sm:px-4"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-[0.25em] text-sidebar-primary">
            Plataforma multi-tenant
          </span>
          <h1 className="mt-4 font-display text-6xl leading-[1.05] tracking-wide md:text-8xl">
            Seu negócio,<br />no controle.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Paladino é a plataforma para gerir negócios de serviço — agenda,
            equipe, caixa, operação e financeiro em um só lugar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Acessar painel
            </Link>
            <a
              href="/b/barbearia-do-zeca"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm hover:bg-muted"
            >
              <Store size={16} strokeWidth={1.5} />
              Vitrine
              <ExternalLink size={12} strokeWidth={1.5} className="text-muted-foreground" />
            </a>
            <a
              href="/manage/abc123"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm hover:bg-muted"
            >
              <CalendarCheck size={16} strokeWidth={1.5} />
              Gerenciar agendamento
              <ExternalLink size={12} strokeWidth={1.5} className="text-muted-foreground" />
            </a>
            <a
              href="/nps/respond/survey-1"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm hover:bg-muted"
            >
              <Star size={16} strokeWidth={1.5} />
              Pesquisa NPS
              <ExternalLink size={12} strokeWidth={1.5} className="text-muted-foreground" />
            </a>
            <a
              href="/portal/login"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm hover:bg-muted"
            >
              <UserCircle size={16} strokeWidth={1.5} />
              Painel do cliente
              <ExternalLink size={12} strokeWidth={1.5} className="text-muted-foreground" />
            </a>
            <button
              type="button"
              onClick={openPlatform}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm hover:bg-muted"
            >
              <ShieldCheck size={16} strokeWidth={1.5} />
              Painel da plataforma
            </button>
          </div>
          <div className="mt-4 space-y-1 text-xs text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">manage:</span>{" "}
              <code>abc123</code> ativo · <code>abc123x</code> inválido ·{" "}
              <code>abc123d</code> depósito retido · <code>abc123r</code> erro remarcação
            </p>
            <p>
              <span className="font-medium text-foreground">nps:</span>{" "}
              <code>survey-1</code> normal · <code>survey-x</code> indisponível
            </p>
            <p>
              <span className="font-medium text-foreground">portal:</span>{" "}
              senha <code>errada</code> = 401 · e-mail <code>*x@…</code> = magic inválido · token <code>…x</code> = expirado
            </p>
            <p>
              <span className="font-medium text-foreground">platform:</span>{" "}
              o atalho entra automaticamente como <code>PLATFORM_OWNER</code>
            </p>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            { icon: Calendar, title: "Agenda inteligente", desc: "Calendário por profissional com slots automáticos." },
            { icon: Users, title: "CRM completo", desc: "Histórico, preferências e clientes em risco." },
            { icon: Wallet, title: "Caixa e pagamentos", desc: "Cobranças, conciliação e fechamento diário." },
            { icon: BarChart3, title: "Relatórios", desc: "Receita, despesa, margem e comissões." },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-card p-6">
              <f.icon size={20} strokeWidth={1.5} className="text-sidebar-primary" />
              <h3 className="mt-4 font-display text-lg">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Paladino. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
