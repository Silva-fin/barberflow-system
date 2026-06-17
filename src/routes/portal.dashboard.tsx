import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Ticket, AlertCircle, RotateCw } from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, appointmentTone } from "@/components/portal/status-badge";
import {
  fetchActiveQuotas,
  fetchUpcomingAppointments,
} from "@/lib/portal/api";
import {
  APPOINTMENT_STATUS_LABEL,
  type Quota,
} from "@/lib/portal/mock";
import { formatDateTime, formatDate } from "@/lib/format";

export const Route = createFileRoute("/portal/dashboard")({
  component: () => (
    <RequirePortalAuth title="Início">
      <DashboardPage />
    </RequirePortalAuth>
  ),
});

function DashboardPage() {
  return (
    <div className="space-y-8">
      <UpcomingSection />
      <QuotasSection />
    </div>
  );
}

function SectionHeader({
  title,
  link,
}: {
  title: string;
  link?: { label: string; to: string };
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="font-display text-xl">{title}</h2>
      {link && (
        <Link
          to={link.to}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {link.label} →
        </Link>
      )}
    </div>
  );
}

function UpcomingSection() {
  const q = useQuery({
    queryKey: ["portal", "upcoming"],
    queryFn: fetchUpcomingAppointments,
  });

  return (
    <section>
      <SectionHeader
        title="Próximos agendamentos"
        link={{ label: "Ver histórico", to: "/portal/historico" }}
      />
      {q.isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}
      {q.isError && <ErrorBlock onRetry={() => q.refetch()} />}
      {q.data && q.data.length === 0 && (
        <EmptyBlock icon={CalendarCheck} message="Você ainda não tem agendamentos." />
      )}
      {q.data && q.data.length > 0 && (
        <ul className="space-y-2">
          {q.data.slice(0, 5).map((a) => (
            <li key={a.id}>
              <Card className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.service}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="text-primary">{a.establishment.name}</span>
                    {" · "}com {a.professional}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(a.when)}
                  </p>
                  <StatusBadge tone={appointmentTone(a.status)}>
                    {APPOINTMENT_STATUS_LABEL[a.status]}
                  </StatusBadge>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function QuotasSection() {
  const q = useQuery({
    queryKey: ["portal", "active-quotas"],
    queryFn: fetchActiveQuotas,
  });

  return (
    <section>
      <SectionHeader
        title="Cotas ativas"
        link={{ label: "Ver todas", to: "/portal/cotas" }}
      />
      {q.isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}
      {q.isError && <ErrorBlock onRetry={() => q.refetch()} />}
      {q.data && q.data.length === 0 && (
        <EmptyBlock icon={Ticket} message="Nenhuma cota ativa." />
      )}
      {q.data && q.data.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {q.data.map((cq) => (
            <QuotaMini key={cq.id} quota={cq} />
          ))}
        </div>
      )}
    </section>
  );
}

export function quotaPercent(used: number, total: number) {
  if (total === 0) return 0;
  return Math.max(0, Math.min(100, ((total - used) / total) * 100));
}

export function quotaProgressColor(remaining: number, total: number) {
  if (total === 0) return "bg-muted-foreground";
  const pct = (remaining / total) * 100;
  if (remaining === 0) return "bg-muted-foreground/60";
  if (pct < 25) return "bg-warning";
  if (pct < 50) return "bg-primary/60";
  return "bg-primary";
}

function QuotaMini({ quota }: { quota: Quota }) {
  const remaining = quota.total - quota.used;
  const pct = quotaPercent(quota.used, quota.total);
  const expired = new Date(quota.validUntil) < new Date();
  return (
    <Card className="p-4">
      <p className="text-sm font-medium">{quota.service}</p>
      <p className="text-xs text-primary">{quota.establishment.name}</p>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span>
          {remaining} de {quota.total} restantes
        </span>
        <span className={expired ? "text-destructive" : "text-muted-foreground"}>
          até {formatDate(quota.validUntil)}
        </span>
      </div>
      <Progress
        value={pct}
        indicatorClassName={quotaProgressColor(remaining, quota.total)}
        className="mt-2 h-1.5"
      />
    </Card>
  );
}

function EmptyBlock({
  icon: Icon,
  message,
}: {
  icon: typeof Ticket;
  message: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-border p-8 text-center">
      <Icon size={20} strokeWidth={1.5} className="mx-auto text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function ErrorBlock({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center">
      <AlertCircle size={20} strokeWidth={1.5} className="mx-auto text-destructive" />
      <p className="mt-2 text-sm text-muted-foreground">
        Não foi possível carregar agora.
      </p>
      <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>
        <RotateCw size={14} strokeWidth={1.5} className="mr-2" />
        Tentar novamente
      </Button>
    </div>
  );
}