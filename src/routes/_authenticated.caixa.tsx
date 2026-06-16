import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatBRL, formatDateTime } from "@/lib/format";
import {
  fetchCashMovements, fetchCashCounts, mockCashAccounts,
  type CashCountResolution,
} from "@/lib/mock/fase-reskin";

export const Route = createFileRoute("/_authenticated/caixa")({
  head: () => ({ meta: [{ title: "Caixa — Paladino" }] }),
  component: CaixaPage,
});

function CaixaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financeiro"
        title="Caixa"
        description="Movimentações e contagem do dia."
      />

      <Tabs defaultValue="movimentacoes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="movimentacoes">Movimentações do dia</TabsTrigger>
          <TabsTrigger value="contagem">Contagem de caixa</TabsTrigger>
        </TabsList>

        <TabsContent value="movimentacoes" className="space-y-6">
          <MovimentacoesTab />
        </TabsContent>

        <TabsContent value="contagem" className="space-y-6">
          <ContagemTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MovimentacoesTab() {
  const query = useQuery({ queryKey: ["caixa", "movimentacoes"], queryFn: fetchCashMovements });

  if (query.isLoading) {
    return (
      <>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Card><CardContent className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent></Card>
      </>
    );
  }

  if (query.isError) {
    return <ErrorState description="Não foi possível carregar as movimentações." onRetry={() => query.refetch()} />;
  }

  const rows = query.data ?? [];
  const entradas = rows.filter(r => r.type === "IN").reduce((s, r) => s + r.valueCents, 0);
  const saidas = rows.filter(r => r.type === "OUT").reduce((s, r) => s + r.valueCents, 0);
  const saldo = entradas - saidas;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Entradas" value={formatBRL(entradas)} icon={<ArrowDownCircle size={16} strokeWidth={1.5} className="text-emerald-600 dark:text-emerald-400" />} />
        <KpiCard label="Saídas"   value={formatBRL(saidas)}   icon={<ArrowUpCircle   size={16} strokeWidth={1.5} className="text-destructive" />} />
        <KpiCard label="Saldo"    value={formatBRL(saldo)}    icon={<Wallet          size={16} strokeWidth={1.5} className="text-primary" />} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Nenhuma movimentação hoje" description="As entradas e saídas do dia aparecerão aqui." />
      ) : (
        <Card>
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-muted-foreground">
                  <TableHead className="w-20">Hora</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-32">Tipo</TableHead>
                  <TableHead className="w-32 text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell className="tabular-nums">{r.time}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-normal",
                          r.type === "IN"
                            ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
                            : "bg-destructive/15 text-destructive border-destructive/30",
                        )}
                      >
                        {r.type === "IN" ? "Entrada" : "Saída"}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right tabular-nums font-medium",
                      r.type === "IN" ? "text-emerald-700 dark:text-emerald-400" : "text-destructive",
                    )}>
                      {r.type === "IN" ? "+" : "−"} {formatBRL(r.valueCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}<span>{label}</span>
        </div>
        <p className="font-display text-2xl text-foreground tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function ContagemTab() {
  const query = useQuery({ queryKey: ["caixa", "contagens"], queryFn: fetchCashCounts });

  const [account, setAccount] = useState(mockCashAccounts[0].id);
  const [counted, setCounted] = useState("");
  const [resolution, setResolution] = useState<CashCountResolution>("WITHOUT_ADJUSTMENT");
  const [notes, setNotes] = useState("");

  function register() {
    if (!counted) {
      toast.error("Informe o valor contado.");
      return;
    }
    toast.success("Contagem registrada");
    setCounted("");
    setNotes("");
    setResolution("WITHOUT_ADJUSTMENT");
  }

  return (
    <>
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Conta</Label>
            <Select value={account} onValueChange={setAccount}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {mockCashAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="counted">Valor contado (R$)</Label>
            <Input
              id="counted"
              type="number"
              step="0.01"
              value={counted}
              onChange={e => setCounted(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Resolução</Label>
            <RadioGroup
              value={resolution}
              onValueChange={(v) => setResolution(v as CashCountResolution)}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem id="r-with" value="WITH_ADJUSTMENT" />
                <Label htmlFor="r-with" className="font-normal">Com ajuste</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="r-without" value="WITHOUT_ADJUSTMENT" />
                <Label htmlFor="r-without" className="font-normal">Sem ajuste</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Anotações sobre divergências, justificativas…"
              rows={3}
            />
          </div>
          <div className="md:col-span-2">
            <Button onClick={register}>Registrar</Button>
          </div>
        </CardContent>
      </Card>

      {query.isLoading ? (
        <Card><CardContent className="space-y-2 p-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent></Card>
      ) : query.isError ? (
        <ErrorState description="Não foi possível carregar o histórico." onRetry={() => query.refetch()} />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState title="Nenhuma contagem registrada" description="As contagens de caixa aparecerão aqui." />
      ) : (
        <Card>
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-muted-foreground">
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead className="text-right">Esperado</TableHead>
                  <TableHead className="text-right">Contado</TableHead>
                  <TableHead className="text-right">Divergência</TableHead>
                  <TableHead>Resolução</TableHead>
                  <TableHead>Registrado por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(query.data ?? []).map(r => {
                  const diff = r.countedCents - r.expectedCents;
                  const diffClass = diff === 0
                    ? "text-emerald-700 dark:text-emerald-400"
                    : diff < 0
                    ? "text-destructive"
                    : "text-amber-700 dark:text-amber-400";
                  return (
                    <TableRow key={r.id} className="hover:bg-muted/30">
                      <TableCell className="tabular-nums">{formatDateTime(r.dateTime)}</TableCell>
                      <TableCell>{r.accountLabel}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatBRL(r.expectedCents)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatBRL(r.countedCents)}</TableCell>
                      <TableCell className={cn("text-right tabular-nums font-medium", diffClass)}>
                        {diff > 0 ? "+" : ""}{formatBRL(diff)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-normal",
                            r.resolution === "WITHOUT_ADJUSTMENT"
                              ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
                              : "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300",
                          )}
                        >
                          {r.resolution === "WITHOUT_ADJUSTMENT" ? "Sem ajuste" : "Com ajuste"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.recordedBy}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </>
  );
}