import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatBRLFromDecimal } from "@/lib/format";
import {
  mockSubscriptionPlans, mockServices, lookupServiceName,
  type SubscriptionPlan,
} from "@/lib/mock/fase2";

export const Route = createFileRoute("/_authenticated/assinaturas/planos")({
  component: SubscriptionPlansPage,
});

function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(mockSubscriptionPlans);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assinaturas"
        title="Planos"
        description="Configure planos recorrentes."
        actions={<Button size="sm" onClick={() => setCreating(true)}><Plus size={16} strokeWidth={1.5} />Novo plano</Button>}
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead className="w-28">Cotas/ciclo</TableHead>
              <TableHead className="w-32">Preço</TableHead>
              <TableHead className="w-24">Ciclo</TableHead>
              <TableHead className="w-24">Rollover</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-32 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{lookupServiceName(p.service_id)}</TableCell>
                <TableCell>{p.cotas_per_cycle}</TableCell>
                <TableCell>{formatBRLFromDecimal(p.price)}</TableCell>
                <TableCell>{p.cycle_days} dias</TableCell>
                <TableCell><Badge variant="outline">{p.rollover_enabled ? "Sim" : "Não"}</Badge></TableCell>
                <TableCell>
                  {p.is_active ? <Badge variant="outline">Ativo</Badge> : <Badge variant="outline" className="bg-muted text-muted-foreground">Inativo</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(p)}><Pencil size={16} strokeWidth={1.5} /></Button>
                    {p.is_active && (
                      <Button size="icon" variant="ghost" onClick={() => {
                        setPlans((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: false } : x)));
                        toast.success("Plano desativado");
                      }}><PowerOff size={16} strokeWidth={1.5} /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <PlanDialog
        open={creating || !!editing}
        initial={editing}
        onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}
        onSubmit={(d) => {
          if (editing) {
            setPlans((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...d } : x)));
            toast.success("Plano atualizado");
          } else {
            setPlans((prev) => [...prev, { id: `sp-${Date.now()}`, ...d }]);
            toast.success("Plano criado");
          }
          setCreating(false); setEditing(null);
        }}
      />
    </div>
  );
}

function PlanDialog({
  open, onOpenChange, initial, onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: SubscriptionPlan | null;
  onSubmit: (d: Omit<SubscriptionPlan, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [cotas, setCotas] = useState(1);
  const [price, setPrice] = useState("");
  const [cycle, setCycle] = useState(30);
  const [rollover, setRollover] = useState(false);
  const [serviceId, setServiceId] = useState("__generic");
  const [active, setActive] = useState(true);

  useEffect(() => {
    setName(initial?.name ?? "");
    setCotas(initial?.cotas_per_cycle ?? 1);
    setPrice(initial?.price ?? "");
    setCycle(initial?.cycle_days ?? 30);
    setRollover(initial?.rollover_enabled ?? false);
    setServiceId(initial?.service_id ?? "__generic");
    setActive(initial?.is_active ?? true);
  }, [initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial ? "Editar plano" : "Novo plano de assinatura"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label className="text-xs">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">Cotas/ciclo</Label>
              <Input type="number" min={1} value={cotas} onChange={(e) => setCotas(parseInt(e.target.value || "1", 10))} />
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Preço</Label>
              <Input placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Ciclo (dias)</Label>
              <Input type="number" min={1} value={cycle} onChange={(e) => setCycle(parseInt(e.target.value || "30", 10))} />
            </div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Serviço</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__generic">Genérico</SelectItem>
                {mockServices.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label className="text-sm">Rollover habilitado</Label>
            <Switch checked={rollover} onCheckedChange={setRollover} />
          </div>
          {initial && (
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <Label className="text-sm">Ativo</Label>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            disabled={!name.trim() || !price.trim()}
            onClick={() => onSubmit({
              name: name.trim(),
              cotas_per_cycle: cotas,
              price,
              cycle_days: cycle,
              rollover_enabled: rollover,
              service_id: serviceId === "__generic" ? null : serviceId,
              is_active: active,
            })}
          >Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}