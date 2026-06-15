import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Pause, Play, Plus, Tags, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { PromotionBadge } from "@/components/app/fsm-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/app/datetime-picker";
import {
  DISCOUNT_TYPE, APPLICATION_MODE,
  type DiscountType, type ApplicationMode,
} from "@/lib/constants";
import { formatBRLFromDecimal, formatDateTime } from "@/lib/format";
import { mockPromotions, type Promotion, type PromotionStatus } from "@/lib/mock/fase2";

export const Route = createFileRoute("/_authenticated/promocoes/")({
  component: PromotionsPage,
});

function PromotionsPage() {
  const [rows, setRows] = useState<Promotion[]>(mockPromotions);
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState<Promotion | null>(null);

  const setStatus = (id: string, s: PromotionStatus, msg: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: s } : r)));
    toast.success(msg);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Comercial"
        title="Promoções"
        description="Regras de desconto e cupons."
        actions={<Button size="sm" onClick={() => setCreating(true)}><Plus size={16} strokeWidth={1.5} />Nova promoção</Button>}
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="w-32">Tipo</TableHead>
              <TableHead className="w-28">Valor</TableHead>
              <TableHead className="w-32">Modo</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-56">Vigência</TableHead>
              <TableHead className="w-24">Usos</TableHead>
              <TableHead className="w-56 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{DISCOUNT_TYPE[p.discount_type]}</TableCell>
                <TableCell>{renderValue(p)}</TableCell>
                <TableCell className="text-muted-foreground">{APPLICATION_MODE[p.application_mode]}</TableCell>
                <TableCell><PromotionBadge status={p.status} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDateTime(p.valid_from)}<br />→ {formatDateTime(p.valid_until)}
                </TableCell>
                <TableCell>{p.uses_count}{p.max_uses != null ? `/${p.max_uses}` : ""}</TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {(p.status === "DRAFT" || p.status === "PAUSED") && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "ACTIVE", "Promoção ativada")}>
                        <Play size={16} strokeWidth={1.5} />Ativar
                      </Button>
                    )}
                    {p.status === "ACTIVE" && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "PAUSED", "Promoção pausada")}>
                        <Pause size={16} strokeWidth={1.5} />Pausar
                      </Button>
                    )}
                    {(p.status === "DRAFT" || p.status === "ACTIVE" || p.status === "PAUSED") && (
                      <Button size="sm" variant="ghost" onClick={() => setCancelling(p)}>
                        <X size={16} strokeWidth={1.5} />Cancelar
                      </Button>
                    )}
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/promocoes/$id/cupons" params={{ id: p.id }}>
                        <Tags size={16} strokeWidth={1.5} />Cupons
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <PromotionDialog
        open={creating}
        onOpenChange={setCreating}
        onSubmit={(p) => {
          setRows((prev) => [...prev, { ...p, id: `promo-${Date.now()}`, uses_count: 0, status: "DRAFT", conditions: {} }]);
          toast.success("Promoção criada");
          setCreating(false);
        }}
      />

      <AlertDialog open={!!cancelling} onOpenChange={(o) => !o && setCancelling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar promoção?</AlertDialogTitle>
            <AlertDialogDescription>Cupons emitidos podem ficar inválidos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!cancelling) return;
              setStatus(cancelling.id, "CANCELLED", "Promoção cancelada");
              setCancelling(null);
            }}>Cancelar promoção</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function renderValue(p: Promotion) {
  if (p.discount_type === "PERCENTAGE" && p.discount_value) return `${p.discount_value}%`;
  if (p.discount_type === "FIXED_AMOUNT") return formatBRLFromDecimal(p.discount_value);
  return "—";
}

function PromotionDialog({
  open, onOpenChange, onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (p: Omit<Promotion, "id" | "uses_count" | "status" | "conditions">) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState<DiscountType>("PERCENTAGE");
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<ApplicationMode>("AUTOMATIC");
  const [cumulative, setCumulative] = useState(false);
  const [priority, setPriority] = useState(1);
  const [from, setFrom] = useState("");
  const [until, setUntil] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [maxPerCustomer, setMaxPerCustomer] = useState("");

  const valueNeeded = type === "PERCENTAGE" || type === "FIXED_AMOUNT";
  const valueOk = !valueNeeded || (value.trim() && (type !== "PERCENTAGE" || parseFloat(value) <= 100));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader><DialogTitle>Nova promoção</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5"><Label className="text-xs">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5"><Label className="text-xs">Descrição</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Tipo de desconto</Label>
            <Select value={type} onValueChange={(v) => setType(v as DiscountType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(DISCOUNT_TYPE) as DiscountType[]).map((k) => (
                  <SelectItem key={k} value={k}>{DISCOUNT_TYPE[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Valor</Label>
            <Input
              placeholder={type === "PERCENTAGE" ? "0–100" : "0.00"}
              value={value} onChange={(e) => setValue(e.target.value)}
              disabled={!valueNeeded}
            />
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Aplicação</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as ApplicationMode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(APPLICATION_MODE) as ApplicationMode[]).map((k) => (
                  <SelectItem key={k} value={k}>{APPLICATION_MODE[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Prioridade</Label>
            <Input type="number" min={1} value={priority} onChange={(e) => setPriority(parseInt(e.target.value || "1", 10))} />
          </div>
          <DateTimePicker label="Início" value={from} onChange={setFrom} />
          <DateTimePicker label="Fim" value={until} onChange={setUntil} />
          <div className="space-y-1.5"><Label className="text-xs">Máx. usos</Label>
            <Input type="number" min={0} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Máx. por cliente</Label>
            <Input type="number" min={0} value={maxPerCustomer} onChange={(e) => setMaxPerCustomer(e.target.value)} />
          </div>
          <div className="col-span-2 flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label className="text-sm">Cumulativa</Label>
            <Switch checked={cumulative} onCheckedChange={setCumulative} />
          </div>
          <p className="col-span-2 text-xs text-muted-foreground">
            Condições avançadas em breve — edição via API por enquanto.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            disabled={!name.trim() || !from || !until || !valueOk}
            onClick={() => onSubmit({
              name: name.trim(),
              description: desc.trim(),
              discount_type: type,
              discount_value: valueNeeded ? value : null,
              application_mode: mode,
              cumulative,
              priority,
              valid_from: from,
              valid_until: until,
              max_uses: maxUses ? parseInt(maxUses, 10) : null,
              max_uses_per_customer: maxPerCustomer ? parseInt(maxPerCustomer, 10) : null,
            })}
          >Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}