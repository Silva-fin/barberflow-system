import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ENTITY_TYPE, type EntityType } from "@/lib/constants";
import { mockCategories, type Category } from "@/lib/mock/fase2";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/catalogo/categorias")({
  component: CategoriasPage,
});

function CategoriasPage() {
  const { role } = useAuth();
  const canWrite = role === "OWNER" || role === "ADMIN";
  const [rows, setRows] = useState<Category[]>(mockCategories);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<EntityType, Category[]>();
    for (const c of rows) {
      const list = map.get(c.entity_type) ?? [];
      list.push(c);
      map.set(c.entity_type, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.sort_order - b.sort_order);
    return [...map.entries()];
  }, [rows]);

  const toggleActive = (c: Category) => {
    setRows((prev) => prev.map((r) => (r.id === c.id ? { ...r, is_active: !r.is_active } : r)));
    toast.success(`Categoria ${c.is_active ? "desativada" : "ativada"}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title="Categorias"
        description="Agrupe serviços, produtos e despesas por categoria."
        actions={
          canWrite && (
            <Button onClick={() => setCreating(true)} size="sm">
              <Plus size={16} strokeWidth={1.5} />
              Nova categoria
            </Button>
          )
        }
      />

      {grouped.map(([entity, list]) => (
        <Card key={entity} className="overflow-hidden">
          <header className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
            <h2 className="font-display text-lg tracking-wide">{ENTITY_TYPE[entity]}</h2>
            <span className="text-xs text-muted-foreground">{list.length} categoria(s)</span>
          </header>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-24">Tipo</TableHead>
                <TableHead className="w-20">Ordem</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24">Padrão</TableHead>
                <TableHead className="w-32 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{ENTITY_TYPE[c.entity_type]}</TableCell>
                  <TableCell>{c.sort_order}</TableCell>
                  <TableCell>
                    <Switch
                      checked={c.is_active}
                      onCheckedChange={canWrite ? () => toggleActive(c) : undefined}
                      disabled={!canWrite}
                    />
                  </TableCell>
                  <TableCell>
                    {c.is_default ? <Badge variant="outline">Padrão</Badge> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    {canWrite && (
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditing(c)}
                                aria-label="Editar"
                              >
                                <Pencil size={16} strokeWidth={1.5} />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {c.is_default && <TooltipContent>Categoria padrão — apenas status muda</TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={c.is_default}
                                onClick={() => setDeleting(c)}
                                aria-label="Excluir"
                              >
                                <Trash2 size={16} strokeWidth={1.5} />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {c.is_default && <TooltipContent>Categoria padrão</TooltipContent>}
                        </Tooltip>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ))}

      <CategoryDialog
        open={creating || !!editing}
        onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}
        initial={editing}
        onSubmit={(data) => {
          if (editing) {
            setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...data } : r)));
            toast.success("Categoria atualizada");
          } else {
            setRows((prev) => [
              ...prev,
              { id: `cat-${prev.length + 1}`, is_default: false, ...data },
            ]);
            toast.success("Categoria criada");
          }
          setCreating(false);
          setEditing(null);
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Itens existentes mantêm a referência.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleting) return;
                setRows((prev) => prev.filter((r) => r.id !== deleting.id));
                toast.success("Categoria excluída");
                setDeleting(null);
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

function CategoryDialog({
  open, onOpenChange, initial, onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: Category | null;
  onSubmit: (data: { name: string; entity_type: EntityType; sort_order: number; is_active: boolean }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [entity, setEntity] = useState<EntityType>(initial?.entity_type ?? "SERVICE");
  const [order, setOrder] = useState(initial?.sort_order ?? 1);
  const [active, setActive] = useState(initial?.is_active ?? true);

  // sync when initial changes
  useMemo(() => {
    setName(initial?.name ?? "");
    setEntity(initial?.entity_type ?? "SERVICE");
    setOrder(initial?.sort_order ?? 1);
    setActive(initial?.is_active ?? true);
  }, [initial]);

  const lockMeta = !!initial?.is_default;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar categoria" : "Nova categoria"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome</Label>
            <Input value={name} maxLength={255} disabled={lockMeta} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select value={entity} onValueChange={(v) => setEntity(v as EntityType)} disabled={lockMeta}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ENTITY_TYPE) as EntityType[]).map((k) => (
                    <SelectItem key={k} value={k}>{ENTITY_TYPE[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ordem</Label>
              <Input
                type="number" min={1} value={order} disabled={lockMeta}
                onChange={(e) => setOrder(parseInt(e.target.value || "1", 10))}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label className="text-sm">Ativa</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            disabled={!name.trim()}
            onClick={() => onSubmit({ name: name.trim(), entity_type: entity, sort_order: order, is_active: active })}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}