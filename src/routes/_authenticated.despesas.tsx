import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Repeat, Receipt, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { ExpenseBadge } from "@/components/app/fsm-badge";
import { MoneyInput } from "@/components/app/money-input";
import { DateTimePicker } from "@/components/app/datetime-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatBRLFromDecimal, formatDateTime } from "@/lib/format";
import { ENTRY_CATEGORY, EXPENSE_CATEGORY_KEYS, EXPENSE_STATUS, type ExpenseStatus, type EntryCategoryKey } from "@/lib/constants";
import { mockExpenses, mockSuppliers, supplierName, type Expense } from "@/lib/mock/fase3";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/despesas")({
  component: DespesasPage,
});

function DespesasPage() {
  const { role } = useAuth();
  const canWrite = role === "OWNER" || role === "ADMIN";
  const [items, setItems] = useState<Expense[]>(mockExpenses);

  const [status, setStatus] = useState<"ALL" | ExpenseStatus>("ALL");
  const [category, setCategory] = useState<"ALL" | EntryCategoryKey>("ALL");
  const [supplier, setSupplier] = useState<"ALL" | string>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState<Expense | null>(null);
  const [cancelling, setCancelling] = useState<Expense | null>(null);

  const filtered = useMemo(() => items.filter((e) => {
    if (status !== "ALL" && e.status !== status) return false;
    if (category !== "ALL" && e.category !== category) return false;
    if (supplier !== "ALL" && e.supplier_id !== supplier) return false;
    if (from && e.due_date < from) return false;
    if (to && e.due_date > to) return false;
    return true;
  }), [items, status, category, supplier, from, to]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financeiro"
        title="Despesas"
        description="Despesas lançadas, recorrentes e baixas."
        actions={canWrite && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={16} strokeWidth={1.5} />Nova despesa
          </Button>
        )}
      />

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <FilterSelect label="Status" value={status} onChange={(v) => setStatus(v as any)} options={[
            { value: "ALL", label: "Todos" },
            ...Object.entries(EXPENSE_STATUS).map(([v, l]) => ({ value: v, label: l })),
          ]} />
          <FilterSelect label="Categoria" value={category} onChange={(v) => setCategory(v as any)} options={[
            { value: "ALL", label: "Todas" },
            ...EXPENSE_CATEGORY_KEYS.map((k) => ({ value: k, label: ENTRY_CATEGORY[k] })),
          ]} />
          <FilterSelect label="Fornecedor" value={supplier} onChange={(v) => setSupplier(v)} options={[
            { value: "ALL", label: "Todos" },
            ...mockSuppliers.map((s) => ({ value: s.id, label: s.name })),
          ]} />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Venc. de</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Venc. até</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<Receipt size={28} strokeWidth={1.5} />} title="Nenhuma despesa" description="Ajuste os filtros ou lance a primeira despesa." />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="w-32">Valor</TableHead>
                <TableHead className="w-36">Vencimento</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="w-40">Pago</TableHead>
                <TableHead className="w-40 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => {
                const isChild = !!e.parent_expense_id;
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        {isChild && (
                          <TooltipProvider><Tooltip><TooltipTrigger asChild>
                            <Repeat size={14} strokeWidth={1.5} className="text-muted-foreground" />
                          </TooltipTrigger><TooltipContent>Gerada por recorrência</TooltipContent></Tooltip></TooltipProvider>
                        )}
                        {e.description}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ENTRY_CATEGORY[e.category] ?? e.category}</TableCell>
                    <TableCell>{formatBRLFromDecimal(e.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(e.due_date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell><ExpenseBadge status={e.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{supplierName(e.supplier_id)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.status === "PAGA" && e.paid_at ? (
                        <>
                          <div>{formatBRLFromDecimal(e.paid_amount)}</div>
                          <div className="text-xs">{formatDateTime(e.paid_at)}</div>
                        </>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {canWrite && !isChild && e.status === "PENDENTE" && (
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setPaying(e)}>
                            <CheckCircle2 size={16} strokeWidth={1.5} />Pagar
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setCancelling(e)}>
                            <XCircle size={16} strokeWidth={1.5} />Cancelar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <CreateDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(exp) => {
          setItems((prev) => [{ ...exp, id: `exp_new_${Date.now()}` }, ...prev]);
          toast.success("Despesa lançada");
          setCreating(false);
        }}
      />
      <PayDialog
        expense={paying}
        onClose={() => setPaying(null)}
        onPay={(id, paidAmount) => {
          setItems((prev) => prev.map((e) => e.id === id ? { ...e, status: "PAGA", paid_amount: paidAmount, paid_at: new Date().toISOString() } : e));
          toast.success("Despesa paga");
          setPaying(null);
        }}
      />
      <CancelDialog
        expense={cancelling}
        onClose={() => setCancelling(null)}
        onCancel={(id) => {
          setItems((prev) => prev.map((e) => e.id === id ? { ...e, status: "CANCELLED" } : e));
          toast.success("Despesa cancelada");
          setCancelling(null);
        }}
      />
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function CreateDialog({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void; onCreate: (e: Expense) => void;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<EntryCategoryKey>("DESPESA_OUTROS");
  const [dueDate, setDueDate] = useState("");
  const [supplier, setSupplier] = useState<string>("NONE");
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState("MONTHLY");
  const [dayOfMonth, setDayOfMonth] = useState("5");
  const [endDate, setEndDate] = useState("");

  const reset = () => {
    setDescription(""); setAmount(""); setCategory("DESPESA_OUTROS");
    setDueDate(""); setSupplier("NONE"); setRecurring(false);
  };
  const canSubmit = description.trim() && amount.trim() && dueDate;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); reset(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova despesa</DialogTitle>
          <DialogDescription>Valores em decimal — sem cálculo no cliente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Descrição</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Valor</Label>
              <MoneyInput value={amount} onChange={setAmount} />
            </div>
            <div className="space-y-1">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as EntryCategoryKey)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORY_KEYS.map((k) => <SelectItem key={k} value={k}>{ENTRY_CATEGORY[k]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Vencimento</Label>
            <DateTimePicker value={dueDate} onChange={setDueDate} />
          </div>
          <div className="space-y-1">
            <Label>Fornecedor (opcional)</Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Sem fornecedor</SelectItem>
                {mockSuppliers.filter((s) => s.active).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <Label>Recorrente</Label>
              <p className="text-xs text-muted-foreground">Gera novas despesas automaticamente.</p>
            </div>
            <Switch checked={recurring} onCheckedChange={setRecurring} />
          </div>
          {recurring && (
            <div className="grid grid-cols-3 gap-3 rounded-md border border-border p-3">
              <div className="space-y-1">
                <Label className="text-xs">Frequência</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Dia do mês</Label>
                <Input type="number" min={1} max={31} value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fim (opcional)</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canSubmit} onClick={() => onCreate({
            id: "", description, amount, category, due_date: dueDate, status: "PENDENTE",
            supplier_id: supplier === "NONE" ? null : supplier, is_recurring: recurring,
          })}>Lançar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PayDialog({ expense, onClose, onPay }: {
  expense: Expense | null; onClose: () => void; onPay: (id: string, amount: string) => void;
}) {
  const [paid, setPaid] = useState("");
  const open = !!expense;
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setPaid(""); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagar despesa</DialogTitle>
          <DialogDescription>{expense?.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Valor previsto: <strong>{formatBRLFromDecimal(expense?.amount)}</strong></div>
          <div className="space-y-1">
            <Label>Valor pago (opcional — padrão = previsto)</Label>
            <MoneyInput value={paid} onChange={setPaid} placeholder={expense?.amount.replace(".", ",")} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => expense && onPay(expense.id, paid.trim() || expense.amount)}>
            Confirmar pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelDialog({ expense, onClose, onCancel }: {
  expense: Expense | null; onClose: () => void; onCancel: (id: string) => void;
}) {
  const [reason, setReason] = useState("");
  const open = !!expense;
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setReason(""); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar despesa</DialogTitle>
          <DialogDescription>Esta ação requer justificativa.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <Label>Motivo *</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explique o cancelamento" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button variant="destructive" disabled={!reason.trim()} onClick={() => expense && onCancel(expense.id)}>
            Cancelar despesa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}