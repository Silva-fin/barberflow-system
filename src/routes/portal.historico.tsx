import { createFileRoute } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { AlertCircle, History, RotateCw } from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, appointmentTone } from "@/components/portal/status-badge";
import { fetchHistory } from "@/lib/portal/api";
import {
  APPOINTMENT_STATUS_LABEL,
  ESTABLISHMENTS,
  type AppointmentStatus,
} from "@/lib/portal/mock";
import { formatBRLFromDecimal, formatDateTime } from "@/lib/format";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/portal/historico")({
  component: () => (
    <RequirePortalAuth title="Histórico">
      <HistoryPage />
    </RequirePortalAuth>
  ),
});

function HistoryPage() {
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [estab, setEstab] = useState<string>("all");
  const [page, setPage] = useState(1);

  const q = useQuery({
    queryKey: ["portal", "history", status, estab, page],
    queryFn: () =>
      fetchHistory({
        status,
        establishmentId: estab,
        page,
        pageSize: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });

  const totalPages = q.data ? Math.max(1, Math.ceil(q.data.total / PAGE_SIZE)) : 1;
  const hasFilter = status !== "all" || estab !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as AppointmentStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
            <SelectItem value="no-show">Não compareceu</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={estab}
          onValueChange={(v) => {
            setEstab(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="Estabelecimento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos estabelecimentos</SelectItem>
            {ESTABLISHMENTS.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {q.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {q.isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle size={20} strokeWidth={1.5} className="mx-auto text-destructive" />
          <p className="mt-2 text-sm text-muted-foreground">Erro ao carregar.</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => q.refetch()}>
            <RotateCw size={14} strokeWidth={1.5} className="mr-2" />
            Tentar novamente
          </Button>
        </div>
      )}

      {q.data && q.data.items.length === 0 && (
        <div className="rounded-md border border-dashed border-border p-10 text-center">
          <History size={20} strokeWidth={1.5} className="mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {hasFilter
              ? "Nenhum registro com os filtros atuais."
              : "Você ainda não tem histórico."}
          </p>
        </div>
      )}

      {q.data && q.data.items.length > 0 && (
        <>
          {/* Mobile: cards */}
          <ul className="space-y-2 md:hidden">
            {q.data.items.map((a) => (
              <li key={a.id}>
                <Card className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.service}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        <span className="text-primary">{a.establishment.name}</span>
                        {" · "}com {a.professional}
                      </p>
                    </div>
                    <StatusBadge tone={appointmentTone(a.status)}>
                      {APPOINTMENT_STATUS_LABEL[a.status]}
                    </StatusBadge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDateTime(a.when)}</span>
                    <span>{formatBRLFromDecimal(a.amountBRL)}</span>
                  </div>
                </Card>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-md border border-border md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Serviço</th>
                  <th className="px-3 py-2">Profissional</th>
                  <th className="px-3 py-2">Estabelecimento</th>
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {q.data.items.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-3 py-2">{a.service}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.professional}</td>
                    <td className="px-3 py-2 text-primary">{a.establishment.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {formatDateTime(a.when)}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge tone={appointmentTone(a.status)}>
                        {APPOINTMENT_STATUS_LABEL[a.status]}
                      </StatusBadge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatBRLFromDecimal(a.amountBRL)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Página {page} de {totalPages} · {q.data.total} registros
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}