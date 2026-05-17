import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatBRL } from "@/lib/format";
import { Search, Plus, ArrowRight } from "lucide-react";
import { format, isToday, startOfDay, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "Painel — Navalha" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const shopId = user!.barbershopId;
  const { data: appts = [] } = useQuery({ queryKey: ["appts", shopId], queryFn: () => api.listAppointments(shopId) });
  const { data: barbers = [] } = useQuery({ queryKey: ["barbers", shopId], queryFn: () => api.listBarbers(shopId) });
  const { data: services = [] } = useQuery({ queryKey: ["services", shopId], queryFn: () => api.listServices(shopId) });
  const { data: clients = [] } = useQuery({ queryKey: ["clients", shopId], queryFn: () => api.listClients(shopId) });

  const now = new Date();
  const todayAppts = appts.filter(a => isToday(new Date(a.start)));
  const completed = todayAppts.filter(a => a.status === "completed").length;
  const waiting = todayAppts.filter(a => a.status === "scheduled").length;
  const todayRevenue = todayAppts.filter(a => a.status !== "cancelled").reduce((s, a) => s + a.priceCents, 0);
  const completedAll = appts.filter(a => a.status === "completed");
  const ticketAvg = completedAll.length ? completedAll.reduce((s,a)=>s+a.priceCents,0)/completedAll.length : 0;

  // Week: SEG..DOM
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = startOfDay(addDays(weekStart, i));
    const dayAppts = appts.filter(a => startOfDay(new Date(a.start)).getTime() === d.getTime() && a.status !== "cancelled");
    return {
      label: ["SEG","TER","QUA","QUI","SEX","SÁB","DOM"][i],
      isToday: isToday(d),
      cents: dayAppts.reduce((s,a)=>s+a.priceCents,0),
    };
  });
  const weekMax = Math.max(...weekData.map(d=>d.cents), 1);
  const weekTotal = weekData.reduce((s,d)=>s+d.cents,0);
  const weekTicket = (() => {
    const wAppts = appts.filter(a => {
      const t = new Date(a.start).getTime();
      return t >= weekStart.getTime() && a.status !== "cancelled";
    });
    return wAppts.length ? wAppts.reduce((s,a)=>s+a.priceCents,0)/wAppts.length : 0;
  })();

  // Ocupação: completed+confirmed today / total slots today (rough)
  const occupancy = todayAppts.length ? Math.min(100, Math.round((todayAppts.length / 30) * 100)) : 0;
  const nps = 9.2;

  // Top services counts (all-time)
  const counts = new Map<string, number>();
  appts.filter(a => a.status !== "cancelled").forEach(a => counts.set(a.serviceId, (counts.get(a.serviceId) ?? 0) + 1));
  const topServices = services
    .map(s => ({ name: s.name, count: counts.get(s.id) ?? 0 }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 4);
  const topMax = Math.max(...topServices.map(s => s.count), 1);

  const upcoming = todayAppts
    .filter(a => a.status !== "cancelled" && a.status !== "completed")
    .sort((a,b) => a.start.localeCompare(b.start))
    .slice(0, 5);

  const firstName = user?.name?.split(" ")[0] ?? "Mestre";

  return (
    <div className="mx-auto max-w-[1280px] space-y-10">
      {/* Header */}
      <header className="space-y-5">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-primary/85">
          <span className="h-px w-8 bg-primary/50" />
          <span>Overview · {format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
          <span className="h-px w-8 bg-primary/50" />
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h1 className="font-display text-5xl tracking-tight md:text-6xl">
            Bom dia, <span className="italic">Mestre {firstName}.</span>
          </h1>

          <div className="flex items-center gap-3">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="procurar cliente ou agendamento"
                className="h-11 w-[280px] rounded-md border border-border bg-card/60 pl-9 pr-3 text-sm italic text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none"
              />
            </label>
            <Link
              to="/app/agenda"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-[11px] uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Agendamento
            </Link>
          </div>
        </div>
      </header>

      {/* KPI strip */}
      <section className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Agendamentos · Hoje" value={String(todayAppts.length)} hint={`${completed} concluídos · ${waiting} aguardando`} />
        <Kpi label="Faturamento" value={formatBRL(todayRevenue)} hint="hoje, em tempo real" />
        <Kpi label="Ocupação" value={`${occupancy}%`} hint="das cadeiras · até 19h" />
        <Kpi label={`NPS · ${format(now, "MMM", { locale: ptBR })}`} value={nps.toFixed(1).replace(".", ",")} hint={`${clients.length} clientes na base`} />
      </section>

      {/* Main grid */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Próximos da casa */}
        <div className="rounded-md border border-border bg-card lg:col-span-2">
          <div className="flex items-end justify-between border-b border-border px-7 pb-4 pt-6">
            <h2 className="font-display text-3xl tracking-tight">Próximos da casa</h2>
            <Link to="/app/agenda" className="group inline-flex items-center gap-1.5 text-xs italic text-primary">
              ver agenda <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {upcoming.length === 0 && (
              <li className="px-7 py-10 text-center text-sm italic text-muted-foreground">
                Nenhum próximo agendamento hoje.
              </li>
            )}
            {upcoming.map(a => {
              const barber = barbers.find(b => b.id === a.barberId);
              const svc = services.find(s => s.id === a.serviceId);
              const client = clients.find(c => c.id === a.clientId);
              return (
                <li key={a.id} className="grid grid-cols-[80px_1fr_auto] items-center gap-4 px-7 py-5">
                  <span className="font-display text-2xl italic text-muted-foreground">
                    {format(new Date(a.start), "HH:mm")}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-xl leading-tight">{client?.name ?? "Cliente"}</p>
                    <p className="mt-0.5 truncate text-xs italic text-muted-foreground">
                      {svc?.name} · com {barber?.name?.split(" ")[0]}
                    </p>
                  </div>
                  <span className="inline-flex h-8 items-center rounded-sm border border-primary/40 px-3 text-[10px] uppercase tracking-[0.22em] text-primary">
                    Confirmado
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Faturamento semana */}
          <div className="rounded-md border border-border bg-card p-6">
            <h3 className="font-display text-2xl tracking-tight">Faturamento <span className="italic text-muted-foreground">· semana</span></h3>
            <div className="mt-6 flex h-32 items-end gap-2">
              {weekData.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-sm transition-colors ${d.isToday ? "bg-primary" : "bg-accent/70"}`}
                    style={{ height: `${Math.max(8, (d.cents / weekMax) * 100)}%` }}
                  />
                  <span className={`text-[10px] uppercase tracking-[0.18em] ${d.isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs italic text-muted-foreground">
              total: {formatBRL(weekTotal)} · ticket médio {formatBRL(weekTicket || ticketAvg)}
            </p>
          </div>

          {/* Top serviços */}
          <div className="rounded-md border border-border bg-card p-6">
            <h3 className="font-display text-2xl tracking-tight">Top serviços</h3>
            <ul className="mt-5 space-y-4">
              {topServices.map((s) => (
                <li key={s.name} className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-lg">{s.name}</span>
                    <span className="font-display text-sm italic text-muted-foreground">{s.count}</span>
                  </div>
                  <div className="h-px w-full bg-border">
                    <div
                      className="h-px bg-primary"
                      style={{ width: `${(s.count / topMax) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-card px-7 py-6">
      <p className="text-[10px] uppercase tracking-[0.25em] text-primary/85">{label}</p>
      <p className="mt-3 font-display text-5xl leading-none tracking-tight">{value}</p>
      <p className="mt-3 text-xs italic text-muted-foreground">{hint}</p>
    </div>
  );
}
