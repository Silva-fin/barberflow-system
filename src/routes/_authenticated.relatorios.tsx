import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight, BarChart3, Percent, Star, Boxes, ShieldCheck, Users,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Paladino" }] }),
  component: RelatoriosPage,
});

type Item = { to: string; icon: LucideIcon; title: string; desc: string };

const ACTIVE: Item[] = [
  { to: "/financeiro/dre", icon: BarChart3,  title: "DRE",        desc: "Demonstrativo de resultados do mês." },
  { to: "/comissoes",      icon: Percent,    title: "Comissões",  desc: "A pagar, pagas e por profissional." },
  { to: "/nps",            icon: Star,       title: "NPS",        desc: "Satisfação e pesquisas respondidas." },
  { to: "/estoque",        icon: Boxes,      title: "Estoque",    desc: "Quantidades e custo médio." },
  { to: "/audit",          icon: ShieldCheck,title: "Auditoria",  desc: "Trilha de ações sensíveis." },
  { to: "/crm",            icon: Users,      title: "CRM",        desc: "Clientes em risco e classificações." },
];

const SOON: { title: string; desc: string }[] = [
  { title: "Fluxo de caixa",              desc: "Entradas e saídas com projeção." },
  { title: "Performance por profissional",desc: "Ranking e produtividade." },
  { title: "Agendamentos por período",    desc: "Picos e ocupação por horário." },
];

function RelatoriosPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administração"
        title="Relatórios"
        description="Acesso rápido a indicadores e relatórios."
      />

      <section className="space-y-3">
        <h2 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Disponíveis</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVE.map(it => (
            <Link key={it.to} to={it.to} className="block">
              <Card className="h-full transition-colors hover:bg-muted/30">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <it.icon size={18} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg">{it.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{it.desc}</p>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.5} className="mt-1 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Em breve</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SOON.map(it => (
            <Card key={it.title} className="cursor-default opacity-60">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <BarChart3 size={18} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg">{it.title}</p>
                    <Badge variant="outline" className="font-normal">Em breve</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{it.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}