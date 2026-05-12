import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, ChartBar, Scissors, Sparkles, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Navalha — Gestão completa para barbearias" },
      { name: "description", content: "Painel administrativo + agendamento online. Gerencie agenda, clientes, equipe e financeiro em um só lugar." },
      { property: "og:title", content: "Navalha — Gestão para barbearias" },
      { property: "og:description", content: "Painel administrativo + agendamento online para sua barbearia." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-2xl tracking-wider">NAVALHA</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              to="/b/$slug" params={{ slug: "barbearia-do-zeca" }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Ver demo de agendamento
            </Link>
            <ThemeToggle />
            <Link
              to="/login"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-[0.2em] text-primary">Para barbeiros e barbearias</span>
          <h1 className="mt-4 font-display text-6xl leading-[1.05] tracking-wide md:text-8xl">
            Sua barbearia<br />no controle.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Painel para gerenciar agenda, clientes, equipe e finanças. Link de
            agendamento online para os clientes marcarem horário sem complicação.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Acessar painel
            </Link>
            <Link
              to="/b/$slug" params={{ slug: "barbearia-do-zeca" }}
              className="rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent"
            >
              Ver agendamento público
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            { icon: Calendar, title: "Agenda inteligente", desc: "Calendário por barbeiro com slots automáticos." },
            { icon: Users, title: "Ficha do cliente", desc: "Histórico, preferências e total gasto." },
            { icon: Scissors, title: "Serviços e preços", desc: "Catálogo completo, duração e comissões." },
            { icon: ChartBar, title: "Financeiro", desc: "Receitas, despesas e relatórios diários." },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-card p-6">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Navalha. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
