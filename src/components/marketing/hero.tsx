import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { CATALOG } from "@/lib/marketing/catalog";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--sidebar-primary) 25%, transparent), transparent 60%), radial-gradient(circle at 80% 80%, color-mix(in oklab, var(--sidebar-primary) 15%, transparent), transparent 60%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-[0.2em] text-sidebar-primary">
            <Sparkles size={12} /> Plataforma modular
          </span>
          <h1 className="mt-6 font-display text-6xl leading-[1.02] tracking-wide md:text-7xl">
            Sua barbearia inteira,<br />
            <span className="text-sidebar-primary">em uma plataforma.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Agenda, equipe, caixa, comunicação, vitrine e financeiro — escolha só o que precisa e ative o resto quando fizer sentido.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/montar"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Monte seu Paladino <ArrowRight size={14} />
            </Link>
            <Link
              to="/modulos"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm hover:bg-muted"
            >
              Ver todos os módulos
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {CATALOG.length} módulos · sem cartão · comece em minutos
          </p>
        </div>

        <HeroMock />
      </div>
    </section>
  );
}

function HeroMock() {
  const icons = CATALOG.slice(0, 12);
  return (
    <div className="relative">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-sidebar-primary">
            paladino.app
          </span>
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">Meus módulos</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {icons.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.slug}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-border bg-background/40 p-2"
              >
                <Icon size={16} strokeWidth={1.5} className="text-sidebar-primary" />
                <span className="line-clamp-1 text-center text-[9px] text-muted-foreground">
                  {m.name}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-md border border-sidebar-primary/40 bg-sidebar-primary/10 px-3 py-2">
          <span className="text-xs">Plano ativo</span>
          <span className="font-display text-lg text-sidebar-primary">R$ 149/mês</span>
        </div>
      </div>
    </div>
  );
}