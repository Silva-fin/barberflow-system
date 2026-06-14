import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { PaymentBadge } from "@/components/app/fsm-badge";
import { EmptyState } from "@/components/app/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { formatBRLFromDecimal, formatDateTime } from "@/lib/format";
import { PAYMENT_METHODS, mockPayments, tenantFlags, type Payment } from "@/lib/mock/fase1";

export const Route = createFileRoute("/_authenticated/pagamentos/")({
  head: () => ({ meta: [{ title: "Pagamentos — Paladino" }] }),
  component: PaymentsListPage,
});

const PAGE_SIZE = 10;

function PaymentsListPage() {
  const [statusFilter, setStatusFilter] = useState<"ALL" | Payment["status"]>("ALL");
  const [methodFilter, setMethodFilter] = useState<"ALL" | Payment["method"]>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [payments, setPayments] = useState(mockPayments);

  const filtered = useMemo(() => payments.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (methodFilter !== "ALL" && p.method !== methodFilter) return false;
    if (from && new Date(p.createdAt) < new Date(from)) return false;
    if (to && new Date(p.createdAt) > new Date(to + "T23:59:59")) return false;
    return true;
  }), [payments, statusFilter, methodFilter, from, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Financeiro" title="Pagamentos" description="Histórico de cobranças, confirmações e estornos." />

      {tenantFlags.feeNotConfigured && (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>Taxas não configuradas</AlertTitle>
          <AlertDescription>Configure as taxas dos métodos em Configurações → Financeiro para refletir o valor líquido correto.</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <FilterField label="Status">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as typeof statusFilter); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="CONFIRMED">Confirmado</SelectItem>
              <SelectItem value="REFUNDED">Estornado</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Método">
          <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v as typeof methodFilter); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="De"><Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="w-40" /></FilterField>
        <FilterField label="Até"><Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="w-40" /></FilterField>
      </div>

      {pageItems.length === 0 ? (
        <EmptyState title="Nenhum pagamento" description="Ajuste os filtros para ver os registros." />
      ) : (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-44 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground">{formatDateTime(p.createdAt)}</TableCell>
                  <TableCell>{p.clientName}</TableCell>
                  <TableCell className="text-right font-mono">{formatBRLFromDecimal(p.net)}</TableCell>
                  <TableCell>{PAYMENT_METHODS.find((m) => m.value === p.method)?.label}</TableCell>
                  <TableCell><PaymentBadge status={p.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {p.status === "PENDING" && (
                        <QuickConfirmDialog onConfirm={() => { setPayments((xs) => xs.map((x) => x.id === p.id ? { ...x, status: "CONFIRMED", paidAt: new Date().toISOString() } : x)); toast.success("Pagamento confirmado"); }} />
                      )}
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/pagamentos/$id" params={{ id: p.id }}><ChevronRight size={16} strokeWidth={1.5} /></Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} /></PaginationItem>
            <PaginationItem><span className="px-3 text-sm text-muted-foreground">Página {page} de {totalPages}</span></PaginationItem>
            <PaginationItem><PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} /></PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function QuickConfirmDialog({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Confirmar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Confirmar pagamento</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">O pagamento será marcado como confirmado.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => { onConfirm(); setOpen(false); }}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}