import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  mockGeneralCommissionRule, mockSpecificRules, mockBarbers, mockServices,
  type CommissionBase, type CommissionPayer, type SpecificCommissionRule,
} from "@/lib/mock/fase-reskin";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/comissoes/regras")({
  head: () => ({ meta: [{ title: "Regras de comissão — Paladino" }] }),
  component: RegrasPage,
});

const PAYER_LABEL: Record<CommissionPayer, string> = {
  SHOP: "Barbearia paga", SPLIT: "Dividida 50/50", BARBER: "Barbeiro paga",
};
const BASE_LABEL: Record<CommissionBase, string> = {
  PERCENT: "Percentual sobre valor bruto", FIXED: "Valor fixo (R$)",
};

function RegrasPage() {
  const [base, setBase] = useState<CommissionBase>(mockGeneralCommissionRule.base);
  const [rate, setRate] = useState(String(mockGeneralCommissionRule.ratePct));
  const [payer, setPayer] = useState<CommissionPayer>(mockGeneralCommissionRule.payer);

  const [rules, setRules] = useState<SpecificCommissionRule[]>(mockSpecificRules);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Comissões"
        title="Regras de comissão"
        description="Como calculamos o valor pago à equipe a cada venda."
      />

      <Card>
        <CardHeader><CardTitle className="font-display text-lg">Regra geral</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[2fr_1fr_2fr_auto]">
          <div className="space-y-1">
            <Label>Base de cálculo</Label>
            <Select value={base} onValueChange={(v) => setBase(v as CommissionBase)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENT">{BASE_LABEL.PERCENT}</SelectItem>
                <SelectItem value="FIXED">{BASE_LABEL.FIXED}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{base === "PERCENT" ? "Taxa (%)" : "Valor (R$)"}</Label>
            <Input value={rate} onChange={e => setRate(e.target.value)} inputMode="decimal" />
          </div>
          <div className="space-y-1">
            <Label>Quem paga a taxa</Label>
            <Select value={payer} onValueChange={(v) => setPayer(v as CommissionPayer)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SHOP">Barbearia paga</SelectItem>
                <SelectItem value="SPLIT">Dividida 50/50</SelectItem>
                <SelectItem value="BARBER">Barbeiro paga</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={() => toast.success("Regra geral salva")}>Salvar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg">Regras específicas</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus size={14} strokeWidth={1.5} className="mr-1" />Nova regra
              </Button>
            </DialogTrigger>
            <NovaRegraDialog
              onCancel={() => setDialogOpen(false)}
              onSave={() => { setDialogOpen(false); toast.success("Regra criada"); }}
            />
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-muted-foreground">
                  <TableHead>Profissional</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Base</TableHead>
                  <TableHead className="text-right">Taxa</TableHead>
                  <TableHead>Quando</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm italic text-muted-foreground">
                      Nenhuma regra específica cadastrada
                    </TableCell>
                  </TableRow>
                ) : rules.map(r => (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell>{r.professionalName}</TableCell>
                    <TableCell>{r.serviceName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{BASE_LABEL[r.base]}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.base === "PERCENT" ? `${r.ratePct}%` : formatBRL(r.fixedCents)}
                    </TableCell>
                    <TableCell className="text-xs">{PAYER_LABEL[r.payer]}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil size={14} strokeWidth={1.5} />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setToDelete(r.id)}
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir regra de comissão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A regra deixará de valer para novas vendas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setRules(prev => prev.filter(r => r.id !== toDelete));
                setToDelete(null);
                toast.success("Regra excluída");
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NovaRegraDialog({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  const [professional, setProfessional] = useState("ALL");
  const [service, setService] = useState("ALL");
  const [base, setBase] = useState<CommissionBase>("PERCENT");
  const [value, setValue] = useState("");
  const [payer, setPayer] = useState<CommissionPayer>("SHOP");
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Nova regra específica</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Profissional</Label>
          <Select value={professional} onValueChange={setProfessional}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os barbeiros</SelectItem>
              {mockBarbers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Serviço</Label>
          <Select value={service} onValueChange={setService}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os serviços</SelectItem>
              {mockServices.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Base</Label>
            <Select value={base} onValueChange={(v) => setBase(v as CommissionBase)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENT">Percentual</SelectItem>
                <SelectItem value="FIXED">Valor fixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{base === "PERCENT" ? "Taxa (%)" : "Valor (R$)"}</Label>
            <Input value={value} onChange={e => setValue(e.target.value)} inputMode="decimal" />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Quem paga</Label>
          <Select value={payer} onValueChange={(v) => setPayer(v as CommissionPayer)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SHOP">Barbearia paga</SelectItem>
              <SelectItem value="SPLIT">Dividida 50/50</SelectItem>
              <SelectItem value="BARBER">Barbeiro paga</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSave}>Criar</Button>
      </DialogFooter>
    </DialogContent>
  );
}