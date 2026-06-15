import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, PackagePlus, ArrowLeftRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { ActiveBadge } from "@/components/app/fsm-badge";
import { EmptyState } from "@/components/app/empty-state";
import { EmptyField } from "@/components/app/empty-field";
import { DateTimePicker } from "@/components/app/datetime-picker";
import { MoneyInput } from "@/components/app/money-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatBRLFromDecimal } from "@/lib/format";
import { mockStockProducts, mockSuppliers } from "@/lib/mock/fase3";
import { CLOSING_METHOD, type ClosingMethod } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/estoque/")({
  component: EstoquePage,
});

function EstoquePage() {
  const { role } = useAuth();
  const canWrite = role === "OWNER" || role === "ADMIN";
  const [products] = useState(mockStockProducts);
  const [receivingOpen, setReceivingOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financeiro"
        title="Estoque"
        description="Saldo, custo médio e alertas mínimos."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/estoque/movimentacoes"><ArrowLeftRight size={16} strokeWidth={1.5} />Movimentações</Link>
            </Button>
            {canWrite && (
              <Button size="sm" onClick={() => setReceivingOpen(true)}>
                <PackagePlus size={16} strokeWidth={1.5} />Receber pedido
              </Button>
            )}
          </div>
        }
      />

      {products.length === 0 ? (
        <EmptyState icon={<Package size={28} strokeWidth={1.5} />} title="Sem produtos cadastrados" />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="w-32">Qtd</TableHead>
                <TableHead className="w-32">Alerta mín</TableHead>
                <TableHead className="w-36">Custo médio</TableHead>
                <TableHead className="w-28">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const low = p.stock && p.stock_min_alert &&
                  parseFloat(p.stock) <= parseFloat(p.stock_min_alert);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        {p.name}
                        {low && (
                          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/15 text-amber-700 font-normal dark:text-amber-300">
                            Estoque baixo
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>{p.stock ? `${p.stock} ${p.unit ?? ""}` : <EmptyField />}</TableCell>
                    <TableCell className="text-muted-foreground">{p.stock_min_alert ?? <EmptyField />}</TableCell>
                    <TableCell>{p.avg_cost ? formatBRLFromDecimal(p.avg_cost) : <EmptyField />}</TableCell>
                    <TableCell><ActiveBadge active={p.active} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <ReceiveOrderDialog open={receivingOpen} onClose={() => setReceivingOpen(false)} />
    </div>
  );
}

type Item = { product_id: string; quantity: string; unit_cost: string };
type Inst = { amount: string; due_date: string };

function ReceiveOrderDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [supplier, setSupplier] = useState("NONE");
  const [items, setItems] = useState<Item[]>([{ product_id: "", quantity: "", unit_cost: "" }]);
  const [closing, setClosing] = useState<ClosingMethod>("CASH_AT_CREATION");
  const [dueDate, setDueDate] = useState("");
  const [insts, setInsts] = useState<Inst[]>([{ amount: "", due_date: "" }]);
  const [notes, setNotes] = useState("");

  const reset = () => {
    setSupplier("NONE"); setItems([{ product_id: "", quantity: "", unit_cost: "" }]);
    setClosing("CASH_AT_CREATION"); setDueDate(""); setInsts([{ amount: "", due_date: "" }]); setNotes("");
  };
  const canSubmit = items.every((i) => i.product_id && i.quantity && i.unit_cost) &&
    (closing === "CASH_AT_CREATION" ? !!dueDate : insts.every((i) => i.amount && i.due_date));

  const submit = () => {
    // Mock: API responde com total_amount + payable_id criado
    const fakeTotal = "1240.00";
    const fakePayableId = `pay_${Date.now()}`;
    toast.success("Pedido recebido — entrada registrada e conta a pagar criada", {
      description: `Total da resposta: ${formatBRLFromDecimal(fakeTotal)}`,
      action: {
        label: "Ver conta a pagar",
        onClick: () => { window.location.href = `/payables?highlight=${fakePayableId}`; },
      },
    });
    reset(); onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receber pedido</DialogTitle>
          <DialogDescription>Registra ENTRADA de estoque e cria conta a pagar automática.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          <div className="space-y-2">
            <Label>Itens</Label>
            {items.map((it, idx) => (
              <div key={idx} className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">Produto</Label>
                  <Select value={it.product_id} onValueChange={(v) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, product_id: v } : x))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {mockStockProducts.filter((p) => p.active).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-xs text-muted-foreground">Qtd</Label>
                  <Input type="number" value={it.quantity} onChange={(e) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, quantity: e.target.value } : x))} />
                </div>
                <div className="w-32 space-y-1">
                  <Label className="text-xs text-muted-foreground">Custo unit</Label>
                  <MoneyInput value={it.unit_cost} onChange={(v) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, unit_cost: v } : x))} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => setItems((arr) => arr.filter((_, i) => i !== idx))} disabled={items.length === 1}>
                  <Trash2 size={16} strokeWidth={1.5} />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setItems((arr) => [...arr, { product_id: "", quantity: "", unit_cost: "" }])}>
              <Plus size={16} strokeWidth={1.5} />Adicionar item
            </Button>
          </div>

          <div className="space-y-1">
            <Label>Fechamento</Label>
            <Select value={closing} onValueChange={(v) => setClosing(v as ClosingMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CLOSING_METHOD).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {closing === "CASH_AT_CREATION" ? (
            <div className="space-y-1">
              <Label>Vencimento</Label>
              <DateTimePicker value={dueDate} onChange={setDueDate} />
            </div>
          ) : (
            <div className="space-y-2 rounded-md border border-border p-3">
              <Label className="text-xs">Parcelas</Label>
              {insts.map((it, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <div className="w-32 space-y-1">
                    <Label className="text-xs text-muted-foreground">Valor</Label>
                    <MoneyInput value={it.amount} onChange={(v) => setInsts((arr) => arr.map((x, i) => i === idx ? { ...x, amount: v } : x))} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Vencimento</Label>
                    <Input type="date" value={it.due_date} onChange={(e) => setInsts((arr) => arr.map((x, i) => i === idx ? { ...x, due_date: e.target.value } : x))} />
                  </div>
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

          <div className="space-y-1">
            <Label>Notas (opcional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canSubmit} onClick={submit}>Receber pedido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}