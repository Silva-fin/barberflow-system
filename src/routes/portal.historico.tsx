import { createFileRoute } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { History } from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatusBadge, appointmentTone } from "@/components/portal/status-badge";
import { CompanyCta } from "@/components/portal/company-chips";
import { fetchHistory } from "@/lib/portal/api";
import {
  APPOINTMENT_STATUS_LABEL,
  type AppointmentStatus,
} from "@/lib/portal/mock";
import { formatBRLFromDecimal, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCompanyFilter } from "@/lib/portal/company-filter";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/portal/historico")({
  component: () => (
    <RequirePortalAuth title="Histórico">
      <HistoryPage />
    </RequirePortalAuth>
  ),
});

const CHIPS: Array<{ id: AppointmentStatus | "all"; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "concluido", label: "Concluídos" },
  { id: "cancelado", label: "Cancelados" },
  { id: "no-show", label: "Faltas" },
];

function HistoryPage() {
  const { selected } = useCompanyFilter();
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [page, setPage] = useState(1);

  const q = useQuery({
    queryKey: ["portal", "history", status, selected, page],
    queryFn: () =>
      fetchHistory({
        status,
        establishmentId: selected,
        page,
        pageSize: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });

  const totalPages = q.data ? Math.max(1, Math.ceil(q.data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-4">
      <CompanyCta />

      <div className="flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setStatus(c.id);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs uppercase tracking-wider transition-colors",
              status === c.id
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {q.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {q.data && q.data.items.length === 0 && (
        <Card className="border-dashed p-10 text-center">
          <History
            size={20}
            strokeWidth={1.5}
            className="mx-auto text-muted-foreground"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhum registro com os filtros atuais.
          </p>
        </Card>
      )}

      {q.data && q.data.items.length > 0 && (
        <>
          <ul className="space-y-2">
            {q.data.items.map((a) => (
              <li key={a.id}>
                <Card className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.service}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {selected === "all" && (
                          <span className="text-primary">
                            {a.establishment.name} ·{" "}
                          </span>
                        )}
                        com {a.professional}
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
