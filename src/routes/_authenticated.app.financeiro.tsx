import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/app/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Navalha" }] }),
  component: FinanceiroPage,
});

function FinanceiroPage() {
  const { user } = useAuth();
  const shopId = user!.barbershopId;
  const { data: entries = [] } = useQuery({ queryKey: ["finance", shopId], queryFn: () => api.listFinance(shopId) });

  const incomes = entries.filter(e => e.type === "income");
  const expenses = entries.filter(e => e.type === "expense");
  const totalIn = incomes.reduce((s,e)=>s+e.amountCents,0);
  const totalOut = expenses.reduce((s,e)=>s+e.amountCents,0);

  const chartData = [...incomes].sort((a,b)=>a.date.localeCompare(b.date)).map(e => ({
    date: format(new Date(e.date), "dd/MM"),
    valor: e.amountCents/100,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Financeiro</h1>
        <p className="text-sm text-muted-foreground">Receitas e despesas dos últimos 30 dias</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label="Receitas" value={formatBRL(totalIn)} tone="success" />
        <Kpi label="Despesas" value={formatBRL(totalOut)} tone="destructive" />
        <Kpi label="Resultado" value={formatBRL(totalIn-totalOut)} tone="primary" />
      </div>

      <Card>
        <CardHeader><CardTitle>Receitas no período</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5}/>
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
                  formatter={(v: number) => [formatBRL(v*100), "Receita"]}
                />
                <Area type="monotone" dataKey="valor" stroke="var(--color-primary)" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="income">
        <TabsList>
          <TabsTrigger value="income">Receitas</TabsTrigger>
          <TabsTrigger value="expense">Despesas</TabsTrigger>
        </TabsList>
        <TabsContent value="income">
          <Card><EntriesTable rows={incomes} /></Card>
        </TabsContent>
        <TabsContent value="expense">
          <Card><EntriesTable rows={expenses} /></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone: "success"|"destructive"|"primary" }) {
  const color = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-primary";
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`mt-1 font-display text-3xl tracking-wide ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function EntriesTable({ rows }: { rows: { id: string; description: string; category: string; amountCents: number; date: string }[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(r => (
          <TableRow key={r.id}>
            <TableCell className="font-mono text-xs">{format(new Date(r.date), "dd MMM", { locale: ptBR })}</TableCell>
            <TableCell>{r.description}</TableCell>
            <TableCell><Badge variant="secondary" className="text-[10px]">{r.category}</Badge></TableCell>
            <TableCell className="text-right font-medium">{formatBRL(r.amountCents)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
