import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatBRLFromDecimal } from "@/lib/format";
import { mockProducts, type Product } from "@/lib/mock/fase2";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/catalogo/produtos")({
  component: ProdutosPage,
});

function ProdutosPage() {
  const { role } = useAuth();
  const canWrite = role === "OWNER" || role === "ADMIN";
  const [items, setItems] = useState<Product[]>(mockProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title="Produtos"
        actions={canWrite && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={16} strokeWidth={1.5} />Novo produto
          </Button>
        )}
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="w-28">SKU</TableHead>
              <TableHead className="w-32">Preço</TableHead>
              <TableHead className="w-24">Estoque</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-32 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                <TableCell>{formatBRLFromDecimal(p.price)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>{p.is_active ? <Badge variant="outline">Ativo</Badge> : <Badge variant="outline" className="bg-muted text-muted-foreground">Inativo</Badge>}</TableCell>
                <TableCell className="text-right">
                  {canWrite && (
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(p)}><Pencil size={16} strokeWidth={1.5} /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { setItems((prev) => prev.filter((x) => x.id !== p.id)); toast.success("Produto excluído"); }}>
                        <Trash2 size={16} strokeWidth={1.5} />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ProductDialog
        open={creating || !!editing}
        initial={editing}
        onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}
        onSubmit={(p) => {
          if (editing) {
            setItems((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...p } : x)));
            toast.success("Produto atualizado");
          } else {
            setItems((prev) => [...prev, { id: `prd-${Date.now()}`, stock: 0, is_active: true, ...p }]);
            toast.success("Produto criado");
          }
          setEditing(null); setCreating(false);
        }}
      />
    </div>
  );
}

function ProductDialog({
  open, onOpenChange, initial, onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: Product | null;
  onSubmit: (p: { name: string; sku: string; price: string; image_url: string | null }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [slots, setSlots] = useState<(string | null)[]>([initial?.image_url ?? null, null, null, null, null]);
  const [loadingSlot, setLoadingSlot] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(initial?.name ?? "");
    setSku(initial?.sku ?? "");
    setPrice(initial?.price ?? "");
    setSlots([initial?.image_url ?? null, null, null, null, null]);
  }, [initial]);

  const handleUpload = async (file: File) => {
    setLoadingSlot(0);
    try {
      await new Promise((r) => setTimeout(r, 700));
      const url = URL.createObjectURL(file);
      setSlots((prev) => { const next = [...prev]; next[0] = url; return next; });
      toast.success("Imagem enviada");
    } catch {
      toast.error("Falha ao enviar imagem");
    } finally {
      setLoadingSlot(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar produto" : "Novo produto"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5"><Label className="text-xs">Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5"><Label className="text-xs">SKU</Label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Preço</Label>
              <Input placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="text-xs">Galeria de imagens</Label>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {slots.map((url, i) => {
                const primary = i === 0;
                const disabled = !primary;
                const slot = (
                  <div
                    key={i}
                    className={
                      "relative aspect-square rounded-md border border-dashed border-border bg-card/40 " +
                      (disabled ? "opacity-60" : "")
                    }
                  >
                    {url ? (
                      <>
                        <img src={url} alt="" className="h-full w-full rounded-md object-cover" />
                        {primary && (
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded-full bg-background/90 p-1 shadow"
                            onClick={() => setSlots((prev) => { const next = [...prev]; next[i] = null; return next; })}
                            aria-label="Remover"
                          >
                            <X size={12} strokeWidth={1.5} />
                          </button>
                        )}
                      </>
                    ) : loadingSlot === i ? (
                      <div className="flex h-full items-center justify-center"><Loader2 size={16} strokeWidth={1.5} className="animate-spin text-muted-foreground" /></div>
                    ) : (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => fileRef.current?.click()}
                        className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground"
                      >
                        <ImagePlus size={16} strokeWidth={1.5} />
                        {primary && <span className="text-[10px]">Primária</span>}
                      </button>
                    )}
                    {!primary && (
                      <Badge variant="outline" className="absolute bottom-1 left-1 bg-background/80 text-[9px]">
                        Em breve
                      </Badge>
                    )}
                  </div>
                );
                return disabled ? (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild><span className="contents">{slot}</span></TooltipTrigger>
                    <TooltipContent>Persistência de múltiplas imagens em breve</TooltipContent>
                  </Tooltip>
                ) : slot;
              })}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={!name.trim() || !price.trim()} onClick={() => onSubmit({ name, sku, price, image_url: slots[0] })}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}