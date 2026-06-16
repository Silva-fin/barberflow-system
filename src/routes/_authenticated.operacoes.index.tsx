import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { AppointmentBadge, type AppointmentStatus } from "@/components/app/fsm-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatBRL, formatDateTime } from "@/lib/format";
import { fetchOperations, mockBarbers } from "@/lib/mock/fase-reskin";

export const Route = createFileRoute("/_authenticated/operacoes/")({
  head: () => ({ meta: [{ title: "Operações — Paladino" }] }),
  component: OperacoesPage,
});

const STATUS_OPTIONS: { value: AppointmentStatus | "ALL"; label: string }[] = [
  { value: "ALL",         label: "Todos" },
  { value: "SCHEDULED",   label: "Agendado" },
  { value: "IN_PROGRESS", label: "Em andamento" },
  { value: "COMPLETED",   label: "Concluído" },
  { value: "CANCELLED",   label: "Cancelado" },
  { value: "NO_SHOW",     label: "Não compareceu" },
];

function OperacoesPage() {
  const navigate = useNavigate();
  const [barber, setBarber] = useState("ALL");
  const [status, setStatus] = useState<AppointmentStatus | "ALL">("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");

  const query = useQuery({
    queryKey: ["operacoes"],
    queryFn: fetchOperations,
  });

  const rows = (query.data ?? []).filter(r => {
    if (barber !== "ALL" && r.barberId !== barber) return false;
    if (status !== "ALL" && r.status !== status) return false;
    if (q && !r.customerName.toLowerCase().includes(q.toLowerCase())) return false;
    if (from && r.dateTime.slice(0, 10) < from) return false;
    if (to && r.dateTime.slice(0, 10) > to) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação"
        title="Operações"
        description="Todos os atendimentos do tenant."
        actions={
          <Button asChild>
            <Link to="/agenda/novo">
              <Plus size={16} strokeWidth={1.5} className="mr-1" />Novo Agendamento
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-5">
          <div className="space-y-1">
            <Label>Barbeiro</Label>
            <Select value={barber} onValueChange={setBarber}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {mockBarbers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus | "ALL")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
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
          <div className="space-y-1">
            <Label>Buscar cliente</Label>
            <div className="relative">
              <Search size={14} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Nome do cliente"
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {query.isLoading ? (
        <Card>
          <CardContent className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : query.isError ? (
        <ErrorState
          description="Não foi possível carregar as operações."
          onRetry={() => query.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Nenhum atendimento encontrado"
          description="Ajuste os filtros para ver outros períodos, barbeiros ou status."
        />
      ) : (
        <Card>
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-muted-foreground">
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Barbeiro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => navigate({ to: "/operacoes/$id", params: { id: r.id } })}
                  >
                    <TableCell className="tabular-nums">{formatDateTime(r.dateTime)}</TableCell>
                    <TableCell>{r.customerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.serviceName}</TableCell>
                    <TableCell>{r.barberName}</TableCell>
                    <TableCell><AppointmentBadge status={r.status} /></TableCell>
                    <TableCell className="text-right tabular-nums">{formatBRL(r.valueCents)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <ChevronRight size={16} strokeWidth={1.5} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}