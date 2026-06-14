import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar, DollarSign, Activity, AlertTriangle, Clock, Users,
  Wallet, MessageSquare, ListOrdered, Play, Pause, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth, ROLE_LABELS, type Role } from "@/lib/auth";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Paladino" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { role, user } = useAuth();

  return (
    <div className="space-y-8">
      <PageHeader role={role} userName={user?.name ?? ""} />
      {role === "OWNER" || role === "ADMIN" ? (
        <OwnerDashboard />
      ) : role === "OPERATOR" ? (
        <OperatorDashboard />
      ) : (
        <ProfessionalDashboard />
      )}
    </div>
  );
}

function PageHeader({ role, userName }: { role: Role; userName: string }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {ROLE_LABELS[role]}
        </p>
        <h1 className="font-display text-4xl tracking-wide">
          Olá, {userName.split(" ")[0] || "boas-vindas"}.
        </h1>
      </div>
      <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-[0.2em]">
        Mock · Fase 0
      </Badge>
    </header>
  );
}

/* ============================== OWNER / ADMIN ============================== */

function OwnerDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Kpi icon={Calendar} label="Agendamentos hoje" value="28" delta="+12% vs ontem" />
        <Kpi icon={DollarSign} label="Faturamento do mês" value={formatBRL(2_487_50)} delta="+8% vs mês anterior" />
        <Kpi icon={Activity} label="Ocupação" value="76%" delta="alta saudável" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-xl">Receita × Despesa × Margem</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBars
              series={[
                { label: "Out", receita: 32, despesa: 18 },
                { label: "Nov", receita: 41, despesa: 22 },
                { label: "Dez", receita: 48, despesa: 26 },
                { label: "Jan", receita: 39, despesa: 24 },
                { label: "Fev", receita: 44, despesa: 25 },
                { label: "Mar", receita: 52, despesa: 28 },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl">
              <AlertTriangle size={16} strokeWidth={1.5} className="text-warning" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertRow tone="warning" label="3 pagamentos a confirmar" />
            <AlertRow tone="destructive" label="2 itens com estoque baixo" />
            <AlertRow tone="warning" label="Promoção 'Verão' expira em 2 dias" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl">
              <Clock size={16} strokeWidth={1.5} /> Pendências
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="2 payables vencendo nos próximos 7 dias" value="—" />
            <Row label="Conciliação de caixa pendente (3 dias)" value="—" />
            <Row label="1 fechamento de comissão aguardando" value="—" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl">
              <Users size={16} strokeWidth={1.5} /> CRM · clientes em risco
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: "Henrique Souza", days: 62 },
              { name: "Caio Albuquerque", days: 48 },
              { name: "Marcos Tavares", days: 41 },
            ].map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-sm">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.days}d sem visita</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* =================================== OPERATOR =================================== */

function OperatorDashboard() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <Calendar size={16} strokeWidth={1.5} /> Agenda do dia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { time: "09:00", client: "Pedro Lima", service: "Corte + Barba" },
            { time: "10:30", client: "Rafael Costa", service: "Corte degradê" },
            { time: "11:15", client: "Tiago Reis", service: "Barba" },
            { time: "14:00", client: "André Veloso", service: "Corte clássico" },
          ].map((a) => (
            <div
              key={a.time}
              className="flex items-center justify-between border-b border-border/60 pb-2 text-sm last:border-0 last:pb-0"
            >
              <span className="font-mono text-muted-foreground">{a.time}</span>
              <span className="flex-1 px-3">{a.client}</span>
              <span className="text-xs text-muted-foreground">{a.service}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <ListOrdered size={16} strokeWidth={1.5} /> Fila
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="João S." value="aguardando 8min" />
          <Row label="Bruno P." value="aguardando 3min" />
          <Row label="Luís A." value="confirmado" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <MessageSquare size={16} strokeWidth={1.5} /> Atendimento humano
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Mensagens não lidas</span>
          <Badge variant="default">5</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <Wallet size={16} strokeWidth={1.5} /> Cobranças pendentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Carlos M." value={formatBRL(8500)} />
          <Row label="Felipe R." value={formatBRL(12000)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <Activity size={16} strokeWidth={1.5} /> Caixa do dia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Entradas" value={formatBRL(64500)} />
          <Row label="Saídas" value={formatBRL(4200)} />
          <Row label="Saldo" value={formatBRL(60300)} bold />
        </CardContent>
      </Card>
    </div>
  );
}

/* ================================= PROFESSIONAL ================================= */

function ProfessionalDashboard() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <Calendar size={16} strokeWidth={1.5} /> Próximos atendimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            { time: "Hoje · 14:00", client: "André Veloso", service: "Corte clássico" },
            { time: "Hoje · 15:30", client: "Daniel Pires", service: "Corte + Barba" },
            { time: "Amanhã · 09:00", client: "Caio Mendes", service: "Barba" },
          ].map((a) => (
            <div
              key={a.time}
              className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0 last:pb-0"
            >
              <span className="text-xs text-muted-foreground">{a.time}</span>
              <span className="flex-1 px-3">{a.client}</span>
              <span className="text-xs text-muted-foreground">{a.service}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Ações rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" className="gap-2">
            <Play size={14} strokeWidth={1.5} /> Iniciar atendimento
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Pause size={14} strokeWidth={1.5} /> Marcar pausa
          </Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <TrendingUp size={16} strokeWidth={1.5} /> Extrato de comissões (mês)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Atendimentos realizados" value="74" />
          <Row label="Comissão acumulada" value={formatBRL(187_400)} />
          <Row label="A receber em 30/04" value={formatBRL(187_400)} bold />
        </CardContent>
      </Card>
    </div>
  );
}

/* =================================== building blocks =================================== */

function Kpi({
  icon: Icon, label, value, delta,
}: { icon: typeof Calendar; label: string; value: string; delta?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </CardTitle>
        <Icon size={16} strokeWidth={1.5} className="text-sidebar-primary" />
      </CardHeader>
      <CardContent>
        <div className="num-display text-3xl">{value}</div>
        {delta && <p className="mt-1 text-xs text-muted-foreground">{delta}</p>}
      </CardContent>
    </Card>
  );
}

function SimpleBars({
  series,
}: { series: { label: string; receita: number; despesa: number }[] }) {
  const max = Math.max(...series.flatMap((s) => [s.receita, s.despesa]));
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3 h-44">
        {series.map((s) => (
          <div key={s.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div
                className="w-3 rounded-sm bg-sidebar-primary/80"
                style={{ height: `${(s.receita / max) * 100}%` }}
                title={`Receita: ${s.receita}k`}
              />
              <div
                className="w-3 rounded-sm bg-muted-foreground/40"
                style={{ height: `${(s.despesa / max) * 100}%` }}
                title={`Despesa: ${s.despesa}k`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-sidebar-primary/80" /> Receita
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-muted-foreground/40" /> Despesa
        </span>
      </div>
    </div>
  );
}

function AlertRow({ tone, label }: { tone: "warning" | "destructive"; label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className={`h-1.5 w-1.5 rounded-full ${tone === "warning" ? "bg-warning" : "bg-destructive"}`}
      />
      <span>{label}</span>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-medium text-foreground" : ""}>{value}</span>
    </div>
  );
}