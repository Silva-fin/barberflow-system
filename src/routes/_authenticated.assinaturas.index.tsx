import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { EmptyField } from "@/components/app/empty-field";
import { SubscriptionBadge } from "@/components/app/fsm-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CustomerAutocomplete, type CustomerOption } from "@/components/app/customer-autocomplete";
import { DateTimePicker } from "@/components/app/datetime-picker";
import { formatDateTime } from "@/lib/format";
import {
  mockSubscriptions, mockSubscriptionPlans,
  type Subscription, type SubscriptionStatus,
} from "@/lib/mock/fase2";

export const Route = createFileRoute("/_authenticated/assinaturas/")({
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const [rows, setRows] = useState<Subscription[]>(mockSubscriptions);
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState<Subscription | null>(null);

  const filtered = useMemo(() => rows.filter((r) =>
    (status === "ALL" || r.status === status) &&
    (!q.trim() || r.customer_name.toLowerCase().includes(q.toLowerCase())),
  ), [rows, status, q]);

  const setStatusOf = (id: string, s: SubscriptionStatus, msg: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: s } : r)));
    toast.success(msg);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assinaturas"
        title="Instâncias"
        description="Assinaturas ativas, pausadas e em cobrança."
        actions={<Button size="sm" onClick={() => setCreating(true)}><Plus size={16} strokeWidth={1.5} />Nova assinatura</Button>}
      />
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input placeholder="Buscar cliente…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="ACTIVE">Ativa</SelectItem>
              <SelectItem value="PAUSED">Pausada</SelectItem>
              <SelectItem value="OVERDUE">Em atraso</SelectItem>
              <SelectItem value="SUSPENDED">Suspensa</SelectItem>
              <SelectItem value="CANCELLED">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-48">Próx. cobrança</TableHead>
              <TableHead className="w-48">Em atraso desde</TableHead>
              <TableHead className="w-44 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.customer_name}</TableCell>
                <TableCell>{r.plan_name}</TableCell>
                <TableCell><SubscriptionBadge status={r.status} /></TableCell>
                <TableCell>{r.next_billing_at ? formatDateTime(r.next_billing_at) : <EmptyField label="—" />}</TableCell>
                <TableCell>{r.overdue_since ? formatDateTime(r.overdue_since) : <EmptyField label="—" />}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {r.status === "ACTIVE" && (
                      <Button size="sm" variant="outline" onClick={() => setStatusOf(r.id, "PAUSED", "Assinatura pausada")}>
                        <Pause size={16} strokeWidth={1.5} />Pausar
                      </Button>
                    )}
                    {r.status === "PAUSED" && (
                      <Button size="sm" variant="outline" onClick={() => setStatusOf(r.id, "ACTIVE", "Assinatura retomada")}>
                        <Play size={16} strokeWidth={1.5} />Retomar
                      </Button>
                    )}
                    {(r.status === "ACTIVE" || r.status === "PAUSED" || r.status === "OVERDUE") && (
                      <Button size="sm" variant="ghost" onClick={() => setCancelling(r)}>
                        <X size={16} strokeWidth={1.5} />Cancelar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <NewSubscriptionDialog
        open={creating}
        onOpenChange={setCreating}
        onSubmit={(d) => {
          setRows((prev) => [...prev, {
            id: `sub-${Date.now()}`,
            customer_id: d.customer.id,
            customer_name: d.customer.name,
            plan_id: d.planId,
            plan_name: mockSubscriptionPlans.find((p) => p.id === d.planId)?.name ?? "—",
            status: "ACTIVE",
            next_billing_at: d.firstBillingAt || null,
            overdue_since: null,
          }]);
          toast.success("Assinatura criada");
          setCreating(false);
        }}
      />

      <AlertDialog open={!!cancelling} onOpenChange={(o) => !o && setCancelling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
            <AlertDialogDescription>
              A assinatura ficará cancelada e não gerará novas cobranças.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!cancelling) return;
              setStatusOf(cancelling.id, "CANCELLED", "Assinatura cancelada");
              setCancelling(null);
            }}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NewSubscriptionDialog({
  open, onOpenChange, onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (d: { customer: CustomerOption; planId: string; firstBillingAt: string }) => void;
}) {
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [planId, setPlanId] = useState("");
  const [firstBillingAt, setFirstBillingAt] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova assinatura</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label className="text-xs">Cliente</Label>
            <CustomerAutocomplete value={customer} onChange={setCustomer} />
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Plano</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger><SelectValue placeholder="Selecionar…" /></SelectTrigger>
              <SelectContent>
                {mockSubscriptionPlans.filter((p) => p.is_active).map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DateTimePicker label="Primeira cobrança (opc)" value={firstBillingAt} onChange={setFirstBillingAt} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={!customer || !planId} onClick={() => customer && onSubmit({ customer, planId, firstBillingAt })}>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}