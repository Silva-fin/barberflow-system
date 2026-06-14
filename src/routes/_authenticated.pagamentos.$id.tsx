import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { PaymentBadge } from "@/components/app/fsm-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { formatBRLFromDecimal, formatDateTime } from "@/lib/format";
import { PAYMENT_METHODS, REFUND_REASONS, mockPayments, type Payment } from "@/lib/mock/fase1";

export const Route = createFileRoute("/_authenticated/pagamentos/$id")({
  head: () => ({ meta: [{ title: "Pagamento — Paladino" }] }),
  component: PaymentDetailPage,
});

function PaymentDetailPage() {
  const { id } = Route.useParams();
  const { role } = useAuth();
  const found = useMemo(() => mockPayments.find((p) => p.id === id) ?? mockPayments[0], [id]);
  const [payment, setPayment] = useState<Payment>(found);

  const canActOwnerAdmin = role === "OWNER" || role === "ADMIN";
  const isOwner = role === "OWNER";

  return (
    <div className="space-y-6">
      <Link to="/pagamentos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} strokeWidth={1.5} /> Pagamentos
      </Link>

      <PageHeader
        eyebrow={`Pagamento · ${payment.id}`}
        title={payment.clientName}
        description={`Criado em ${formatDateTime(payment.createdAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <PaymentBadge status={payment.status} />
            {canActOwnerAdmin && payment.status === "PENDING" && (
              <>
                <ConfirmDialog onConfirm={() => { setPayment((p) => ({ ...p, status: "CONFIRMED", paidAt: new Date().toISOString() })); toast.success("Pagamento confirmado"); }} />
                <ManualDiscountDialog
                  current={payment}
                  onApply={(amount, reason) => {
                    setPayment((p) => {
                      const newDiscount = (parseFloat(p.discount) + amount).toFixed(2);
                      const newNet = (parseFloat(p.gross) - parseFloat(newDiscount)).toFixed(2);
                      return { ...p, discount: newDiscount, net: newNet };
                    });
                    toast.success(`Desconto aplicado: ${reason}`);
                  }}
                />
              </>
            )}
            {canActOwnerAdmin && payment.status === "CONFIRMED" && (
              <RefundDialog isOwner={isOwner} onRefund={() => { setPayment((p) => ({ ...p, status: "REFUNDED", refundedAt: new Date().toISOString() })); toast.success("Pagamento estornado"); }} />
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="font-display text-xl">Valores</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Bruto" value={formatBRLFromDecimal(payment.gross)} />
            <Row label="Desconto" value={formatBRLFromDecimal(payment.discount)} />
            <Row label="Líquido" value={formatBRLFromDecimal(payment.net)} bold />
            <Row label="Taxa" value={formatBRLFromDecimal(payment.fee)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display text-xl">Origem</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Método" value={PAYMENT_METHODS.find((m) => m.value === payment.method)?.label ?? payment.method} />
            <Row label="Submétodo" value={payment.submethod ?? "—"} />
            <Row label="Provedor" value={payment.provider} />
            <Row label="Cupom" value={payment.couponCode ?? "—"} />
            <Row label="Operação" value={
              payment.appointmentId
                ? <Link to="/operacoes/$id" params={{ id: payment.appointmentId }} className="text-primary hover:underline">{payment.appointmentId}</Link>
                : "—"
            } />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display text-xl">Datas</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Criado" value={formatDateTime(payment.createdAt)} />
            <Row label="Pago" value={payment.paidAt ? formatDateTime(payment.paidAt) : "—"} />
            <Row label="Estornado" value={payment.refundedAt ? formatDateTime(payment.refundedAt) : "—"} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-mono text-base" : "font-mono"}>{value}</span>
    </div>
  );
}

function ConfirmDialog({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">Confirmar</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Confirmar pagamento</DialogTitle></DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => { onConfirm(); setOpen(false); }}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ManualDiscountDialog({ current, onApply }: { current: Payment; onApply: (amount: number, reason: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const amount = parseFloat(value);
  const valid = amount > 0 && reason.trim().length > 0 && amount <= parseFloat(current.net);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Desconto manual</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Aplicar desconto manual</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Valor (R$) *</Label>
            <Input type="number" step="0.01" min="0.01" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Motivo *</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Justificativa obrigatória" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button disabled={!valid} onClick={() => { onApply(amount, reason); setOpen(false); setValue(""); setReason(""); }}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RefundDialog({ isOwner, onRefund }: { isOwner: boolean; onRefund: () => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [forceLocal, setForceLocal] = useState(false);
  const valid = reason.length > 0;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="destructive">Estornar</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Estornar pagamento</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Motivo *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {REFUND_REASONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {isOwner && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={forceLocal} onCheckedChange={(v) => setForceLocal(!!v)} />
              Forçar estorno local (sem chamar provedor)
            </label>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="destructive" disabled={!valid} onClick={() => { onRefund(); setOpen(false); setReason(""); setForceLocal(false); }}>Confirmar estorno</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}