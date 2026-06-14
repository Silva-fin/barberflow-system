import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { CrmBadge, type CrmClassification } from "@/components/app/fsm-badge";
import { EmptyField } from "@/components/app/empty-field";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { mockCustomers } from "@/lib/mock/fase1";

export const Route = createFileRoute("/_authenticated/clientes/")({
  head: () => ({ meta: [{ title: "Clientes — Paladino" }] }),
  component: CustomersListPage,
});

const PAGE_SIZE = 10;

function CustomersListPage() {
  const [classFilter, setClassFilter] = useState<"ALL" | CrmClassification>("ALL");
  const [minDays, setMinDays] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return mockCustomers.filter((c) => {
      if (classFilter !== "ALL" && c.classification !== classFilter) return false;
      if (minDays) {
        const n = parseInt(minDays, 10);
        if (!Number.isNaN(n) && (c.daysSinceLastVisit ?? -1) < n) return false;
      }
      return true;
    });
  }, [classFilter, minDays]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Relacionamento"
        title="Clientes"
        description="Base de clientes com classificação CRM e cotas ativas."
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Classificação</label>
          <Select value={classFilter} onValueChange={(v) => { setClassFilter(v as typeof classFilter); setPage(1); }}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="NOVO">Novo</SelectItem>
              <SelectItem value="FREQUENTE">Frequente</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="EM_RISCO">Em risco</SelectItem>
              <SelectItem value="RECUPERADO">Recuperado</SelectItem>
              <SelectItem value="REGULAR">Regular</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Sem visita há ≥ (dias)</label>
          <Input type="number" className="w-40" value={minDays} onChange={(e) => { setMinDays(e.target.value); setPage(1); }} placeholder="ex. 30" />
        </div>
      </div>

      {pageItems.length === 0 ? (
        <EmptyState title="Nenhum cliente encontrado" description="Ajuste os filtros para ampliar a busca." />
      ) : (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Última visita</TableHead>
                <TableHead>Classificação</TableHead>
                <TableHead>Ticket médio</TableHead>
                <TableHead>Cotas</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((c) => (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => { window.location.href = `/clientes/${c.id}`; }}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                  <TableCell><EmptyField /></TableCell>
                  <TableCell><CrmBadge classification={c.classification} /></TableCell>
                  <TableCell><EmptyField /></TableCell>
                  <TableCell>
                    {c.activeQuotas > 0 ? (
                      <Badge variant="outline">{c.activeQuotas}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button asChild size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                      <Link to="/clientes/$id" params={{ id: c.id }}>
                        <ChevronRight size={16} strokeWidth={1.5} />
                      </Link>
                    </Button>
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
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 text-sm text-muted-foreground">Página {page} de {totalPages}</span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}