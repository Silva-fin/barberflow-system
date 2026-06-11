import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, ArrowRight, Check, Clock, Scissors, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";
import { toast } from "sonner";
import paladinoWordmark from "@/assets/paladino-wordmark-tight.png";

type BookingSearch = { service?: string; barber?: string };

export const Route = createFileRoute("/b/$slug/agendar")({
  validateSearch: (s: Record<string, unknown>): BookingSearch => ({
    service: typeof s.service === "string" ? s.service : undefined,
    barber: typeof s.barber === "string" ? s.barber : undefined,
  }),
  head: ({ params }) => ({ meta: [{ title: `Agendar — ${params.slug}` }] }),
  component: BookingPage,
});

type Step = 1 | 2 | 3 | 4;

function BookingPage() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const { data: shop, isLoading } = useQuery({ queryKey: ["shop", slug], queryFn: () => api.getBarbershopBySlug(slug) });
  const { data: services = [] } = useQuery({
    queryKey: ["services-pub", shop?.id], queryFn: () => api.listServices(shop!.id), enabled: !!shop,
  });
  const { data: barbers = [] } = useQuery({
    queryKey: ["barbers-pub", shop?.id], queryFn: () => api.listBarbers(shop!.id), enabled: !!shop,
  });

  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | "any" | null>(null);
  const [date, setDate] = useState<Date>(startOfDay(new Date()));
  const [slot, setSlot] = useState<string | null>(null);
  const [client, setClient] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  // Hydrate initial step from search params
  useEffect(() => {
    if (services.length === 0) return;
    if (search.service && services.some(s => s.id === search.service)) {
      setServiceId(search.service);
      if (search.barber && barbers.some(b => b.id === search.barber)) {
        setBarberId(search.barber);
        setStep(3);
      } else {
        setStep(2);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services.length, barbers.length]);

  const service = services.find(s => s.id === serviceId);
  const eligibleBarbers = service ? barbers.filter(b => service.barberIds.includes(b.id)) : [];

  const { data: slots = [] } = useQuery({
    queryKey: ["slots", shop?.id, serviceId, barberId, date.toISOString()],
    queryFn: () => api.getAvailableSlots({ barbershopId: shop!.id, serviceId: serviceId!, barberId: barberId!, date }),
    enabled: !!shop && !!serviceId && !!barberId,
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Carregando...</div>;
  }
  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-4xl">Barbearia não encontrada</h1>
          <Link to="/" className="mt-3 inline-block text-sm text-primary">Voltar</Link>
        </div>
      </div>
    );
  }

  const days = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));

  async function confirmBooking() {
    if (!service || !slot || !shop) return;
    setSubmitting(true);
    try {
      const start = new Date(slot);
      const end = new Date(start.getTime() + service.durationMin * 60000);
      const finalBarberId = barberId === "any" ? eligibleBarbers[0].id : barberId!;
      const a = await api.createAppointment({
        barbershopId: shop.id,
        barberId: finalBarberId,
        serviceId: service.id,
        clientId: "c-1",
        start: start.toISOString(),
        end: end.toISOString(),
        status: "scheduled",
        priceCents: service.priceCents,
        notes: `${client.name} · ${client.phone}`,
      });
      toast.success("Agendamento confirmado!");
      navigate({ to: "/b/$slug/confirmacao/$id", params: { slug, id: a.id } });
    } catch {
      toast.error("Erro ao confirmar.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link to="/b/$slug" params={{ slug }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> {shop.name}
          </Link>
          <div className="flex items-center gap-3">
            <img
              src={paladinoWordmark}
              alt="Paladino"
              className="h-12 md:h-14 w-auto object-contain brightness-110 contrast-110 drop-shadow-sm"
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <Stepper step={step} />

        <div className="mt-8">
          {step === 1 && (
            <div>
              <h2 className="font-display text-2xl tracking-wide">Escolha o serviço</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {services.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setServiceId(s.id); setBarberId(null); setSlot(null); setStep(2); }}
                    className={`text-left rounded-lg border p-4 transition-all hover:border-primary ${serviceId === s.id ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{s.name}</p>
                        {s.description && <p className="text-xs text-muted-foreground mt-1">{s.description}</p>}
                      </div>
                      <Scissors className="h-4 w-4 text-primary" />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {s.durationMin} min
                      </span>
                      <span className="font-display text-lg text-primary">{formatBRL(s.priceCents)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && service && (
            <div>
              <h2 className="font-display text-2xl tracking-wide">Escolha o barbeiro</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => { setBarberId("any"); setSlot(null); setStep(3); }}
                  className={`text-left rounded-lg border p-4 transition-all hover:border-primary ${barberId === "any" ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Qualquer disponível</p>
                      <p className="text-xs text-muted-foreground">Escolhe o primeiro horário livre</p>
                    </div>
                  </div>
                </button>
                {eligibleBarbers.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setBarberId(b.id); setSlot(null); setStep(3); }}
                    className={`text-left rounded-lg border p-4 transition-all hover:border-primary ${barberId === b.id ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {b.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-semibold">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.specialties.join(" · ")}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-start pt-6">
                <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="mr-1 h-4 w-4" /> Voltar</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl tracking-wide">Escolha o dia</h2>
                <div className="mt-4 grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {days.map(d => {
                    const active = isSameDay(d, date);
                    return (
                      <button
                        key={d.toISOString()}
                        onClick={() => { setDate(d); setSlot(null); }}
                        className={`flex flex-col items-center rounded-lg border p-3 ${active ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
                      >
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{format(d, "EEE", { locale: ptBR })}</span>
                        <span className="font-display text-2xl">{format(d, "d")}</span>
                        <span className="text-[10px] text-muted-foreground">{format(d, "MMM", { locale: ptBR })}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Horários disponíveis</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {slots.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum horário disponível neste dia.</p>
                  )}
                  {slots.map(s => {
                    const active = slot === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setSlot(s)}
                        className={`rounded-md border px-4 py-2 font-mono text-sm ${active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`}
                      >
                        {format(new Date(s), "HH:mm")}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft className="mr-1 h-4 w-4" /> Voltar</Button>
                <Button disabled={!slot} onClick={() => setStep(4)}>Continuar <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {step === 4 && service && slot && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl tracking-wide">Seus dados</h2>

              <Card className="p-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Serviço</span><span className="font-medium">{service.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Barbeiro</span><span className="font-medium">{barberId === "any" ? "Qualquer disponível" : barbers.find(b => b.id === barberId)?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Quando</span><span className="font-medium">{format(new Date(slot), "EEEE, d MMM 'às' HH:mm", { locale: ptBR })}</span></div>
                  <div className="flex justify-between border-t border-border pt-2 mt-1"><span className="text-muted-foreground">Total</span><Badge variant="outline" className="font-display text-base">{formatBRL(service.priceCents)}</Badge></div>
                </div>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2"><Label>Nome completo</Label><Input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} placeholder="Seu nome" /></div>
                <div className="space-y-2"><Label>Telefone</Label><Input value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} placeholder="(11) 90000-0000" /></div>
                <div className="space-y-2"><Label>E-mail (opcional)</Label><Input type="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} placeholder="seu@email.com" /></div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(3)}><ArrowLeft className="mr-1 h-4 w-4" /> Voltar</Button>
                <Button onClick={confirmBooking} disabled={!client.name || !client.phone || submitting}>
                  {submitting ? "Confirmando..." : <>Confirmar agendamento <Check className="ml-1 h-4 w-4" /></>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["Serviço", "Barbeiro", "Horário", "Confirmar"];
  return (
    <div className="flex items-center gap-2">
      {labels.map((l, i) => {
        const n = i + 1;
        const done = step > n;
        const current = step === n;
        return (
          <div key={l} className="flex flex-1 items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium ${done ? "border-primary bg-primary text-primary-foreground" : current ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
              {done ? <Check className="h-3 w-3" /> : n}
            </div>
            <span className={`hidden sm:block text-xs ${current ? "text-foreground" : "text-muted-foreground"}`}>{l}</span>
            {n < labels.length && <div className={`h-px flex-1 ${done ? "bg-primary" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}