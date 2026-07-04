import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarClock,
  MapPin,
  Phone,
  Scissors,
  User,
  XCircle,
} from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge, appointmentTone } from "@/components/portal/status-badge";
import {
  cancelAppointment,
  fetchAppointmentById,
  rescheduleAppointment,
} from "@/lib/portal/api";
import { APPOINTMENT_STATUS_LABEL } from "@/lib/portal/mock";
import { formatBRLFromDecimal, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/portal/agendamento/$id")({
  component: () => (
    <RequirePortalAuth title="Agendamento">
      <AppointmentDetailPage />
    </RequirePortalAuth>
  ),
});

function AppointmentDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["portal", "appointment", id],
    queryFn: () => fetchAppointmentById(id),
  });

  const [reschedule, setReschedule] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [busy, setBusy] = useState(false);

  if (q.isLoading) return <Skeleton className="h-72 w-full" />;
  if (!q.data)
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        Agendamento não encontrado.
      </Card>
    );

  const a = q.data;
  const canAct = a.status === "agendado";

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["portal", "appointment", id] });
    qc.invalidateQueries({ queryKey: ["portal", "upcoming"] });
  };

  const doReschedule = async () => {
    if (!date || !time) return;
    setBusy(true);
    try {
      const iso = new Date(`${date}T${time}:00`).toISOString();
      await rescheduleAppointment(a.id, iso);
      toast.success("Agendamento remarcado");
      setReschedule(false);
      invalidate();
    } finally {
      setBusy(false);
    }
  };

  const doCancel = async () => {
    setBusy(true);
    try {
      await cancelAppointment(a.id);
      toast.success("Agendamento cancelado");
      setCancelOpen(false);
      invalidate();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-primary/80">
              {a.establishment.name}
            </p>
            <h2 className="mt-1 font-display text-2xl leading-tight">
              {a.service}
            </h2>
            {a.duration && (
              <p className="text-xs text-muted-foreground">{a.duration} min</p>
            )}
          </div>
          <StatusBadge tone={appointmentTone(a.status)}>
            {APPOINTMENT_STATUS_LABEL[a.status]}
          </StatusBadge>
        </div>

        <div className="mt-4 space-y-3 border-t border-border/60 pt-4 text-sm">
          <Line icon={CalendarClock} label={formatDateTime(a.when)} />
          <Line icon={User} label={`com ${a.professional}`} />
          <Line icon={Scissors} label={`Total: ${formatBRLFromDecimal(a.amountBRL)}`} />
        </div>

        <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm">
          <p className="font-medium">{a.establishment.name}</p>
          {a.establishment.address && (
            <Line icon={MapPin} label={a.establishment.address} />
          )}
          {a.establishment.phone && (
            <Line icon={Phone} label={a.establishment.phone} />
          )}
          {a.establishment.mapUrl && (
            <a
              href={a.establishment.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs text-primary hover:underline"
            >
              Ver no mapa →
            </a>
          )}
        </div>

        {canAct && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border/60 pt-4">
            <Button onClick={() => setReschedule(true)}>Remarcar</Button>
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => setCancelOpen(true)}
            >
              <XCircle size={14} strokeWidth={1.5} className="mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={reschedule} onOpenChange={setReschedule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remarcar agendamento</DialogTitle>
            <DialogDescription>
              Escolha uma nova data e hora.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReschedule(false)}
              disabled={busy}
            >
              Voltar
            </Button>
            <Button onClick={doReschedule} disabled={busy || !date || !time}>
              Confirmar remarcação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar agendamento?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este agendamento?
            </DialogDescription>
          </DialogHeader>
          {a.hasDeposit && (
            <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs">
              <AlertTriangle
                size={14}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0 text-warning"
              />
              <p className="text-muted-foreground">
                O sinal pago não será reembolsado por estar fora do prazo de
                cancelamento.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={busy}
            >
              Voltar
            </Button>
            <Button variant="destructive" onClick={doCancel} disabled={busy}>
              Sim, cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Line({
  icon: Icon,
  label,
}: {
  icon: typeof CalendarClock;
  label: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon
        size={14}
        strokeWidth={1.5}
        className="mt-0.5 shrink-0 text-muted-foreground"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
