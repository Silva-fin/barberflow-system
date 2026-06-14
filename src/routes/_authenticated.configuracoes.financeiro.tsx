import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { mockDepositPolicies, type DepositPolicy } from "@/lib/mock/fase1";

export const Route = createFileRoute("/_authenticated/configuracoes/financeiro")({
  head: () => ({ meta: [{ title: "Configurações Financeiras — Paladino" }] }),
  component: FinancialSettingsPage,
});

const SERVICE_OPTIONS = ["Global", "Corte masculino", "Coloração", "Combo barba & corte", "Degradê"];

function FinancialSettingsPage() {
  const { role } = useAuth();
  if (role !== "OWNER" && role !== "ADMIN") {
    return <EmptyState title="Sem acesso" description="Apenas Proprietário e Administrador." />;
  }

  const [policies, setPolicies] = useState<DepositPolicy[]>(mockDepositPolicies);
  const [editing, setEditing] = useState<DepositPolicy | null>(null);
  const [open, setOpen] = useState(false);

  function save(p: DepositPolicy) {
    setPolicies((ps) => {
      const exists = ps.some((x) => x.id === p.id);
      return exists ? ps.map((x) => x.id === p.id ? p : x) : [...ps, p];
    });
    toast.success(editing ? "Política atualizada" : "Política criada");
    setOpen(false); setEditing(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configurações"
        title="Financeiro"
        description="Políticas de sinal aplicadas em agendamentos e cancelamentos."
      />

      <Tabs defaultValue="deposit">
        <TabsList>
          <TabsTrigger value="deposit">Políticas de sinal</TabsTrigger>
          <TabsTrigger value="fees" disabled>Taxas (em breve)</TabsTrigger>
          <TabsTrigger value="accounts" disabled>Contas (em breve)</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus size={16} strokeWidth={1.5} /> Nova política
            </Button>
          </div>

          {policies.length === 0 ? (
            <EmptyState title="Nenhuma política" description="Crie a primeira política de sinal." />
          ) : (
            <div className="rounded-md border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Janela (h)</TableHead>
                    <TableHead>Reter NO_SHOW</TableHead>
                    <TableHead className="w-32 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.serviceName ?? <span className="italic text-muted-foreground">Global</span>}</TableCell>
                      <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                      <TableCell className="font-mono">{p.type === "PERCENTAGE" ? `${p.value}%` : `R$ ${p.value}`}</TableCell>
                      <TableCell className="font-mono">{p.cancellationWindowHours}h</TableCell>
                      <TableCell><Badge variant={p.retainOnNoShow ? "default" : "outline"}>{p.retainOnNoShow ? "Sim" : "Não"}</Badge></TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}>
                            <Pencil size={16} strokeWidth={1.5} />
                          </Button>
                          <DeleteDialog onConfirm={() => { setPolicies((xs) => xs.filter((x) => x.id !== p.id)); toast.success("Política excluída"); }} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <PolicyDialog open={open} onOpenChange={setOpen} editing={editing} onSave={save} />
    </div>
  );
}

function PolicyDialog({
  open, onOpenChange, editing, onSave,
}: { open: boolean; onOpenChange: (v: boolean) => void; editing: DepositPolicy | null; onSave: (p: DepositPolicy) => void }) {
  const [service, setService] = useState<string>(editing?.serviceName ?? "Global");
  const [type, setType] = useState<DepositPolicy["type"]>(editing?.type ?? "PERCENTAGE");
  const [value, setValue] = useState<string>(editing?.value ?? "");
  const [hours, setHours] = useState<number>(editing?.cancellationWindowHours ?? 24);
  const [refundOnFault, setRefundOnFault] = useState<boolean>(editing?.refundOnTenantFault ?? true);
  const [retain, setRetain] = useState<boolean>(editing?.retainOnNoShow ?? true);
  const [commission, setCommission] = useState<boolean>(editing?.commissionOnRetainedDeposit ?? false);

  // Reset on open change
  function reset() {
    setService(editing?.serviceName ?? "Global");
    setType(editing?.type ?? "PERCENTAGE");
    setValue(editing?.value ?? "");
    setHours(editing?.cancellationWindowHours ?? 24);
    setRefundOnFault(editing?.refundOnTenantFault ?? true);
    setRetain(editing?.retainOnNoShow ?? true);
    setCommission(editing?.commissionOnRetainedDeposit ?? false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editing ? "Editar política" : "Nova política"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Serviço</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as DepositPolicy["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentual</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Valor fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>{type === "PERCENTAGE" ? "Valor (%)" : "Valor (R$)"}</Label>
              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === "PERCENTAGE" ? "30" : "50.00"} />
            </div>
            <div className="space-y-1">
              <Label>Janela de cancelamento (h)</Label>
              <Input type="number" value={hours} onChange={(e) => setHours(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div className="space-y-2 rounded-md border border-border p-3">
            <ToggleRow label="Reembolsar em caso de falha do estabelecimento" checked={refundOnFault} onChange={setRefundOnFault} />
            <ToggleRow label="Reter sinal em NO_SHOW" checked={retain} onChange={setRetain} />
            <ToggleRow label="Comissionar sinal retido" checked={commission} onChange={setCommission} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={!value.trim()} onClick={() => onSave({
            id: editing?.id ?? `dp-${Date.now()}`,
            serviceName: service === "Global" ? null : service,
            type, value,
            cancellationWindowHours: hours,
            refundOnTenantFault: refundOnFault,
            retainOnNoShow: retain,
            commissionOnRetainedDeposit: commission,
          })}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function DeleteDialog({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="ghost"><Trash2 size={16} strokeWidth={1.5} /></Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Excluir política</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); setOpen(false); }}>Excluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}