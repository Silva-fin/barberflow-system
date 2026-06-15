import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRLFromDecimal } from "@/lib/format";
import {
  mockServices, mockServiceVariants, type Service, type ServiceVariant,
} from "@/lib/mock/fase2";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/catalogo/servicos")({
  component: ServicosPage,
});

function ServicosPage() {
  const { role } = useAuth();
  const canWrite = role === "OWNER" || role === "ADMIN";
  const [variantsOf, setVariantsOf] = useState<Service | null>(null);
  const [variants, setVariants] = useState<ServiceVariant[]>(mockServiceVariants);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title="Serviços"
        description="Gerencie o catálogo de serviços e suas variantes."
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="w-32">Preço base</TableHead>
              <TableHead className="w-32">Duração</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-40 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockServices.map((s) => {
              const count = variants.filter((v) => v.service_id === s.id).length;
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{formatBRLFromDecimal(s.base_price)}</TableCell>
                  <TableCell>{s.base_duration_min} min</TableCell>
                  <TableCell>
                    {s.is_active ? <Badge variant="outline">Ativo</Badge> : <Badge variant="outline" className="bg-muted text-muted-foreground">Inativo</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setVariantsOf(s)}>
                      <Layers size={16} strokeWidth={1.5} />
                      Variantes {count > 0 && <span className="text-muted-foreground">({count})</span>}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={!!variantsOf} onOpenChange={(o) => !o && setVariantsOf(null)}>
        <SheetContent className="sm:max-w-xl">
          {variantsOf && (
            <VariantsPanel
              service={variantsOf}
              all={variants}
              setAll={setVariants}
              canWrite={canWrite}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function VariantsPanel({
  service, all, setAll, canWrite,
}: {
  service: Service;
  all: ServiceVariant[];
  setAll: (fn: (prev: ServiceVariant[]) => ServiceVariant[]) => void;
  canWrite: boolean;
}) {
  const list = useMemo(
    () => all.filter((v) => v.service_id === service.id).sort((a, b) => a.sort_order - b.sort_order),
    [all, service.id],
  );
  const [draft, setDraft] = useState({ name: "", price: "", duration: "", order: list.length + 1 });

  const submit = () => {
    if (!draft.name.trim() || !draft.price.trim()) return;
    setAll((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}`,
        service_id: service.id,
        name: draft.name.trim(),
        price: draft.price,
        duration_min: parseInt(draft.duration || "0", 10),
        sort_order: draft.order,
        is_active: true,
      },
    ]);
    setDraft({ name: "", price: "", duration: "", order: list.length + 2 });
    toast.success("Variante criada");
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-display text-2xl tracking-wide">Variantes</SheetTitle>
        <SheetDescription>{service.name}</SheetDescription>
      </SheetHeader>
      <div className="mt-6 space-y-4">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-24">Preço</TableHead>
                <TableHead className="w-24">Duração</TableHead>
                <TableHead className="w-16">Ordem</TableHead>
                <TableHead className="w-20 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">Nenhuma variante.</TableCell></TableRow>
              ) : (
                list.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{formatBRLFromDecimal(v.price)}</TableCell>
                    <TableCell>{v.duration_min} min</TableCell>
                    <TableCell>{v.sort_order}</TableCell>
                    <TableCell className="text-right">
                      {canWrite && (
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" aria-label="Editar"><Pencil size={16} strokeWidth={1.5} /></Button>
                          <Button
                            size="icon" variant="ghost" aria-label="Excluir"
                            onClick={() => { setAll((prev) => prev.filter((x) => x.id !== v.id)); toast.success("Variante removida"); }}
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {canWrite && (
          <Card className="p-4">
            <h3 className="mb-3 font-display text-lg tracking-wide">Nova variante</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5"><Label className="text-xs">Nome</Label>
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Preço (decimal)</Label>
                <Input placeholder="0.00" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Duração (min)</Label>
                <Input type="number" min={0} value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} />
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Ordem</Label>
                <Input type="number" min={1} value={draft.order} onChange={(e) => setDraft({ ...draft, order: parseInt(e.target.value || "1", 10) })} />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={submit} size="sm">
                <Plus size={16} strokeWidth={1.5} />
                Adicionar
              </Button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}