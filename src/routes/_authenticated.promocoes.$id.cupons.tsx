import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { CouponBadge, PromotionBadge } from "@/components/app/fsm-badge";
import { EmptyField } from "@/components/app/empty-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/app/datetime-picker";
import { CustomerAutocomplete, type CustomerOption } from "@/components/app/customer-autocomplete";
import {
  GENERATION_TYPE, COUPON_REOPEN,
  type GenerationType, type CouponReopenPolicy,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { mockPromotions, mockCoupons, type Coupon } from "@/lib/mock/fase2";

export const Route = createFileRoute("/_authenticated/promocoes/$id/cupons")({
  component: CouponsPage,
});

function CouponsPage() {
  const { id } = Route.useParams();
  const promo = mockPromotions.find((p) => p.id === id);
  const [rows, setRows] = useState<Coupon[]>(mockCoupons.filter((c) => c.promotion_id === id));
  const [creating, setCreating] = useState(false);

  if (!promo) {
    return <Card className="p-8 text-center text-sm text-muted-foreground">Promoção não encontrada.</Card>;
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/promocoes"><ArrowLeft size={16} strokeWidth={1.5} />Promoções</Link>
      </Button>
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-2">Promoção <PromotionBadge status={promo.status} /></span> as unknown as string}
        title={`Cupons · ${promo.name}`}
        actions={<Button size="sm" onClick={() => setCreating(true)}><Plus size={16} strokeWidth={1.5} />Gerar cupons</Button>}
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead className="w-32">Tipo</TableHead>
              <TableHead className="w-24">Usos</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="w-44">Validade</TableHead>
              <TableHead className="w-40">Reabertura</TableHead>
              <TableHead className="w-28">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">Nenhum cupom emitido.</TableCell></TableRow>
            ) : rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-1 font-mono text-sm">
                    {c.code}
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                      navigator.clipboard.writeText(c.code);
                      toast.success("Código copiado");
                    }} aria-label="Copiar">
                      <Copy size={12} strokeWidth={1.5} />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{GENERATION_TYPE[c.generation_type]}</TableCell>
                <TableCell>{c.uses_count}/{c.max_uses}</TableCell>
                <TableCell>{c.customer_name ?? <EmptyField label="—" />}</TableCell>
                <TableCell>{c.expires_at ? formatDateTime(c.expires_at) : <EmptyField label="—" />}</TableCell>
                <TableCell className="text-muted-foreground">{COUPON_REOPEN[c.coupon_reopen_policy]}</TableCell>
                <TableCell><CouponBadge status={c.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <GenerateDialog
        open={creating}
        onOpenChange={setCreating}
        onGenerate={(items) => {
          setRows((prev) => [...items, ...prev]);
          toast.success(`${items.length} cupons gerados`);
          setCreating(false);
        }}
        promotionId={promo.id}
      />
    </div>
  );
}

function randCode(prefix?: string) {
  const s = Math.random().toString(36).slice(2, 8).toUpperCase();
  return prefix ? `${prefix.toUpperCase()}-${s}` : s;
}

function GenerateDialog({
  open, onOpenChange, onGenerate, promotionId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onGenerate: (items: Coupon[]) => void;
  promotionId: string;
}) {
  const [type, setType] = useState<GenerationType>("BULK");
  const [quantity, setQuantity] = useState(10);
  const [prefix, setPrefix] = useState("");
  const [code, setCode] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [expiresAt, setExpiresAt] = useState("");
  const [reopen, setReopen] = useState<CouponReopenPolicy>("NEVER_REOPEN");
  const [customer, setCustomer] = useState<CustomerOption | null>(null);

  const effectiveMaxUses = type === "SINGLE_USE" ? 1 : maxUses;
  const valid = useMemo(() => {
    if (type === "PER_CUSTOMER" && !customer) return false;
    if (type === "BULK" && quantity < 1) return false;
    return true;
  }, [type, customer, quantity]);

  const submit = () => {
    const now = Date.now();
    let items: Coupon[];
    if (type === "BULK") {
      items = Array.from({ length: quantity }).map((_, i) => ({
        id: `cp-${now}-${i}`, promotion_id: promotionId,
        code: randCode(prefix), generation_type: "BULK",
        uses_count: 0, max_uses: maxUses,
        customer_id: null, customer_name: null,
        expires_at: expiresAt || null, coupon_reopen_policy: reopen,
        status: "ACTIVE",
      }));
    } else if (type === "SINGLE_USE") {
      items = [{
        id: `cp-${now}`, promotion_id: promotionId,
        code: code.trim() || randCode(prefix), generation_type: "SINGLE_USE",
        uses_count: 0, max_uses: 1,
        customer_id: null, customer_name: null,
        expires_at: expiresAt || null, coupon_reopen_policy: reopen,
        status: "ACTIVE",
      }];
    } else {
      items = [{
        id: `cp-${now}`, promotion_id: promotionId,
        code: randCode(prefix || customer!.name.split(" ")[0]),
        generation_type: "PER_CUSTOMER",
        uses_count: 0, max_uses: effectiveMaxUses,
        customer_id: customer!.id, customer_name: customer!.name,
        expires_at: expiresAt || null, coupon_reopen_policy: reopen,
        status: "ACTIVE",
      }];
    }
    onGenerate(items);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Gerar cupons</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5"><Label className="text-xs">Tipo de geração</Label>
            <Select value={type} onValueChange={(v) => setType(v as GenerationType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(GENERATION_TYPE) as GenerationType[]).map((k) => (
                  <SelectItem key={k} value={k}>{GENERATION_TYPE[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "BULK" && (
            <>
              <div className="space-y-1.5"><Label className="text-xs">Quantidade</Label>
                <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value || "1", 10))} />
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Prefixo (opc)</Label>
                <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} />
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Máx. usos por cupom</Label>
                <Input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(parseInt(e.target.value || "1", 10))} />
              </div>
            </>
          )}
          {type === "SINGLE_USE" && (
            <>
              <div className="space-y-1.5"><Label className="text-xs">Código (opc)</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Prefixo (opc)</Label>
                <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} />
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Máx. usos</Label>
                <Input type="number" value={1} disabled />
              </div>
            </>
          )}
          {type === "PER_CUSTOMER" && (
            <>
              <div className="col-span-2 space-y-1.5"><Label className="text-xs">Cliente</Label>
                <CustomerAutocomplete value={customer} onChange={setCustomer} />
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Máx. usos</Label>
                <Input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(parseInt(e.target.value || "1", 10))} />
              </div>
            </>
          )}

          <DateTimePicker label="Validade (opc)" value={expiresAt} onChange={setExpiresAt} />
          <div className="space-y-1.5"><Label className="text-xs">Reabertura</Label>
            <Select value={reopen} onValueChange={(v) => setReopen(v as CouponReopenPolicy)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(COUPON_REOPEN) as CouponReopenPolicy[]).map((k) => (
                  <SelectItem key={k} value={k}>{COUPON_REOPEN[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={!valid} onClick={submit}>Gerar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}