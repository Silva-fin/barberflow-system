import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DateTimePicker } from "@/components/app/datetime-picker";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatBRLFromDecimal } from "@/lib/format";
import { ENTRY_CATEGORY } from "@/lib/constants";
import { mockDre, type DreBucket } from "@/lib/mock/fase3";

export const Route = createFileRoute("/_authenticated/financeiro/dre")({
  component: DrePage,
});

function DrePage() {
  const [period, setPeriod] = useState<"MONTH" | "QUARTER" | "YEAR" | "CUSTOM">("MONTH");
  const [from, setFrom] = useState(mockDre.date_from);
  const [to, setTo] = useState(mockDre.date_to);
  const dre = mockDre; // mock fixo

  const negative = dre.resultado_liquido.startsWith("-");

  const chartData = [
    { name: "Receita", value: parseFloat(dre.receita.total) },
    {
      name: "Custo+Despesa+Taxa+Comissão+Estorno",
      value:
        parseFloat(dre.custo.total) + parseFloat(dre.despesa.total) +
        parseFloat(dre.taxa.total) + parseFloat(dre.comissao.total) +
        parseFloat(dre.estorno.total),
    },
    { name: "Resultado líquido", value: parseFloat(dre.resultado_liquido) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financeiro"
        title="DRE"
        description="Demonstrativo de resultados por período."
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList>
              <TabsTrigger value="MONTH">Mês</TabsTrigger>
              <TabsTrigger value="QUARTER">Trimestre</TabsTrigger>
              <TabsTrigger value="YEAR">Ano</TabsTrigger>
              <TabsTrigger value="CUSTOM">Custom</TabsTrigger>
            </TabsList>
          </Tabs>
          {period === "CUSTOM" && (
            <div className="flex items-end gap-2">
              <DateTimePicker label="De" value={from} onChange={setFrom} />
              <DateTimePicker label="Até" value={to} onChange={setTo} />
              <Button size="sm">Aplicar</Button>
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Receita total" value={formatBRLFromDecimal(dre.receita.total)} />
        <Kpi label="Custo total" value={formatBRLFromDecimal(dre.custo.total)} />
        <Kpi label="Despesa total" value={formatBRLFromDecimal(dre.despesa.total)} />
        <Kpi label="Resultado líquido" value={formatBRLFromDecimal(dre.resultado_liquido)}
          tone={negative ? "destructive" : "success"} />
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 size={16} strokeWidth={1.5} className="text-muted-foreground" />
          <h2 className="font-display text-lg">Receita × Saídas × Resultado</h2>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip
                formatter={(v: number) => formatBRLFromDecimal(String(v))}
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
              />
              <Legend />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <BucketTable title="Receita" bucket={dre.receita} />
        <BucketTable title="Custo" bucket={dre.custo} />
        <BucketTable title="Despesa" bucket={dre.despesa} />
        <BucketTable title="Taxa" bucket={dre.taxa} />
        <BucketTable title="Comissão" bucket={dre.comissao} />
        <BucketTable title="Estorno" bucket={dre.estorno} />
        <BucketTable title="Ajuste" bucket={dre.ajuste} />
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Resultado bruto</span>
          <span className="font-display text-xl">{formatBRLFromDecimal(dre.resultado_bruto)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <span className="text-sm text-muted-foreground">Resultado líquido</span>
          <span className={`font-display text-2xl ${negative ? "text-destructive" : "text-success"}`}>
            {formatBRLFromDecimal(dre.resultado_liquido)}
          </span>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "success" | "destructive" }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-2xl ${tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : ""}`}>
        {value}
      </p>
    </Card>
  );
}

function BucketTable({ title, bucket }: { title: string; bucket: DreBucket }) {
  return (
    <Card>
      <div className="border-b border-border px-4 py-2">
        <h3 className="font-display text-base">{title}</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bucket.lines.map((l) => (
            <TableRow key={l.category}>
              <TableCell className="text-muted-foreground">{ENTRY_CATEGORY[l.category] ?? l.category}</TableCell>
              <TableCell className="text-right">{formatBRLFromDecimal(l.amount)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-medium">Total</TableCell>
            <TableCell className="text-right font-medium">{formatBRLFromDecimal(bucket.total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}