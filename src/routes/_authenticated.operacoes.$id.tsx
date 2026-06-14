import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Check, X, CalendarClock, Play, UserX } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { AppointmentBadge, PaymentBadge } from "@/components/app/fsm-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { mockAppointments, type AppointmentDetail } from "@/lib/mock/fase1";
import { formatBRLFromDecimal, formatDateTime } from "@/lib/format";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/operacoes/$id")({
  head: () => ({ meta: [{ title: "Detalhe da operação — Paladino" }] }),
  component: AppointmentDetailPage,
});

function AppointmentDetailPage() {
  const { id } = Route.useParams();
  const found = useMemo(() => mockAppointments.find((a) => a.id === id) ?? mockAppointments[0], [id]);
  const [appt, setAppt] = useState<AppointmentDetail>(found);
  const { role } = useAuth();
  const isProfessional = role === "PROFESSIONAL";

  const balance =
    appt.deposit
      ? (parseFloat(appt.total) - parseFloat(appt.deposit.amount)).toFixed(2)
      : null;

  function pushTransition(to: AppointmentDetail["status"], reason?: string) {
    setAppt((prev) => ({
      ...prev,
      status: to,
      transitions: [
        ...prev.transitions,
        { at: new Date().toISOString(), from: prev.status, to, by: reason ? `Você · ${reason}` : "Você" },
      ],
    }));
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/agenda" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft size={16} strokeWidth={1.5} /> Voltar
          </Link>
        </div>
        <PageHeader
          eyebrow={`Operação · ${appt.id}`}
          title={appt.clientName}
          description={`${formatDateTime(appt.startsAt)} → ${formatDateTime(appt.endsAt)}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <AppointmentBadge status={appt.status} />
              {!isProfessional && <ActionButtons appt={appt} onTransition={pushTransition} />}
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader><CardTitle className="font-display text-xl">Serviço(s)</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-28 text-right">Duração</TableHead>
                      <TableHead className="w-32 text-right">Preço</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appt.services.map((s, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{s.durationMin} min</TableCell>
                        <TableCell className="text-right font-mono">{formatBRLFromDecimal(s.price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-display text-xl">Profissional</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{appt.professionalName}</p>
                <p className="text-xs text-muted-foreground">Cliente: {appt.clientPhone}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-display text-xl">Valores</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-3 gap-4 text-sm">
                  <div><dt className="text-muted-foreground">Subtotal</dt><dd className="font-mono">{formatBRLFromDecimal(appt.subtotal)}</dd></div>
                  <div><dt className="text-muted-foreground">Desconto</dt><dd className="font-mono">{formatBRLFromDecimal(appt.discount)}</dd></div>
                  <div><dt className="text-muted-foreground">Total</dt><dd className="font-mono text-base">{formatBRLFromDecimal(appt.total)}</dd></div>
                </dl>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            {appt.deposit && (
              <Card>
                <CardHeader><CardTitle className="font-display text-xl">Sinal / Depósito</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sinal pago</span>
                    <span className="font-mono">{formatBRLFromDecimal(appt.deposit.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <PaymentBadge status={appt.deposit.status} />
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm text-muted-foreground">Saldo pendente</span>
                    <span className="font-mono">{formatBRLFromDecimal(balance!)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle className="font-display text-xl">Histórico</CardTitle></CardHeader>
              <CardContent>
                <ol className="relative space-y-4 border-l border-border pl-4">
                  {appt.transitions.map((t, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[21px] top-1 size-2 rounded-full bg-primary" />
                      <p className="text-sm">
                        <span className="text-muted-foreground">{t.from} →</span>{" "}
                        <span className="font-medium">{t.to}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(t.at)} · {t.by}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </TooltipProvider>
  );
}

function ActionButtons({
  appt, onTransition,
}: { appt: AppointmentDetail; onTransition: (to: AppointmentDetail["status"], reason?: string) => void }) {
  const [completeOpen, setCompleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [newDate, setNewDate] = useState("");

  const canComplete = appt.status === "SCHEDULED" || appt.status === "IN_PROGRESS";
  const canCancel = appt.status === "SCHEDULED" || appt.status === "IN_PROGRESS";

  return (
    <>
      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogTrigger asChild>
          <Button size="sm" disabled={!canComplete}>
            <Check size={16} strokeWidth={1.5} /> Concluir
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Concluir operação</DialogTitle>
            <DialogDescription>Confirma a conclusão deste atendimento?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteOpen(false)}>Cancelar</Button>
            <Button onClick={() => { onTransition("COMPLETED"); setCompleteOpen(false); toast.success("Operação concluída"); }}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={!canCancel}>
            <X size={16} strokeWidth={1.5} /> Cancelar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar operação</DialogTitle>
            <DialogDescription>Informe o motivo do cancelamento (opcional).</DialogDescription>
          </DialogHeader>
          <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Motivo" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Voltar</Button>
            <Button variant="destructive" onClick={() => { onTransition("CANCELLED", cancelReason || undefined); setCancelOpen(false); setCancelReason(""); toast.success("Operação cancelada"); }}>
              Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={!canCancel}>
            <CalendarClock size={16} strokeWidth={1.5} /> Remarcar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Remarcar</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="newDate">Novo horário</Label>
            <Input id="newDate" type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>Cancelar</Button>
            <Button disabled={!newDate} onClick={() => { setRescheduleOpen(false); toast.success("Operação remarcada"); }}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tooltip>
        <TooltipTrigger asChild>
          <span><Button size="sm" variant="ghost" disabled><Play size={16} strokeWidth={1.5} /> Iniciar</Button></span>
        </TooltipTrigger>
        <TooltipContent>Em breve</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <span><Button size="sm" variant="ghost" disabled><UserX size={16} strokeWidth={1.5} /> No-show</Button></span>
        </TooltipTrigger>
        <TooltipContent>Em breve</TooltipContent>
      </Tooltip>
    </>
  );
}