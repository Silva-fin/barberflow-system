import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck,
  ChevronRight,
  CreditCard,
  History,
  Package,
  Repeat,
  Tag,
  Ticket,
} from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, appointmentTone } from "@/components/portal/status-badge";
import { CompanyCta } from "@/components/portal/company-chips";
import {
  useCompanyFilter,
  matchesCompany,
} from "@/lib/portal/company-filter";
import { usePortalSession } from "@/lib/portal/session";
import {
  fetchAllQuotas,
  fetchCoupons,
  fetchPayments,
  fetchProducts,
  fetchSubscriptions,
  fetchUpcomingAppointmentsMutable,
} from "@/lib/portal/api";
import {
  APPOINTMENT_STATUS_LABEL,
  type Appointment,
} from "@/lib/portal/mock";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal/dashboard")({
  component: () => (
    <RequirePortalAuth>
      <DashboardPage />
    </RequirePortalAuth>
  ),
});

function DashboardPage() {
  const { session } = usePortalSession();
  const { selected, selectedCompany } = useCompanyFilter();
  const firstName = session?.name?.split(" ")[0] ?? "";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Portal do Cliente
        </p>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl">
          Olá, {firstName}
        </h1>
        {selectedCompany && (
          <p className="mt-1 text-sm text-muted-foreground">
            Filtrando por{" "}
            <span className="text-primary">{selectedCompany.name}</span>
          </p>
        )}
      </div>

      <CompanyCta />

      <UpcomingSection selected={selected} />

      <BlocksGrid selected={selected} />
    </div>
  );
}

function UpcomingSection({ selected }: { selected: string }) {
  const q = useQuery({
    queryKey: ["portal", "upcoming"],
    queryFn: fetchUpcomingAppointmentsMutable,
  });

  const items = (q.data ?? []).filter((a) =>
    matchesCompany(selected, a.establishment.id),
  );

  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="font-display text-xl">Próximos agendamentos</h2>
        {items.length > 0 && (
          <Link
            to="/portal/historico"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Ver histórico →
          </Link>
        )}
      </div>

      {q.isLoading && <Skeleton className="h-24 w-full" />}

      {q.data && items.length === 0 && (
        <Card className="border-dashed p-6 text-center text-sm text-muted-foreground">
          {selected === "all"
            ? "Você não tem agendamentos futuros."
            : "Nenhum agendamento futuro nesta empresa."}
        </Card>
      )}

      {items.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((a) => (
            <AppointmentHeroCard key={a.id} appointment={a} showBadge={selected === "all"} />
          ))}
        </div>
      )}
    </section>
  );
}

function AppointmentHeroCard({
  appointment: a,
  showBadge,
}: {
  appointment: Appointment;
  showBadge: boolean;
}) {
  return (
    <Link
      to="/portal/agendamento/$id"
      params={{ id: a.id }}
      className="group block"
    >
      <Card className="p-4 transition-colors group-hover:border-primary/40">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-display text-lg leading-tight">
              {a.service}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              com {a.professional}
            </p>
          </div>
          <StatusBadge tone={appointmentTone(a.status)}>
            {APPOINTMENT_STATUS_LABEL[a.status]}
          </StatusBadge>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-primary">{formatDateTime(a.when)}</span>
          <ChevronRight
            size={14}
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
        </div>
        {showBadge && (
          <div className="mt-3 border-t border-border/60 pt-2 text-[11px] uppercase tracking-widest text-primary/80">
            {a.establishment.name}
          </div>
        )}
      </Card>
    </Link>
  );
}

function BlocksGrid({ selected }: { selected: string }) {
  const quotas = useQuery({ queryKey: ["portal", "quotas"], queryFn: fetchAllQuotas });
  const subs = useQuery({ queryKey: ["portal", "subscriptions"], queryFn: fetchSubscriptions });
  const products = useQuery({ queryKey: ["portal", "products"], queryFn: fetchProducts });
  const coupons = useQuery({ queryKey: ["portal", "coupons"], queryFn: fetchCoupons });
  const payments = useQuery({ queryKey: ["portal", "payments"], queryFn: fetchPayments });

  const filter = <T extends { establishment: { id: string } }>(list: T[] | undefined) =>
    (list ?? []).filter((x) => matchesCompany(selected, x.establishment.id));

  const activeQuotas = filter(quotas.data).filter((q) => q.status === "ativa").length;
  const activeSubs = filter(subs.data).filter((s) => s.status === "ativa").length;
  const reserved = filter(products.data).filter((p) => p.status === "reservado").length;
  const availCoupons = filter(coupons.data).length;
  const payCount = filter(payments.data).length;

  const blocks: Array<{
    to: string;
    icon: typeof Ticket;
    label: string;
    summary: string;
    highlight?: boolean;
  }> = [
    { to: "/portal/cotas", icon: Ticket, label: "Cotas", summary: `${activeQuotas} ativas`, highlight: activeQuotas > 0 },
    { to: "/portal/assinaturas", icon: Repeat, label: "Assinaturas", summary: `${activeSubs} ativas`, highlight: activeSubs > 0 },
    { to: "/portal/produtos", icon: Package, label: "Produtos", summary: reserved > 0 ? `${reserved} reservados` : "ver histórico", highlight: reserved > 0 },
    { to: "/portal/cupons", icon: Tag, label: "Cupons", summary: availCoupons > 0 ? `${availCoupons} disponíveis` : "nenhum", highlight: availCoupons > 0 },
    { to: "/portal/historico", icon: History, label: "Histórico", summary: "agendamentos passados" },
    { to: "/portal/pagamentos", icon: CreditCard, label: "Pagamentos", summary: `${payCount} lançamentos` },
  ];

  return (
    <section>
      <h2 className="mb-3 font-display text-xl">Sua conta</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {blocks.map((b) => {
          const Icon = b.icon;
          return (
            <Link key={b.to} to={b.to} className="group block">
              <Card
                className={cn(
                  "flex h-full flex-col justify-between p-4 transition-colors group-hover:border-primary/40",
                  b.highlight && "border-primary/30",
                )}
              >
                <div className="flex items-center justify-between">
                  <Icon size={18} strokeWidth={1.5} className="text-primary" />
                  <ChevronRight
                    size={14}
                    strokeWidth={1.5}
                    className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  />
                </div>
                <div className="mt-6">
                  <p className="font-display text-lg leading-tight">{b.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {b.summary}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      <p className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
        <CalendarCheck size={12} strokeWidth={1.5} />
        Dados atualizados agora
      </p>
    </section>
  );
}
