import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Scale, Calculator, CheckCircle2, Lock, Unlock, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { ReconciliationBadge } from "@/components/app/fsm-badge";
import { EmptyState } from "@/components/app/empty-state";
import { MoneyInput } from "@/components/app/money-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatBRLFromDecimal, formatDateTime } from "@/lib/format";
import {
  mockAccounts, mockReconciliations, mockAccountMovements, mockCashCounts,
  accountName, type Reconciliation, type CashCount,
} from "@/lib/mock/fase3";
import {
  MOVEMENT_TYPE, CASH_COUNT_RESOLUTION, type CashCountResolution,
} from "@/lib/constants";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/financeiro/conciliacao")({
  component: ConciliacaoPage,
});

function ConciliacaoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financeiro"
        title="Conciliação"
        description="Conciliação bancária sequencial e contagem de caixa."
      />
      <Tabs defaultValue="bank">
        <TabsList>
          <TabsTrigger value="bank"><Scale size={14} strokeWidth={1.5} className="mr-1" />Conciliação bancária</TabsTrigger>
          <TabsTrigger value="cash"><Calculator size={14} strokeWidth={1.5} className="mr-1" />Contagem de caixa</TabsTrigger>
        </TabsList>
        <TabsContent value="bank" className="mt-4"><BankTab /></TabsContent>
        <TabsContent value="cash" className="mt-4"><CashTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function BankTab() {
  const [recons, setRecons] = useState<Reconciliation[]>(mockReconciliations);
  const [movs, setMovs] = useState(mockAccountMovements);
  const [acc, setAcc] = useState("");
  const [closing, setClosing] = useState(false);

  const openRecon = useMemo(() => recons.find((r) => r.account_id === acc && r.status === "OPEN"), [recons, acc]);
  const unreconciled = useMemo(() => movs.filter((m) => m.account_id === acc && !m.reconciled), [movs, acc]);

  const openReconciliation = () => {
    const newRec: Reconciliation = { id: `rec_new_${Date.now()}`, account_id: acc, status: "OPEN", opened_at: new Date().toISOString() };
    setRecons((prev) => [newRec, ...prev]);
    toast.success("Conciliação aberta");
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64 space-y-1">
            <Label className="text-xs text-muted-foreground">Conta</Label>
            <Select value={acc} onValueChange={setAcc}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {mockAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {acc && (
            <>
              {openRecon && (
                <div className="flex items-center gap-2">
                  <ReconciliationBadge status={openRecon.status} />
                  <span className="text-xs text-muted-foreground">Aberta em {formatDateTime(openRecon.opened_at)}</span>
                </div>
              )}
              {!openRecon ? (
                <Button size="sm" onClick={openReconciliation}>
                  <Unlock size={16} strokeWidth={1.5} />Abrir conciliação
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setClosing(true)}>
                  <Lock size={16} strokeWidth={1.5} />Fechar conciliação
                </Button>
              )}
              {!openRecon && (
                <TooltipProvider><Tooltip><TooltipTrigger asChild>
                  <span><Button size="sm" variant="outline" disabled><Lock size={16} strokeWidth={1.5} />Fechar</Button></span>
                </TooltipTrigger><TooltipContent>Abra uma conciliação antes</TooltipContent></Tooltip></TooltipProvider>
              )}
            </>
          )}
        </div>
      </Card>

      {!acc ? (
        <EmptyState title="Selecione uma conta" description="Escolha uma conta para começar." />
      ) : !openRecon ? (
        <EmptyState icon={<Unlock size={28} strokeWidth={1.5} />} title="Sem conciliação aberta" description="Abra uma conciliação para listar pendências." />
      ) : unreconciled.length === 0 ? (
        <EmptyState icon={<CheckCircle2 size={28} strokeWidth={1.5} />} title="Tudo conciliado" description="Você pode fechar a conciliação." />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">Data</TableHead>
                <TableHead className="w-36">Tipo</TableHead>
                <TableHead className="w-32">Valor</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unreconciled.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-muted-foreground text-xs">{formatDateTime(m.occurred_at)}</TableCell>
                  <TableCell>{MOVEMENT_TYPE[m.type]}</TableCell>
                  <TableCell>{formatBRLFromDecimal(m.amount)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{m.source}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setMovs((prev) => prev.map((x) => x.id === m.id ? { ...x, reconciled: true } : x));
                      toast.success("Movimento conciliado");
                    }}>
                      <CheckCircle2 size={16} strokeWidth={1.5} />Marcar conciliado
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={closing} onOpenChange={setClosing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fechar conciliação?</DialogTitle>
            <DialogDescription>
              Após fechar, nenhum movimento poderá ser conciliado nesta janela.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClosing(false)}>Voltar</Button>
            <Button onClick={() => {
              if (!openRecon) return;
              setRecons((prev) => prev.map((r) => r.id === openRecon.id ? { ...r, status: "CLOSED", closed_at: new Date().toISOString() } : r));
              toast.success("Conciliação fechada");
              setClosing(false);
            }}>Fechar conciliação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CashTab() {
  const { role } = useAuth();
  const canWrite = role === "OWNER" || role === "ADMIN" || role === "OPERATOR";
  const [items, setItems] = useState<CashCount[]>(mockCashCounts);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canWrite && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={16} strokeWidth={1.5} />Registrar contagem
          </Button>
        )}
      </div>

      {items.length === 0 ? <EmptyState title="Sem contagens" /> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">Data</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead className="w-32">Esperado</TableHead>
                <TableHead className="w-32">Contado</TableHead>
                <TableHead className="w-32">Divergência</TableHead>
                <TableHead className="w-36">Resolução</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => {
                const cls = c.discrepancy === "0.00"
                  ? "text-success"
                  : c.discrepancy.startsWith("-") ? "text-destructive" : "text-amber-700 dark:text-amber-300";
                return (
                  <TableRow key={c.id}>
                    <TableCell className="text-muted-foreground text-xs">{formatDateTime(c.created_at)}</TableCell>
                    <TableCell>{accountName(c.account_id)}</TableCell>
                    <TableCell>{formatBRLFromDecimal(c.expected_amount)}</TableCell>
                    <TableCell>{formatBRLFromDecimal(c.counted_amount)}</TableCell>
                    <TableCell className={cls}>{formatBRLFromDecimal(c.discrepancy)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{CASH_COUNT_RESOLUTION[c.resolution]}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{c.notes || "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <RegisterCashCount open={creating} onClose={() => setCreating(false)}
        onCreate={(c) => {
          setItems((prev) => [{ ...c, id: `cc_new_${Date.now()}`, created_at: new Date().toISOString() } as CashCount, ...prev]);
          toast.success("Contagem registrada");
          setCreating(false);
        }}
      />
    </div>
  );
}

function RegisterCashCount({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void; onCreate: (c: Partial<CashCount>) => void;
}) {
  const [acc, setAcc] = useState("");
  const [counted, setCounted] = useState("");
  const [resolution, setResolution] = useState<CashCountResolution>("NO_ADJUSTMENT");
  const [notes, setNotes] = useState("");

  // No cliente NÃO calcular discrepancy. Mock visual: enviar string vazia,
  // a API responderia com expected/discrepancy.
  const fakeExpected = "0.00";
  const fakeDisc = counted && parseFloat(counted.replace(",", ".")) !== 0 ? "—" : "0.00";
  const requiresNotes = resolution === "ADJUSTED";
  const canSubmit = acc && counted.trim() && (!requiresNotes || notes.trim());

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar contagem de caixa</DialogTitle>
          <DialogDescription>A divergência é calculada pela API.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Conta</Label>
            <Select value={acc} onValueChange={setAcc}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {mockAccounts.filter((a) => a.type === "CAIXA").map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Valor contado</Label><MoneyInput value={counted} onChange={setCounted} /></div>
          <div className="space-y-1">
            <Label>Resolução</Label>
            <RadioGroup value={resolution} onValueChange={(v) => setResolution(v as CashCountResolution)} className="flex gap-4">
              <label className="flex items-center gap-2"><RadioGroupItem value="NO_ADJUSTMENT" id="no" /><span className="text-sm">Sem ajuste</span></label>
              <label className="flex items-center gap-2"><RadioGroupItem value="ADJUSTED" id="adj" /><span className="text-sm">Com ajuste</span></label>
            </RadioGroup>
          </div>
          <div className="space-y-1">
            <Label>Notas{requiresNotes && " *"}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Justifique a divergência" />
            {requiresNotes && <p className="text-xs text-muted-foreground">Se houver divergência, a justificativa é obrigatória (422 caso ausente).</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canSubmit} onClick={() => onCreate({
            account_id: acc, counted_amount: counted, expected_amount: fakeExpected,
            discrepancy: fakeDisc === "—" ? "0.00" : "0.00", resolution, notes,
          })}>Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}