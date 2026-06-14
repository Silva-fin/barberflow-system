import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, UserPlus, Star, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { mockCrmKpis, mockCrmSuggestions, mockCustomers } from "@/lib/mock/fase1";

export const Route = createFileRoute("/_authenticated/crm")({
  head: () => ({ meta: [{ title: "CRM — Paladino" }] }),
  component: CrmDashboardPage,
});

function CrmDashboardPage() {
  const { role } = useAuth();
  if (role !== "OWNER" && role !== "ADMIN") {
    return <EmptyState title="Sem acesso" description="Esta área é restrita a Proprietário e Administrador." />;
  }

  const atRisk = mockCustomers
    .filter((c) => c.classification === "EM_RISCO" && c.daysSinceLastVisit != null)
    .sort((a, b) => (b.daysSinceLastVisit ?? 0) - (a.daysSinceLastVisit ?? 0))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Relacionamento"
        title="CRM"
        description="Visão consolidada de risco, novos e oportunidades."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi icon={<AlertTriangle size={16} strokeWidth={1.5} />} label="Em risco" value={mockCrmKpis.atRisk} />
        <Kpi icon={<UserPlus size={16} strokeWidth={1.5} />} label="Novos no mês" value={mockCrmKpis.newThisMonth} />
        <Kpi icon={<Star size={16} strokeWidth={1.5} />} label="VIP" value={mockCrmKpis.vip} />
        <Kpi icon={<Sparkles size={16} strokeWidth={1.5} />} label="Recuperados (semana)" value={mockCrmKpis.recoveredThisWeek} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-display text-xl">Top 10 em risco</CardTitle></CardHeader>
          <CardContent>
            {atRisk.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Tudo em dia</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Dias</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atRisk.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell className="text-right font-mono">{c.daysSinceLastVisit}</TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="outline">
                          <Link to="/clientes/$id" params={{ id: c.id }}>Abrir</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display text-xl">Sugestões de ação</CardTitle></CardHeader>
          <CardContent>
            {mockCrmSuggestions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Tudo em dia</p>
            ) : (
              <ul className="space-y-3">
                {mockCrmSuggestions.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
                    <div>
                      <p className="text-sm"><span className="font-medium">{s.action}</span> · {s.customer}</p>
                      <p className="text-xs text-muted-foreground">{s.reason}</p>
                    </div>
                    <Button size="sm" variant="outline">Detalhes</Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="space-y-2 pt-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          {icon} {label}
        </div>
        <p className="font-display text-3xl">{value}</p>
      </CardContent>
    </Card>
  );
}