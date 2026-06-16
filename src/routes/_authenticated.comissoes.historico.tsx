import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { CommissionBadge } from "@/components/app/fsm-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatBRL, formatDate } from "@/lib/format";
import {
  mockCommissionHistory, mockBarbers, mockCommissionTotalPendingCents,
} from "@/lib/mock/fase-reskin";

export const Route = createFileRoute("/_authenticated/comissoes/historico")({
  head: () => ({ meta: [{ title: "Histórico de comissões — Paladino" }] }),
  component: HistoricoPage,
});

const TYPE_LABEL: Record<string, string> = {
  AGENDAMENTO: "Agendamento", PACOTE: "Pacote", ASSINATURA: "Assinatura",
};

function HistoricoPage() {
  const [pro, setPro] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows = mockCommissionHistory.filter(r => {
    if (pro !== "ALL" && r.professional !== pro) return false;
    if (status !== "ALL" && r.status !== status) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Comissões"
        title="Histórico de Comissões"
        description="Comissões geradas por vendas no período."
      />

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-5">
          <div className="space-y-1">
            <Label>Profissional</Label>
            <Select value={pro} onValueChange={setPro}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {mockBarbers.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="PENDING">Pendentes</SelectItem>
                <SelectItem value="DUE_SOON">Vence em breve</SelectItem>
                <SelectItem value="PAID">Pagas</SelectItem>
                <SelectItem value="REFUNDED">Estornadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>De</Label>
            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Até</Label>
            <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button className="w-full">Filtrar</Button>
          </div>
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title="Nenhuma comissão encontrada"
          description="Ajuste os filtros para ver outros períodos ou status."
        />
      ) : (
        <Card>
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-muted-foreground">
                  <TableHead>Data</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor bruto</TableHead>
                  <TableHead className="text-right">Comissão</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell className="tabular-nums">{formatDate(r.date)}</TableCell>
                    <TableCell>{r.professional}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{TYPE_LABEL[r.type]}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatBRL(r.grossCents)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatBRL(r.commissionCents)}</TableCell>
                    <TableCell><CommissionBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end border-t border-border px-4 py-3 text-sm">
            <span className="text-muted-foreground">Total pendente:&nbsp;</span>
            <span className="font-display text-base text-foreground tabular-nums">
              {formatBRL(mockCommissionTotalPendingCents)}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}