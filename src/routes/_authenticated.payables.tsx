import { useMemo, useState } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { ClipboardList, Plus, Truck, XCircle, ListOrdered, Wallet, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { PayableBadge, InstallmentBadge } from "@/components/app/fsm-badge";
import { EmptyState } from "@/components/app/empty-state";
import { DateTimePicker } from "@/components/app/datetime-picker";
import { MoneyInput } from "@/components/app/money-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatBRLFromDecimal, formatDateTime } from "@/lib/format";
import {
  mockPayables, mockInstallments, mockSuppliers, mockAccounts, supplierName,
  type Payable, type Installment,
} from "@/lib/mock/fase3";
import { CLOSING_METHOD, PAYABLE_STATUS, type ClosingMethod, type PayableStatus } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

type SearchParams = { highlight?: string };

export const Route = createFileRoute("/_authenticated/payables")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    highlight: typeof s.highlight === "string" ? s.highlight : undefined,
  }),
  component: PayablesPage,
});

function PayablesPage() {
  const { role } = useAuth();
  const canWrite = role === "OWNER" || role === "ADMIN";
  const { highlight } = useSearch({ from: "/_authenticated/payables" });
  const [payables, setPayables] = useState<Payable[]>(mockPayables);
  const [installments, setInstallments] = useState<Installment[]>(mockInstallments);

  const [status, setStatus] = useState<"ALL" | PayableStatus>("ALL");
  const [supplier, setSupplier] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState<Payable | null>(null);
  const [viewing, setViewing] = useState<Payable | null>(null);

  const filtered = useMemo(() => payables.filter((p) => {
    if (status !== "ALL" && p.status !== status) return false;
    if (supplier !== "ALL" && p.supplier_id !== supplier) return false;
    if (from && p.due_date && p.due_date < from) return false;
    if (to && p.due_date && p.due_date > to) return false;
    return true;
  }), [payables, status, supplier, from, to]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financeiro"
        title="Contas a pagar"
        description="Payables com parcelas e pagamento por parcela."
        actions={canWrite && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={16} strokeWidth={1.5} />Nova conta
          </Button>
        )}
      />

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {Object.entries(PAYABLE_STATUS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Fornecedor</Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {mockSuppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Venc. de</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Até</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList size={28} strokeWidth={1.5} />} title="Sem payables" />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="w-32">Total</TableHead>
                <TableHead className="w-32">Pago</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-32">Vencimento</TableHead>
                <TableHead className="w-28">Fechamento</TableHead>
                <TableHead className="w-44 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className={highlight === p.id ? "bg-sidebar-primary/10" : ""}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {p.source_type === "SUPPLIER_ORDER" && (
                        <TooltipProvider><Tooltip><TooltipTrigger asChild>
                          <Truck size={14} strokeWidth={1.5} className="text-muted-foreground" />
                        </TooltipTrigger><TooltipContent>Pedido de estoque</TooltipContent></Tooltip></TooltipProvider>
                      )}
                      {p.description}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{supplierName(p.supplier_id)}</TableCell>
                  <TableCell>{formatBRLFromDecimal(p.total_amount)}</TableCell>
                  <TableCell>{formatBRLFromDecimal(p.paid_amount)}</TableCell>
                  <TableCell><PayableBadge status={p.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{p.due_date ? new Date(p.due_date).toLocaleDateString("pt-BR") : "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{CLOSING_METHOD[p.closing_method]}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewing(p)}>
                        <ListOrdered size={16} strokeWidth={1.5} />Parcelas
                      </Button>
                      {canWrite && p.status !== "PAID" && p.status !== "CANCELLED" && (
                        <Button variant="ghost" size="sm" onClick={() => setCancelling(p)}>
                          <XCircle size={16} strokeWidth={1.5} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <CreateDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(p, ins) => {
          const id = `pay_new_${Date.now()}`;
          setPayables((prev) => [{ ...p, id }, ...prev]);
          if (ins.length) setInstallments((prev) => [...ins.map((x, i) => ({ ...x, id: `inst_new_${id}_${i}`, payable_id: id })), ...prev]);
          toast.success("Conta a pagar criada");
          setCreating(false);
        }}
      />

      <Dialog open={!!cancelling} onOpenChange={(o) => { if (!o) setCancelling(null); }}>
        <CancelContent payable={cancelling} onClose={() => setCancelling(null)}
          onCancel={(id) => {
            setPayables((prev) => prev.map((p) => p.id === id ? { ...p, status: "CANCELLED" } : p));
            toast.success("Payable cancelado");
            setCancelling(null);
          }}
        />
      </Dialog>

      <InstallmentsSheet
        payable={viewing}
        installments={installments.filter((i) => i.payable_id === viewing?.id)}
        onClose={() => setViewing(null)}
        onPay={(installmentId) => {
          setInstallments((prev) => prev.map((i) => i.id === installmentId ? { ...i, status: "PAID", paid_at: new Date().toISOString() } : i));
          // Atualizar status do payable conforme resposta mockada
          if (!viewing) return;
          const rest = installments.filter((i) => i.payable_id === viewing.id).map((i) => i.id === installmentId ? { ...i, status: "PAID" as const } : i);
          const allPaid = rest.every((i) => i.status === "PAID");
          setPayables((prev) => prev.map((p) => p.id === viewing.id ? { ...p, status: allPaid ? "PAID" : "PARTIALLY_PAID" } : p));
          toast.success(allPaid ? "Parcela paga — conta quitada" : "Parcela paga — conta parcial");
        }}
      />
    </div>
  );
}

function CancelContent({ payable, onClose, onCancel }: {
  payable: Payable | null; onClose: () => void; onCancel: (id: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Cancelar conta a pagar</DialogTitle>
        <DialogDescription>{payable?.description}</DialogDescription>
      </DialogHeader>
      <div className="space-y-1">
        <Label>Motivo *</Label>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Voltar</Button>
        <Button variant="destructive" disabled={!reason.trim()} onClick={() => payable && onCancel(payable.id)}>
          Cancelar payable
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function CreateDialog({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void;
  onCreate: (p: Payable, ins: Installment[]) => void;
}) {
  const [description, setDescription] = useState("");
  const [total, setTotal] = useState("");
  const [supplier, setSupplier] = useState("NONE");
  const [dueDate, setDueDate] = useState("");
  const [closing, setClosing] = useState<ClosingMethod>("CASH_AT_CREATION");
  const [insts, setInsts] = useState<{ amount: string; due_date: string }[]>([{ amount: "", due_date: "" }]);

  const reset = () => { setDescription(""); setTotal(""); setSupplier("NONE"); setDueDate(""); setClosing("CASH_AT_CREATION"); setInsts([{ amount: "", due_date: "" }]); };
  const canSubmit = description.trim() && total.trim() &&
    (closing === "CASH_AT_CREATION" || insts.every((i) => i.amount && i.due_date));

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova conta a pagar</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Descrição</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Valor total</Label><MoneyInput value={total} onChange={setTotal} /></div>
            <div className="space-y-1">
              <Label>Fornecedor</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Sem fornecedor</SelectItem>
                  {mockSuppliers.filter((s) => s.active).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1"><Label>Vencimento</Label><DateTimePicker value={dueDate} onChange={setDueDate} /></div>
          <div className="space-y-1">
            <Label>Fechamento</Label>
            <Select value={closing} onValueChange={(v) => setClosing(v as ClosingMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CLOSING_METHOD).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {closing === "INSTALLMENTS" && (
            <div className="space-y-2 rounded-md border border-border p-3">
              <Label className="text-xs">Parcelas</Label>
              {insts.map((it, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <div className="w-32"><Label className="text-xs">Valor</Label><MoneyInput value={it.amount} onChange={(v) => setInsts((arr) => arr.map((x, i) => i === idx ? { ...x, amount: v } : x))} /></div>
                  <div className="flex-1"><Label className="text-xs">Vencimento</Label><Input type="date" value={it.due_date} onChange={(e) => setInsts((arr) => arr.map((x, i) => i === idx ? { ...x, due_date: e.target.value } : x))} /></div>
                  <Button variant="ghost" size="icon" onClick={() => setInsts((arr) => arr.filter((_, i) => i !== idx))} disabled={insts.length === 1}>
                    <Trash2 size={16} strokeWidth={1.5} />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setInsts((arr) => [...arr, { amount: "", due_date: "" }])}>
                <Plus size={16} strokeWidth={1.5} />Adicionar parcela
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canSubmit} onClick={() => onCreate(
            {
              id: "", description, supplier_id: supplier === "NONE" ? null : supplier,
              total_amount: total, paid_amount: "0.00", status: "OPEN",
              due_date: dueDate || null, closing_method: closing,
              source_type: "MANUAL", created_at: new Date().toISOString(),
            },
            closing === "INSTALLMENTS" ? insts.map((i, idx) => ({
              id: "", payable_id: "", installment_number: idx + 1,
              amount: i.amount, due_date: i.due_date, status: "OPEN" as const,
            })) : [],
          )}>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InstallmentsSheet({ payable, installments, onClose, onPay }: {
  payable: Payable | null; installments: Installment[];
  onClose: () => void; onPay: (installmentId: string) => void;
}) {
  const [paying, setPaying] = useState<Installment | null>(null);
  const [account, setAccount] = useState("NONE");
  const [paymentId, setPaymentId] = useState("");

  return (
    <Sheet open={!!payable} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Parcelas</SheetTitle>
          <SheetDescription>{payable?.description}</SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          {installments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Esta conta foi quitada à vista (sem parcelas).</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Nº</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pago em</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installments.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.installment_number}</TableCell>
                    <TableCell>{formatBRLFromDecimal(i.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(i.due_date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell><InstallmentBadge status={i.status} /></TableCell>
                    <TableCell className="text-muted-foreground text-xs">{i.paid_at ? formatDateTime(i.paid_at) : "—"}</TableCell>
                    <TableCell className="text-right">
                      {i.status === "OPEN" && (
                        <Button variant="ghost" size="sm" onClick={() => setPaying(i)}>
                          <Wallet size={16} strokeWidth={1.5} />Pagar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <Dialog open={!!paying} onOpenChange={(o) => { if (!o) { setPaying(null); setAccount("NONE"); setPaymentId(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pagar parcela #{paying?.installment_number}</DialogTitle>
              <DialogDescription>{formatBRLFromDecimal(paying?.amount)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Conta (opcional)</Label>
                <Select value={account} onValueChange={setAccount}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Não especificar</SelectItem>
                    {mockAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Payment ID (opcional)</Label>
                <Input value={paymentId} onChange={(e) => setPaymentId(e.target.value)} placeholder="ID do pagamento vinculado" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaying(null)}>Cancelar</Button>
              <Button onClick={() => {
                if (paying) { onPay(paying.id); setPaying(null); setAccount("NONE"); setPaymentId(""); }
              }}>Confirmar pagamento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}