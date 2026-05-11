import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { addDays, endOfWeek, format, isSameDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/agenda")({
  head: () => ({ meta: [{ title: "Agenda — Navalha" }] }),
  component: AgendaPage,
});

function AgendaPage() {
  const { user } = useAuth();
  const shopId = user!.barbershopId;
  const [anchor, setAnchor] = useState(new Date());
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: barbers = [] } = useQuery({ queryKey: ["barbers", shopId], queryFn: () => api.listBarbers(shopId) });
  const { data: services = [] } = useQuery({ queryKey: ["services", shopId], queryFn: () => api.listServices(shopId) });
  const { data: clients = [] } = useQuery({ queryKey: ["clients", shopId], queryFn: () => api.listClients(shopId) });
  const { data: appts = [] } = useQuery({
    queryKey: ["appts-week", shopId, weekStart.toISOString()],
    queryFn: () => api.listAppointments(shopId, { from: weekStart, to: weekEnd }),
  });

  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const dayAppts = useMemo(() =>
    appts.filter(a => isSameDay(new Date(a.start), selectedDay)).sort((a,b)=>a.start.localeCompare(b.start)),
    [appts, selectedDay]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Agenda</h1>
          <p className="text-sm text-muted-foreground">
            {format(weekStart, "d MMM", { locale: ptBR })} – {format(weekEnd, "d MMM yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setAnchor(addDays(anchor, -7))}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={() => { setAnchor(new Date()); setSelectedDay(new Date()); }}>Hoje</Button>
          <Button variant="outline" size="icon" onClick={() => setAnchor(addDays(anchor, 7))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const count = appts.filter(a => isSameDay(new Date(a.start), d)).length;
          const active = isSameDay(d, selectedDay);
          return (
            <button
              key={d.toISOString()}
              onClick={() => setSelectedDay(d)}
              className={`flex flex-col items-center rounded-lg border p-3 transition-colors ${active ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
            >
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {format(d, "EEE", { locale: ptBR })}
              </span>
              <span className="font-display text-2xl">{format(d, "d")}</span>
              <span className="text-[10px] text-muted-foreground">{count} agend.</span>
            </button>
          );
        })}
      </div>

      <Card className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid border-b border-border" style={{ gridTemplateColumns: `80px repeat(${barbers.length}, 1fr)` }}>
            <div className="p-3 text-xs uppercase tracking-widest text-muted-foreground">Hora</div>
            {barbers.map(b => (
              <div key={b.id} className="border-l border-border p-3">
                <p className="text-sm font-medium">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.specialties[0]}</p>
              </div>
            ))}
          </div>
          {Array.from({ length: 12 }, (_, i) => 8 + i).map(h => (
            <div key={h} className="grid border-b border-border last:border-0" style={{ gridTemplateColumns: `80px repeat(${barbers.length}, 1fr)` }}>
              <div className="p-3 font-mono text-xs text-muted-foreground">{String(h).padStart(2,"0")}:00</div>
              {barbers.map(b => {
                const slot = dayAppts.filter(a => a.barberId === b.id && new Date(a.start).getHours() === h);
                return (
                  <div key={b.id} className="min-h-[64px] border-l border-border p-1">
                    {slot.map(a => {
                      const svc = services.find(s => s.id === a.serviceId);
                      const c = clients.find(cl => cl.id === a.clientId);
                      return (
                        <div key={a.id} className="rounded-md bg-primary/15 border-l-2 border-primary p-2">
                          <p className="text-xs font-medium truncate">{c?.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{svc?.name}</p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="font-mono text-[10px]">{format(new Date(a.start),"HH:mm")}</span>
                            <Badge variant="outline" className="text-[9px] px-1">{formatBRL(a.priceCents)}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
