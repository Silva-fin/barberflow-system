import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatBRLFromDecimal } from "@/lib/format";
import {
  mockPackagePlans, mockServices, lookupServiceName,
  type PackagePlan, type PackagePurchase,
} from "@/lib/mock/fase2";
import { PAYMENT_METHOD_OPTIONS, type PaymentMethodValue } from "@/lib/constants";
import { CustomerAutocomplete, type CustomerOption } from "@/components/app/customer-autocomplete";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/pacotes/")({
  component: PackagePlansPage,
});

function PackagePlansPage() {
  const { role } = useAuth();
  const canWrite = role === "OWNER" || role === "ADMIN";
  const canSell = canWrite || role === "OPERATOR";
  const [plans, setPlans] = useState<PackagePlan[]>(mockPackagePlans);
  const [editing, setEditing] = useState<PackagePlan | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<PackagePlan | null>(null);
  const [selling, setSelling] = useState<PackagePlan | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Comercial"
        title="Pacotes"
        description="Planos de pacote para venda avulsa."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/pacotes/compras">Histórico</Link></Button>
            {canWrite && <Button size="sm" onClick={() => setCreating(true)}><Plus size={16} strokeWidth={1.5} />Novo plano</Button>}
          </div>
        }
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead className="w-20">Cotas</TableHead>
              <TableHead className="w-32">Preço</TableHead>
              <TableHead className="w-32">Validade</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-44 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{lookupServiceName(p.service_id)}</TableCell>
                <TableCell>{p.total_cotas}</TableCell>
                <TableCell>{formatBRLFromDecimal(p.price)}</TableCell>
                <TableCell>{p.validity_days ? `${p.validity_days} dias` : "Sem validade"}</TableCell>
                <TableCell>
                  {p.is_active ? <Badge variant="outline">Ativo</Badge> : <Badge variant="outline" className="bg-muted text-muted-foreground">Inativo</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {canSell && (
                      <Button size="sm" variant="outline" onClick={() => setSelling(p)} disabled={!p.is_active}>
                        <ShoppingCart size={16} strokeWidth={1.5} />Vender
                      </Button>
                    )}
                    {canWrite && (
                      <>
                        <Button size="icon" variant="ghost" onClick={() => setEditing(p)}><Pencil size={16} strokeWidth={1.5} /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleting(p)}><Trash2 size={16} strokeWidth={1.5} /></Button>
                      </>
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
            setPlans((prev) => [...prev, { id: `pkg-${Date.now()}`, is_active: true, ...d }]);
            toast.success("Plano criado");
          }
          setCreating(false); setEditing(null);
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir plano?</AlertDialogTitle>
            <AlertDialogDescription>Compras existentes mantêm a referência ao plano.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!deleting) return;
              setPlans((prev) => prev.filter((x) => x.id !== deleting.id));
              toast.success("Plano excluído");
              setDeleting(null);
            }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SellPackageDialog
        plan={selling}
        onClose={() => setSelling(null)}
      />
    </div>
  );
}

function PlanDialog({
  open, onOpenChange, initial, onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: PackagePlan | null;
  onSubmit: (d: Omit<PackagePlan, "id" | "is_active"> & { is_active?: boolean }) => void;
}) {
  const [name, setName] = useState("");
  const [cotas, setCotas] = useState(1);
  const [price, setPrice] = useState("");
  const [serviceId, setServiceId] = useState<string>("__generic");
  const [validity, setValidity] = useState<string>("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    setName(initial?.name ?? "");
    setCotas(initial?.total_cotas ?? 1);
    setPrice(initial?.price ?? "");
    setServiceId(initial?.service_id ?? "__generic");
    setValidity(initial?.validity_days?.toString() ?? "");
    setActive(initial?.is_active ?? true);
  }, [initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial ? "Editar plano" : "Novo plano de pacote"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label className="text-xs">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">Cotas</Label>
              <Input type="number" min={1} value={cotas} onChange={(e) => setCotas(parseInt(e.target.value || "1", 10))} />
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Preço</Label>
              <Input placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">Serviço</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__generic">Genérico</SelectItem>
                  {mockServices.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Validade (dias, opc)</Label>
              <Input type="number" min={1} value={validity} onChange={(e) => setValidity(e.target.value)} />
            </div>
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
            disabled={!name.trim() || !price.trim() || cotas <= 0}
            onClick={() => onSubmit({
              name: name.trim(),
              total_cotas: cotas,
              price,
              service_id: serviceId === "__generic" ? null : serviceId,
              validity_days: validity ? parseInt(validity, 10) : null,
              is_active: active,
            })}
          >Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SellPackageDialog({ plan, onClose }: { plan: PackagePlan | null; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [method, setMethod] = useState<PaymentMethodValue | "">("");

  useEffect(() => {
    if (plan) { setStep(1); setCustomer(null); setMethod(""); }
  }, [plan]);

  const submit = () => {
    if (!plan || !customer || !method) return;
    const purchase: PackagePurchase = {
      id: `pp-${Date.now()}`,
      created_at: new Date().toISOString(),
      customer_id: customer.id,
      customer_name: customer.name,
      plan_id: plan.id,
      plan_name: plan.name,
      total_price: plan.price,
      status: "PENDING_PAYMENT",
      payment_id: `pay-${Date.now()}`,
    };
    // local mock — not persisted globally; only toast feedback
    void purchase;
    toast.success("Pacote vendido — pagamento pendente de confirmação");
    onClose();
  };

  return (
    <Dialog open={!!plan} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vender pacote</DialogTitle>
          <DialogDescription>{plan?.name}</DialogDescription>
        </DialogHeader>
        <ol className="mb-2 flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {["Cliente", "Plano", "Pagamento", "Confirmar"].map((s, i) => (
            <li key={s} className={"flex items-center gap-1 " + (step === i + 1 ? "text-foreground" : "")}>
              <span>{i + 1}. {s}</span>
              {i < 3 && <span className="opacity-40">·</span>}
            </li>
          ))}
        </ol>

        {step === 1 && (
          <div className="space-y-2">
            <Label className="text-xs">Cliente</Label>
            <CustomerAutocomplete value={customer} onChange={setCustomer} />
          </div>
        )}
        {step === 2 && plan && (
          <Card className="space-y-2 p-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Plano</span><span>{plan.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Cotas</span><span>{plan.total_cotas}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Validade</span><span>{plan.validity_days ? `${plan.validity_days} dias` : "Sem validade"}</span></div>
            <div className="flex justify-between border-t border-border pt-2 font-medium"><span>Total</span><span>{formatBRLFromDecimal(plan.price)}</span></div>
          </Card>
        )}
        {step === 3 && (
          <RadioGroup value={method} onValueChange={(v) => setMethod(v as PaymentMethodValue)} className="space-y-3">
            {PAYMENT_METHOD_OPTIONS.map((g) => (
              <div key={g.group}>
                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{g.group}</p>
                <div className="space-y-1">
                  {g.options.map((o) => (
                    <Label key={o.value} className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                      <RadioGroupItem value={o.value} />
                      {o.label}
                    </Label>
                  ))}
                </div>
              </div>
            ))}
          </RadioGroup>
        )}
        {step === 4 && plan && (
          <Card className="space-y-2 p-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span>{customer?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Plano</span><span>{plan.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pagamento</span><span>{method}</span></div>
            <div className="flex justify-between border-t border-border pt-2 font-medium"><span>Total</span><span>{formatBRLFromDecimal(plan.price)}</span></div>
            <p className="pt-2 text-xs text-muted-foreground">A venda cria a compra como pagamento pendente; confirme no módulo de pagamentos.</p>
          </Card>
        )}

        <DialogFooter className="gap-2">
          {step > 1 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Voltar</Button>}
          {step < 4 ? (
            <Button
              disabled={(step === 1 && !customer) || (step === 3 && !method)}
              onClick={() => setStep(step + 1)}
            >Próximo</Button>
          ) : (
            <Button onClick={submit}>Confirmar venda</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}