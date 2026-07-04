import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDown, Ticket } from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QuotaBar } from "@/components/portal/quota-bar";
import { StatusBadge, quotaTone } from "@/components/portal/status-badge";
import { CompanyCta } from "@/components/portal/company-chips";
import { fetchAllQuotas, fetchQuotaUsage } from "@/lib/portal/api";
import type { Quota } from "@/lib/portal/mock";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  matchesCompany,
  useCompanyFilter,
} from "@/lib/portal/company-filter";

export const Route = createFileRoute("/portal/cotas")({
  component: () => (
    <RequirePortalAuth title="Cotas">
      <QuotasPage />
    </RequirePortalAuth>
  ),
});

function QuotasPage() {
  const { selected } = useCompanyFilter();
  const q = useQuery({ queryKey: ["portal", "quotas"], queryFn: fetchAllQuotas });

  if (q.isLoading)
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );

  const items = (q.data ?? []).filter((quota) =>
    matchesCompany(selected, quota.establishment.id),
  );

  return (
    <div className="space-y-4">
      <CompanyCta />
      {items.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <Ticket
            size={20}
            strokeWidth={1.5}
            className="mx-auto text-muted-foreground"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {selected === "all"
              ? "Você ainda não tem cotas ativas."
              : "Nenhuma cota nesta empresa."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((quota) => (
            <QuotaCard key={quota.id} quota={quota} showBadge={selected === "all"} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuotaCard({ quota, showBadge }: { quota: Quota; showBadge: boolean }) {
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
          <p className="truncate font-medium">{quota.service}</p>
          {showBadge && (
            <p className="text-[11px] uppercase tracking-widest text-primary/80">
              {quota.establishment.name}
            </p>
          )}
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
