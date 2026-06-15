import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Plus, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatBRLFromDecimal, formatDateTime } from "@/lib/format";
import { mockStockMovements, mockStockProducts, productName, type StockMovement } from "@/lib/mock/fase3";
import { STOCK_MOVEMENT_TYPE, type StockMovementType } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/estoque/movimentacoes")({
  component: MovimentacoesPage,
});

const TYPE_CLASS: Record<StockMovementType, string> = {
  ENTRADA: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  VENDA: "border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-300",
  USO_INTERNO: "border-border bg-muted text-muted-foreground",
  PERDA: "border-destructive/30 bg-destructive/15 text-destructive",
  AJUSTE: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

function MovimentacoesPage() {
  const { role } = useAuth();
  const canWrite = role === "OWNER" || role === "ADMIN";
  const [items, setItems] = useState<StockMovement[]>(mockStockMovements);
  const [product, setProduct] = useState("ALL");
  const [type, setType] = useState<"ALL" | StockMovementType>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => items.filter((m) => {
    if (product !== "ALL" && m.product_id !== product) return false;
    if (type !== "ALL" && m.movement_type !== type) return false;
    if (from && m.occurred_at < from) return false;
    if (to && m.occurred_at > to) return false;
    return true;
  }), [items, product, type, from, to]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Estoque"
        title="Movimentações"
        description="Histórico de entradas, vendas, usos internos, perdas e ajustes."
        actions={canWrite && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={16} strokeWidth={1.5} />Registrar movimento
          </Button>
        )}
      />

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Produto</Label>
            <Select value={product} onValueChange={setProduct}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {mockStockProducts.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {Object.entries(STOCK_MOVEMENT_TYPE).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">De</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Até</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<ArrowLeftRight size={28} strokeWidth={1.5} />} title="Sem movimentações" />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="w-32">Tipo</TableHead>
                <TableHead className="w-28">Quantidade</TableHead>
                <TableHead className="w-32">Custo unit</TableHead>
                <TableHead className="w-32">Origem</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                const neg = m.movement_type === "VENDA" || m.movement_type === "USO_INTERNO" || m.movement_type === "PERDA" || m.quantity.startsWith("-");
                return (
                  <TableRow key={m.id}>
                    <TableCell className="text-muted-foreground">{formatDateTime(m.occurred_at)}</TableCell>
                    <TableCell className="font-medium">{productName(m.product_id)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-normal ${TYPE_CLASS[m.movement_type]}`}>
                        {STOCK_MOVEMENT_TYPE[m.movement_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`flex items-center gap-1 ${neg ? "text-destructive" : "text-success"}`}>
                        {neg ? <ArrowDown size={14} strokeWidth={1.5} /> : <ArrowUp size={14} strokeWidth={1.5} />}
                        {m.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{m.unit_cost ? formatBRLFromDecimal(m.unit_cost) : "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{m.source_type ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{m.notes ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <RegisterDialog open={creating} onClose={() => setCreating(false)}
        onCreate={(m) => {
          setItems((prev) => [{ ...m, id: `mv_new_${Date.now()}`, occurred_at: new Date().toISOString() }, ...prev]);
          toast.success("Movimento registrado");
          setCreating(false);
        }}
      />
    </div>
  );
}

function RegisterDialog({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void; onCreate: (m: StockMovement) => void;
}) {
  const [pid, setPid] = useState("");
  const [t, setT] = useState<Exclude<StockMovementType, "ENTRADA">>("VENDA");
  const [qty, setQty] = useState("");
  const [notes, setNotes] = useState("");

  const reset = () => { setPid(""); setT("VENDA"); setQty(""); setNotes(""); };
  const requiresNotes = t === "AJUSTE";
  const canSubmit = pid && qty && (!requiresNotes || notes.trim());

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar movimento</DialogTitle>
          <DialogDescription>ENTRADA só via "Receber pedido".</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Produto</Label>
            <Select value={pid} onValueChange={setPid}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {mockStockProducts.filter((p) => p.active).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Tipo</Label>
            <Select value={t} onValueChange={(v) => setT(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VENDA">{STOCK_MOVEMENT_TYPE.VENDA}</SelectItem>
                <SelectItem value="USO_INTERNO">{STOCK_MOVEMENT_TYPE.USO_INTERNO}</SelectItem>
                <SelectItem value="PERDA">{STOCK_MOVEMENT_TYPE.PERDA}</SelectItem>
                <SelectItem value="AJUSTE">{STOCK_MOVEMENT_TYPE.AJUSTE}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Quantidade</Label>
            <Input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Use sinal negativo para AJUSTE de saída" />
          </div>
          <div className="space-y-1">
            <Label>Notas{requiresNotes && " *"}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            {requiresNotes && <p className="text-xs text-muted-foreground">Obrigatório para AJUSTE.</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canSubmit} onClick={() => onCreate({
            id: "", product_id: pid, movement_type: t, quantity: qty,
            unit_cost: null, occurred_at: "", notes: notes || null, source_type: "MANUAL",
          })}>Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}