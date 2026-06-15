import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { EmptyField } from "@/components/app/empty-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatBRLFromDecimal } from "@/lib/format";
import {
  mockProfessionals, mockServices, mockProfessionalPricing,
  type ProfessionalPricing,
} from "@/lib/mock/fase2";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/profissionais/$id")({
  component: ProfessionalPage,
});

function ProfessionalPage() {
  const { id } = Route.useParams();
  const pro = mockProfessionals.find((p) => p.id === id) ?? mockProfessionals[0];
  const { role } = useAuth();
  const canSeePricing = role === "OWNER" || role === "ADMIN";

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/profissionais"><ArrowLeft size={16} strokeWidth={1.5} />Profissionais</Link>
      </Button>
      <PageHeader
        eyebrow={pro.role_title}
        title={pro.name}
        description="Horários, serviços, bloqueios e preços individuais."
      />
      <Tabs defaultValue={canSeePricing ? "precos" : "horarios"}>
        <TabsList>
          <TabsTrigger value="horarios">Horários</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="bloqueios">Bloqueios</TabsTrigger>
          {canSeePricing && <TabsTrigger value="precos">Preços por serviço</TabsTrigger>}
        </TabsList>
        <TabsContent value="horarios">
          <Card className="p-6 text-sm text-muted-foreground">Em breve.</Card>
        </TabsContent>
        <TabsContent value="servicos">
          <Card className="p-6 text-sm text-muted-foreground">Em breve.</Card>
        </TabsContent>
        <TabsContent value="bloqueios">
          <Card className="p-6 text-sm text-muted-foreground">Em breve.</Card>
        </TabsContent>
        {canSeePricing && (
          <TabsContent value="precos">
            <PricingTab professionalId={pro.id} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function PricingTab({ professionalId }: { professionalId: string }) {
  const [rows, setRows] = useState<ProfessionalPricing[]>(
    mockProfessionalPricing.filter((p) => p.professional_id === professionalId),
  );
  const [editing, setEditing] = useState<ProfessionalPricing | null>(null);
  const [creating, setCreating] = useState(false);

  const baseOf = (sid: string) => mockServices.find((s) => s.id === sid);

  return (
    <Card className="overflow-hidden">
      <header className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
        <h2 className="font-display text-lg tracking-wide">Preços por serviço</h2>
        <Button size="sm" onClick={() => setCreating(true)}><Plus size={16} strokeWidth={1.5} />Novo</Button>
      </header>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Serviço</TableHead>
            <TableHead className="w-32">Preço base</TableHead>
            <TableHead className="w-32">Preço override</TableHead>
            <TableHead className="w-32">Duração override</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-32 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">Nenhum preço cadastrado.</TableCell></TableRow>
          ) : rows.map((r) => {
            const svc = baseOf(r.service_id);
            return (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{svc?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{svc ? formatBRLFromDecimal(svc.base_price) : <EmptyField label="—" />}</TableCell>
                <TableCell>{formatBRLFromDecimal(r.price_override)}</TableCell>
                <TableCell>{r.duration_override_min != null ? `${r.duration_override_min} min` : <EmptyField label="—" />}</TableCell>
                <TableCell>
                  <Switch checked={r.is_active} onCheckedChange={(v) => {
                    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, is_active: v } : x)));
                    toast.success("Status atualizado");
                  }} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(r)}><Pencil size={16} strokeWidth={1.5} /></Button>
                    <Button size="icon" variant="ghost" onClick={() => {
                      setRows((prev) => prev.filter((x) => x.id !== r.id));
                      toast.success("Preço removido");
                    }}><Trash2 size={16} strokeWidth={1.5} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <PricingDialog
        open={creating || !!editing}
        initial={editing}
        onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}
        existingServiceIds={rows.map((r) => r.service_id)}
        onSubmit={(d) => {
          if (editing) {
            setRows((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...d } : x)));
            toast.success("Preço atualizado");
          } else {
            setRows((prev) => [...prev, {
              id: `pp-${Date.now()}`,
              professional_id: professionalId,
              ...d,
              is_active: true,
            }]);
            toast.success("Preço criado");
          }
          setCreating(false); setEditing(null);
        }}
      />
    </Card>
  );
}

function PricingDialog({
  open, onOpenChange, initial, existingServiceIds, onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: ProfessionalPricing | null;
  existingServiceIds: string[];
  onSubmit: (d: { service_id: string; price_override: string | null; duration_override_min: number | null }) => void;
}) {
  const [serviceId, setServiceId] = useState(initial?.service_id ?? "");
  const [price, setPrice] = useState(initial?.price_override ?? "");
  const [duration, setDuration] = useState(initial?.duration_override_min?.toString() ?? "");

  useMemo(() => {
    setServiceId(initial?.service_id ?? "");
    setPrice(initial?.price_override ?? "");
    setDuration(initial?.duration_override_min?.toString() ?? "");
  }, [initial]);

  const available = mockServices.filter((s) => !existingServiceIds.includes(s.id) || s.id === initial?.service_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial ? "Editar preço" : "Novo preço"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label className="text-xs">Serviço</Label>
            <Select value={serviceId} onValueChange={setServiceId} disabled={!!initial}>
              <SelectTrigger><SelectValue placeholder="Selecionar…" /></SelectTrigger>
              <SelectContent>
                {available.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">Preço override</Label>
              <Input placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Duração override (min, opc)</Label>
              <Input type="number" min={0} value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={!serviceId || !price.trim()} onClick={() => onSubmit({
            service_id: serviceId,
            price_override: price.trim() || null,
            duration_override_min: duration ? parseInt(duration, 10) : null,
          })}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}