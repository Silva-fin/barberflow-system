import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Truck, Plus, Pencil, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { ActiveBadge } from "@/components/app/fsm-badge";
import { EmptyState } from "@/components/app/empty-state";
import { EmptyField } from "@/components/app/empty-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/format";
import { mockSuppliers, type Supplier } from "@/lib/mock/fase3";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/fornecedores")({
  component: FornecedoresPage,
});

function FornecedoresPage() {
  const { role } = useAuth();
  const canWrite = role === "OWNER" || role === "ADMIN";
  const [items, setItems] = useState<Supplier[]>(mockSuppliers);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [creating, setCreating] = useState(false);
  const [deactivating, setDeactivating] = useState<Supplier | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financeiro"
        title="Fornecedores"
        description="Cadastro de fornecedores e desativação lógica."
        actions={canWrite && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={16} strokeWidth={1.5} />Novo fornecedor
          </Button>
        )}
      />

      {items.length === 0 ? (
        <EmptyState icon={<Truck size={28} strokeWidth={1.5} />} title="Sem fornecedores" />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-44">Criado</TableHead>
                <TableHead className="w-40 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.contact || <EmptyField label="—" />}</TableCell>
                  <TableCell className="text-muted-foreground">{s.document || <EmptyField label="—" />}</TableCell>
                  <TableCell><ActiveBadge active={s.active} /></TableCell>
                  <TableCell className="text-muted-foreground text-xs">{formatDateTime(s.created_at)}</TableCell>
                  <TableCell className="text-right">
                    {canWrite && (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditing(s)}>
                          <Pencil size={16} strokeWidth={1.5} />
                        </Button>
                        {s.active && (
                          <Button variant="ghost" size="sm" onClick={() => setDeactivating(s)}>
                            <PowerOff size={16} strokeWidth={1.5} />Desativar
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <FormDialog
        open={creating || !!editing}
        initial={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSave={(s) => {
          if (editing) {
            setItems((prev) => prev.map((x) => x.id === editing.id ? { ...x, ...s } : x));
            toast.success("Fornecedor atualizado");
          } else {
            setItems((prev) => [{ ...s, id: `sup_new_${Date.now()}`, active: true, created_at: new Date().toISOString() } as Supplier, ...prev]);
            toast.success("Fornecedor cadastrado");
          }
          setCreating(false); setEditing(null);
        }}
      />

      <Dialog open={!!deactivating} onOpenChange={(o) => { if (!o) setDeactivating(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desativar fornecedor?</DialogTitle>
            <DialogDescription>
              <strong>{deactivating?.name}</strong> não será excluído — ficará marcado como inativo
              e some dos selects de cadastro. Linhas existentes permanecem.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivating(null)}>Voltar</Button>
            <Button variant="destructive" onClick={() => {
              if (!deactivating) return;
              setItems((prev) => prev.map((x) => x.id === deactivating.id ? { ...x, active: false } : x));
              toast.success("Fornecedor desativado");
              setDeactivating(null);
            }}>Desativar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FormDialog({ open, initial, onClose, onSave }: {
  open: boolean; initial: Supplier | null; onClose: () => void; onSave: (s: Partial<Supplier>) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [document, setDocument] = useState(initial?.document ?? "");
  // re-sync when initial changes
  useState(() => { setName(initial?.name ?? ""); setContact(initial?.contact ?? ""); setDocument(initial?.document ?? ""); });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar fornecedor" : "Novo fornecedor"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Nome *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Contato</Label>
            <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Telefone ou e-mail" />
          </div>
          <div className="space-y-1">
            <Label>Documento</Label>
            <Input value={document} onChange={(e) => setDocument(e.target.value)} placeholder="CNPJ ou CPF" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!name.trim()} onClick={() => onSave({ name, contact, document })}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}