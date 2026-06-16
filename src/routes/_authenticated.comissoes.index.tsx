import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Percent, History, Wallet, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";
import { mockCommissionsHub } from "@/lib/mock/fase-reskin";

export const Route = createFileRoute("/_authenticated/comissoes/")({
  head: () => ({ meta: [{ title: "Comissões — Paladino" }] }),
  component: ComissoesHub,
});

const links = [
  { to: "/comissoes/regras",     icon: Percent, title: "Regras",     desc: "Como calculamos comissões por barbeiro/serviço." },
  { to: "/comissoes/historico",  icon: History, title: "Histórico",  desc: "Comissões geradas por agendamentos, pacotes e assinaturas." },
  { to: "/comissoes/pagamentos", icon: Wallet,  title: "Pagamentos", desc: "Registrar e ver pagamentos feitos à equipe." },
] as const;

function ComissoesHub() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financeiro"
        title="Comissões"
        description="Regras, histórico e pagamentos da equipe."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <Kpi label="A pagar" value={formatBRL(mockCommissionsHub.aPagarCents)} />
        <Kpi label="Pago (30 dias)" value={formatBRL(mockCommissionsHub.pago30dCents)} />
        <Kpi label="Profissionais com pendência" value={String(mockCommissionsHub.profissionaisPendentes)} icon />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {links.map(l => (
          <Link key={l.to} to={l.to} className="block">
            <Card className="h-full transition-colors hover:bg-muted/30">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <l.icon size={18} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg">{l.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{l.desc}</p>
                </div>
                <ChevronRight size={16} strokeWidth={1.5} className="mt-1 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {icon && <AlertCircle size={12} strokeWidth={1.5} />}
          {label}
        </div>
        <p className="mt-1 font-display text-3xl tracking-wide text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}