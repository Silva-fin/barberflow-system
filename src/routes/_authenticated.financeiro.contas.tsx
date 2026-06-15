import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Landmark, Plus, ArrowLeftRight, Calculator, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { ActiveBadge, TransferBadge } from "@/components/app/fsm-badge";
import { EmptyState } from "@/components/app/empty-state";
import { MoneyInput } from "@/components/app/money-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import {
  mockAccounts, accountBalance, mockTransfers, mockAccountMovements,
  mockFinancialSettings, accountName, type Account,
} from "@/lib/mock/fase3";
import { ACCOUNT_TYPE, MOVEMENT_TYPE, type AccountType } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/financeiro/contas")({
  component: ContasPage,
});

function ContasPage() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [transfers, setTransfers] = useState(mockTransfers);
  const [creating, setCreating] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [adjusting, setAdjusting] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financeiro"
        title="Contas"
        description={`Provedor: ${mockFinancialSettings.provider} · ${mockFinancialSettings.accounts_count} contas`}
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={16} strokeWidth={1.5} />Nova conta
          </Button>
        }
      />

      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts"><Landmark size={14} strokeWidth={1.5} className="mr-1" />Contas</TabsTrigger>
          <TabsTrigger value="transfers"><ArrowLeftRight size={14} strokeWidth={1.5} className="mr-1" />Transferências</TabsTrigger>
          <TabsTrigger value="movements"><Wallet size={14} strokeWidth={1.5} className="mr-1" />Movimentos</TabsTrigger>
          <TabsTrigger value="adjustment"><Calculator size={14} strokeWidth={1.5} className="mr-1" />Ajuste manual</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((a) => (
              <Card key={a.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{ACCOUNT_TYPE[a.type]}</p>
                    <h3 className="mt-1 font-display text-xl">{a.name}</h3>
                    {(a.provider || a.external_ref) && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.provider}{a.external_ref ? ` · ${a.external_ref}` : ""}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <ActiveBadge active={a.status === "ACTIVE"} />
                    {a.is_default_inflow && (
                      <Badge variant="outline" className="font-normal border-sidebar-primary/40 bg-sidebar-primary/15 text-sidebar-primary">Padrão</Badge>
                    )}
                  </div>
                </div>
                <p className="mt-4 font-display text-3xl text-foreground">
                  {formatBRLFromDecimal(accountBalance[a.id])}
                </p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transfers" className="mt-4">
          <div className="mb-3 flex justify-end">
            <Button size="sm" onClick={() => setTransferring(true)}>
              <ArrowLeftRight size={16} strokeWidth={1.5} />Transferir
            </Button>
          </div>
          {transfers.length === 0 ? (
            <EmptyState title="Sem transferências" />
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origem → Destino</TableHead>
                    <TableHead className="w-32">Valor</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                    <TableHead className="w-44">Solicitada</TableHead>
                    <TableHead className="w-44">Concluída / Falha</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{accountName(t.from_account_id)} → {accountName(t.to_account_id)}</TableCell>
                      <TableCell>{formatBRLFromDecimal(t.amount)}</TableCell>
                      <TableCell><TransferBadge status={t.status} /></TableCell>
                      <TableCell className="text-muted-foreground text-xs">{formatDateTime(t.requested_at)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{t.completed_at ? formatDateTime(t.completed_at) : "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{t.failure_reason || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="movements" className="mt-4">
          <MovementsTab />
        </TabsContent>

        <TabsContent value="adjustment" className="mt-4">
          <Card className="p-6 text-center">
            <Calculator size={28} strokeWidth={1.5} className="mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-display text-lg">Ajuste manual</h3>
            <p className="mt-1 text-sm text-muted-foreground">Lançamento sensível — exige confirmação dupla.</p>
            <Button className="mt-4" onClick={() => setAdjusting(true)}>Abrir Dialog de ajuste</Button>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateAccountDialog open={creating} onClose={() => setCreating(false)}
        onCreate={(a) => {
          setAccounts((prev) => [{ ...a, id: `acc_new_${Date.now()}`, status: "ACTIVE" } as Account, ...prev]);
          toast.success("Conta criada");
          setCreating(false);
        }}
      />

      <TransferDialog open={transferring} onClose={() => setTransferring(false)}
        onTransfer={(t) => {
          setTransfers((prev) => [{ ...t, id: `tr_new_${Date.now()}`, status: "REQUESTED", requested_at: new Date().toISOString() }, ...prev]);
          toast.success("Transferência solicitada");
          setTransferring(false);
        }}
      />

      <AdjustmentDialog open={adjusting} onClose={() => setAdjusting(false)} />
    </div>
  );
}

function MovementsTab() {
  const [acc, setAcc] = useState("ALL");
  const filtered = mockAccountMovements.filter((m) => acc === "ALL" || m.account_id === acc);
  return (
    <div className="space-y-3">
      <div className="w-64">
        <Label className="text-xs text-muted-foreground">Conta</Label>
        <Select value={acc} onValueChange={setAcc}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            {mockAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? <EmptyState title="Sem movimentos" /> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">Data</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead className="w-36">Tipo</TableHead>
                <TableHead className="w-32">Valor</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-muted-foreground text-xs">{formatDateTime(m.occurred_at)}</TableCell>
                  <TableCell>{accountName(m.account_id)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{MOVEMENT_TYPE[m.type]}</TableCell>
                  <TableCell>{formatBRLFromDecimal(m.amount)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{m.source || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function CreateAccountDialog({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void; onCreate: (a: Partial<Account>) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("BANK");
  const [provider, setProvider] = useState("");
  const [ref, setRef] = useState("");
  const [def, setDef] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova conta</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ACCOUNT_TYPE).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Provider</Label><Input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Stone, Itaú..." /></div>
            <div className="space-y-1"><Label>Ref. externa</Label><Input value={ref} onChange={(e) => setRef(e.target.value)} /></div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <Label>Conta padrão de entrada</Label>
            <Switch checked={def} onCheckedChange={setDef} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!name.trim()} onClick={() => onCreate({ name, type, provider, external_ref: ref, is_default_inflow: def })}>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TransferDialog({ open, onClose, onTransfer }: {
  open: boolean; onClose: () => void;
  onTransfer: (t: { from_account_id: string; to_account_id: string; amount: string; notes?: string }) => void;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const sameAccount = from && to && from === to;
  const canSubmit = from && to && !sameAccount && amount.trim();
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferir entre contas</DialogTitle>
          <DialogDescription>Origem e destino devem ser diferentes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Origem</Label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {mockAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Destino</Label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {mockAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {sameAccount && <p className="text-xs text-destructive">Contas iguais: a API retornará 422.</p>}
          <div className="space-y-1"><Label>Valor</Label><MoneyInput value={amount} onChange={setAmount} /></div>
          <div className="space-y-1"><Label>Notas</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canSubmit} onClick={() => onTransfer({ from_account_id: from, to_account_id: to, amount, notes })}>
            Solicitar transferência
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdjustmentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [dir, setDir] = useState<"ADDS" | "SUBTRACTS">("ADDS");
  const [acc, setAcc] = useState("");
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);
  const canSubmit = amount.trim() && acc && reason.trim() && confirm;
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setConfirm(false); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajuste manual</DialogTitle>
          <DialogDescription>Operação sensível — gravada como Entry AJUSTE.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Valor</Label><MoneyInput value={amount} onChange={setAmount} /></div>
          <div className="space-y-1">
            <Label>Direção</Label>
            <RadioGroup value={dir} onValueChange={(v) => setDir(v as any)} className="flex gap-4">
              <label className="flex items-center gap-2"><RadioGroupItem value="ADDS" id="adds" /><span className="text-sm">Entrada</span></label>
              <label className="flex items-center gap-2"><RadioGroupItem value="SUBTRACTS" id="subs" /><span className="text-sm">Saída</span></label>
            </RadioGroup>
          </div>
          <div className="space-y-1">
            <Label>Conta</Label>
            <Select value={acc} onValueChange={setAcc}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {mockAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Motivo *</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></div>
          <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <Label className="text-xs">Confirmo que este ajuste é definitivo</Label>
            <Switch checked={confirm} onCheckedChange={setConfirm} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" disabled={!canSubmit} onClick={() => {
            toast.success("Ajuste manual registrado");
            onClose(); setConfirm(false);
          }}>Confirmar ajuste</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}