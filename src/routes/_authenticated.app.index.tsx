import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";
import { CalendarCheck, DollarSign, Receipt, TrendingUp } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, isToday, startOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "Dashboard — Navalha" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const shopId = user!.barbershopId;
  const { data: appts = [] } = useQuery({ queryKey: ["appts", shopId], queryFn: () => api.listAppointments(shopId) });
  const { data: barbers = [] } = useQuery({ queryKey: ["barbers", shopId], queryFn: () => api.listBarbers(shopId) });
  const { data: services = [] } = useQuery({ queryKey: ["services", shopId], queryFn: () => api.listServices(shopId) });
  const { data: clients = [] } = useQuery({ queryKey: ["clients", shopId], queryFn: () => api.listClients(shopId) });

  const todayAppts = appts.filter(a => isToday(new Date(a.start)));
  const todayRevenue = todayAppts.filter(a => a.status !== "cancelled").reduce((s, a) => s + a.priceCents, 0);
  const completedAll = appts.filter(a => a.status === "completed");
  const avgTicket = completedAll.length ? completedAll.reduce((s,a)=>s+a.priceCents,0)/completedAll.length : 0;

  // 7-day revenue chart
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = startOfDay(subDays(new Date(), 6 - i));
    const dayAppts = appts.filter(a => startOfDay(new Date(a.start)).getTime() === d.getTime() && a.status !== "cancelled");
    return {
      day: format(d, "EEE", { locale: ptBR }),
      receita: dayAppts.reduce((s,a)=>s+a.priceCents,0) / 100,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Bom dia, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={DollarSign} label="Faturamento hoje" value={formatBRL(todayRevenue)} />
        <KpiCard icon={CalendarCheck} label="Agendamentos hoje" value={String(todayAppts.length)} />
        <KpiCard icon={Receipt} label="Ticket médio" value={formatBRL(avgTicket)} />
        <KpiCard icon={TrendingUp} label="Clientes na base" value={String(clients.length)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Receita — últimos 7 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    cursor={{ fill: "var(--color-accent)" }}
                    contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
                    formatter={(v: number) => [formatBRL(v*100), "Receita"]}
                  />
                  <Bar dataKey="receita" fill="var(--color-primary)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agenda de hoje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayAppts.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum agendamento hoje.</p>
            )}
            {todayAppts.sort((a,b)=>a.start.localeCompare(b.start)).slice(0,8).map(a => {
              const barber = barbers.find(b => b.id === a.barberId);
              const svc = services.find(s => s.id === a.serviceId);
              const client = clients.find(c => c.id === a.clientId);
              return (
                <div key={a.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{client?.name ?? "Cliente"}</p>
                    <p className="text-xs text-muted-foreground">{svc?.name} · {barber?.name?.split(" ")[0]}</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {format(new Date(a.start), "HH:mm")}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-3xl tracking-wide">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
