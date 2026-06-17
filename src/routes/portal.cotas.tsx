import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AlertCircle, ChevronDown, RotateCw, Ticket } from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { QuotaBar } from "@/components/portal/quota-bar";
import { StatusBadge, quotaTone } from "@/components/portal/status-badge";
import { fetchAllQuotas, fetchQuotaUsage } from "@/lib/portal/api";
import type { Quota } from "@/lib/portal/mock";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal/cotas")({
  component: () => (
    <RequirePortalAuth title="Cotas">
      <QuotasPage />
    </RequirePortalAuth>
  ),
});

function QuotasPage() {
  const q = useQuery({
    queryKey: ["portal", "quotas"],
    queryFn: fetchAllQuotas,
  });

  if (q.isLoading)
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );

  if (q.isError)
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center">
        <AlertCircle size={20} strokeWidth={1.5} className="mx-auto text-destructive" />
        <p className="mt-2 text-sm text-muted-foreground">Erro ao carregar cotas.</p>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => q.refetch()}>
          <RotateCw size={14} strokeWidth={1.5} className="mr-2" />
          Tentar novamente
        </Button>
      </div>
    );

  if (!q.data || q.data.length === 0)
    return (
      <div className="rounded-md border border-dashed border-border p-10 text-center">
        <Ticket size={20} strokeWidth={1.5} className="mx-auto text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Você não tem cotas.</p>
      </div>
    );

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {q.data.map((quota) => (
        <QuotaCard key={quota.id} quota={quota} />
      ))}
    </div>
  );
}

function QuotaCard({ quota }: { quota: Quota }) {
  const [open, setOpen] = useState(false);
  const remaining = quota.total - quota.used;
  const expired = new Date(quota.validUntil) < new Date();

  const usage = useQuery({
    queryKey: ["portal", "quota-usage", quota.id],
    queryFn: () => fetchQuotaUsage(quota.id),
    enabled: open,
  });

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{quota.service}</p>
          <p className="truncate text-xs text-primary">{quota.establishment.name}</p>
        </div>
        <StatusBadge tone={quotaTone(quota.status)}>
          {quota.status === "ativa"
            ? "Ativa"
            : quota.status === "expirada"
              ? "Expirada"
              : "Encerrada"}
        </StatusBadge>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span>
          {remaining} de {quota.total} restantes
        </span>
        <span className={expired ? "text-destructive" : "text-muted-foreground"}>
          até {formatDate(quota.validUntil)}
        </span>
      </div>
      <QuotaBar
        remaining={remaining}
        total={quota.total}
        expired={expired}
        className="mt-2"
      />
      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-3 flex w-full items-center justify-between rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/40"
      >
        <span>Histórico de consumo</span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="mt-2">
          {usage.isLoading && <Skeleton className="h-16 w-full" />}
          {usage.data && usage.data.length === 0 && (
            <p className="px-1 py-2 text-xs text-muted-foreground">
              Nenhum consumo registrado.
            </p>
          )}
          {usage.data && usage.data.length > 0 && (
            <ul className="divide-y divide-border text-xs">
              {usage.data.map((u) => (
                <li key={u.id} className="flex items-center justify-between py-1.5">
                  <span>{formatDate(u.date)}</span>
                  <span className="text-muted-foreground">com {u.professional}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}