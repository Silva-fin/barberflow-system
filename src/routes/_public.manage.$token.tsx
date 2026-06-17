import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle, AlertTriangle, CalendarClock, CheckCircle2, Loader2, User, Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_public/manage/$token")({
  head: () => ({ meta: [{ title: "Seu agendamento" }] }),
  component: ManageAppointmentPage,
});

type Phase =
  | "loading"
  | "invalid"
  | "active"
  | "cancelled"
  | "rescheduled";

type Booking = {
  serviceName: string;
  professionalName: string;
  scheduledAt: string;
  status: string;
  canCancel: boolean;
  canReschedule: boolean;
};

const MOCK_BOOKING: Booking = {
  serviceName: "Corte + Barba",
  professionalName: "Rafael",
  scheduledAt: "2026-06-20T15:30:00",
  status: "Agendado",
  canCancel: true,
  canReschedule: true,
};

const fmtDateTime = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "short" }).format(new Date(iso));

function ManageAppointmentPage() {
  const { token } = useParams({ from: "/_public/manage/$token" });
  const [phase, setPhase] = useState<Phase>("loading");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [depositRetained, setDepositRetained] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");
  const [throttleWarning, setThrottleWarning] = useState(false);

  const clicksRef = useRef<number[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (token.endsWith("x")) setPhase("invalid");
      else {
        setBooking(MOCK_BOOKING);
        setPhase("active");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [token]);

  function trackClick() {
    const now = Date.now();
    clicksRef.current = clicksRef.current.filter((t) => now - t < 3000);
    clicksRef.current.push(now);
    if (clicksRef.current.length > 5) {
      setThrottleWarning(true);
      setTimeout(() => setThrottleWarning(false), 4000);
      return true;
    }
    return false;
  }

  async function confirmCancel() {
    if (trackClick()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    const retained = token.endsWith("d");
    setDepositRetained(retained);
    setResultMsg(
      retained
        ? "Agendamento cancelado. Como o cancelamento foi fora do prazo, o sinal pago foi retido conforme a política do estabelecimento."
        : "Agendamento cancelado com sucesso.",
    );
    setSubmitting(false);
    setCancelOpen(false);
    setPhase("cancelled");
  }

  async function confirmReschedule() {
    if (trackClick()) return;
    if (!newDate || !newTime) {
      setRescheduleError("Escolha uma data e um horário.");
      return;
    }
    setRescheduleError("");
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    if (token.endsWith("r")) {
      setRescheduleError("Esse horário não está disponível. Escolha outro.");
      setSubmitting(false);
      return;
    }
    setBooking((b) => b && { ...b, scheduledAt: `${newDate}T${newTime}:00` });
    setResultMsg("Agendamento remarcado com sucesso. Enviamos uma nova confirmação com o link atualizado.");
    setSubmitting(false);
    setRescheduleOpen(false);
    setPhase("rescheduled");
  }

  if (phase === "loading") {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2 pt-3">
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 flex-1" />
        </div>
      </div>
    );
  }

  if (phase === "invalid") {
    return (
      <div className="rounded-lg border border-border bg-card p-8 shadow-sm text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-2xl tracking-wide">Link inválido ou expirado</h1>
        <p className="text-sm text-muted-foreground">
          Este link de gestão não está mais disponível. Fale com o estabelecimento para reagendar.
        </p>
      </div>
    );
  }

  if (phase === "cancelled") {
    return (
      <div className="space-y-4">
        {depositRetained ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
              <div className="space-y-2">
                <h1 className="font-display text-xl tracking-wide">Cancelamento com retenção do sinal</h1>
                <p className="text-sm text-foreground/90">{resultMsg}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-2xl tracking-wide">Agendamento cancelado</h1>
            <p className="text-sm text-muted-foreground">{resultMsg}</p>
          </div>
        )}
      </div>
    );
  }

  if (phase === "rescheduled" && booking) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-2xl tracking-wide">Agendamento remarcado</h1>
        <p className="text-sm">
          Nova data: <span className="font-medium">{fmtDateTime(booking.scheduledAt)}</span>
        </p>
        <p className="text-sm text-muted-foreground">{resultMsg}</p>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="space-y-4">
      {throttleWarning && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300">
          Muitas tentativas, tente novamente em instantes.
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl tracking-wide">Seu agendamento</h1>
            <p className="text-xs text-muted-foreground mt-1">Gerencie sua reserva abaixo.</p>
          </div>
          <Badge variant="secondary">{booking.status}</Badge>
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <Row icon={<Scissors className="h-4 w-4 text-primary" strokeWidth={1.5} />} label="Serviço" value={booking.serviceName} />
          <Row icon={<User className="h-4 w-4 text-primary" strokeWidth={1.5} />} label="Profissional" value={booking.professionalName} />
          <Row icon={<CalendarClock className="h-4 w-4 text-primary" strokeWidth={1.5} />} label="Data e hora" value={fmtDateTime(booking.scheduledAt)} />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            className="h-12"
            disabled={!booking.canCancel}
            onClick={() => setCancelOpen(true)}
          >
            Cancelar
          </Button>
          <Button
            className="h-12"
            disabled={!booking.canReschedule}
            onClick={() => setRescheduleOpen(true)}
          >
            Remarcar
          </Button>
        </div>
      </div>

      <Dialog open={cancelOpen} onOpenChange={(o) => !submitting && setCancelOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar agendamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este agendamento?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" disabled={submitting} onClick={() => setCancelOpen(false)}>
              Voltar
            </Button>
            <Button disabled={submitting} onClick={confirmCancel}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sim, cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rescheduleOpen}
        onOpenChange={(o) => {
          if (submitting) return;
          setRescheduleOpen(o);
          if (!o) {
            setRescheduleError("");
            setNewDate("");
            setNewTime("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remarcar agendamento</DialogTitle>
            <DialogDescription>
              Escolha uma nova data e hora para o seu atendimento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm">Data</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                disabled={submitting}
                className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">Horário</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                disabled={submitting}
                className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm"
              />
            </div>
            {rescheduleError && (
              <p className="text-sm text-destructive">{rescheduleError}</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" disabled={submitting} onClick={() => setRescheduleOpen(false)}>
              Voltar
            </Button>
            <Button disabled={submitting} onClick={confirmReschedule}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar remarcação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
