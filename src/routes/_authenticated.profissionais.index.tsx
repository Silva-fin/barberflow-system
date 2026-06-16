import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ActiveBadge } from "@/components/app/fsm-badge";
import { mockBarbers, type Barber } from "@/lib/mock/fase-reskin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/profissionais/")({
  head: () => ({ meta: [{ title: "Barbeiros — Paladino" }] }),
  component: BarbeirosPage,
});

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function BarbeirosPage() {
  const [list, setList] = useState<Barber[]>(mockBarbers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  function create() {
    if (!newName.trim()) return;
    const id = "b" + (list.length + 1);
    setList([
      ...list,
      { id, name: newName.trim(), workStart: "09:00", workEnd: "18:00", workingDays: [1,2,3,4,5], specialties: [], commissionPct: null, active: true },
    ]);
    setNewName("");
    setDialogOpen(false);
    toast.success("Barbeiro criado");
  }

  function toggle(id: string) {
    setList(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));
    toast.success("Status atualizado");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação"
        title="Barbeiros"
        description={`${list.filter(b => b.active).length} ativos · ${list.length} no total`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus size={16} strokeWidth={1.5} className="mr-1" />Novo Barbeiro</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Barbeiro</DialogTitle></DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="bn">Nome</Label>
                <Input id="bn" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome completo" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={create} disabled={!newName.trim()}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(b => (
          <Card key={b.id}>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/15 text-primary font-semibold">
                      {b.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.workStart} – {b.workEnd}</p>
                  </div>
                </div>
                <ActiveBadge active={b.active} />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {b.specialties.length > 0
                  ? b.specialties.map(s => (
                      <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>
                    ))
                  : <span className="text-xs italic text-muted-foreground">Especialidades em breve</span>}
              </div>

              <div className="flex flex-wrap gap-1">
                {DAY_LABELS.map((l, i) => (
                  <span
                    key={l}
                    className={cn(
                      "flex h-6 w-8 items-center justify-center rounded text-[10px]",
                      b.workingDays.includes(i)
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {l}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">Comissão</span>
                {b.commissionPct !== null
                  ? <span className="font-display text-xl text-primary">{b.commissionPct}%</span>
                  : <span className="text-sm italic text-muted-foreground">Em breve</span>}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Pencil size={14} strokeWidth={1.5} className="mr-1" />Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => toggle(b.id)}>
                  {b.active ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}