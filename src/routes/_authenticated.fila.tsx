import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Bell, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";
import { formatRelative } from "@/lib/format";
import { mockQueueConfig, mockQueueEntries, type QueueEntry } from "@/lib/mock/fase1";

export const Route = createFileRoute("/_authenticated/fila")({
  head: () => ({ meta: [{ title: "Fila — Paladino" }] }),
  component: QueuePage,
});

function QueuePage() {
  const { role } = useAuth();
  const canConfig = role === "OWNER" || role === "ADMIN";
  const [entries, setEntries] = useState<QueueEntry[]>(mockQueueEntries);
  const [statusFilter, setStatusFilter] = useState<"ALL" | QueueEntry["status"]>("ALL");
  const [scopeFilter, setScopeFilter] = useState<"ALL" | QueueEntry["scope"]>("ALL");
  const [config, setConfig] = useState(mockQueueConfig);

  const filtered = useMemo(() => entries.filter((e) => {
    if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
    if (scopeFilter !== "ALL" && e.scope !== scopeFilter) return false;
    return true;
  }), [entries, statusFilter, scopeFilter]);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        <PageHeader eyebrow="Operação" title="Fila de espera" description="Lista de espera por serviço, profissional ou produto." />

        <Tabs defaultValue="entries">
          <TabsList>
            <TabsTrigger value="entries">Entradas</TabsTrigger>
            <TabsTrigger value="config" disabled={!canConfig}>Configuração</TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="WAITING">Aguardando</SelectItem>
                    <SelectItem value="NOTIFIED">Notificado</SelectItem>
                    <SelectItem value="EXPIRED">Expirado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Escopo</label>
                <Select value={scopeFilter} onValueChange={(v) => setScopeFilter(v as typeof scopeFilter)}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="SERVICE">Serviço</SelectItem>
                    <SelectItem value="PROFESSIONAL">Profissional</SelectItem>
                    <SelectItem value="PRODUCT">Produto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState title="Fila vazia" description="Sem entradas para os filtros selecionados." />
            ) : (
              <div className="rounded-md border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Escopo</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Na fila</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-40 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.clientName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{e.scope}</Badge>
                          <span className="ml-2 text-xs text-muted-foreground">{e.target}</span>
                        </TableCell>
                        <TableCell className="font-mono">P{e.priority}</TableCell>
                        <TableCell className="text-muted-foreground">{formatRelative(e.enqueuedAt)}</TableCell>
                        <TableCell><Badge variant="outline">{e.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span><Button size="sm" variant="ghost" disabled><Bell size={16} strokeWidth={1.5} /></Button></span>
                              </TooltipTrigger>
                              <TooltipContent>Em breve</TooltipContent>
                            </Tooltip>
                            <RemoveEntryDialog onConfirm={() => { setEntries((es) => es.filter((x) => x.id !== e.id)); toast.success("Entrada removida"); }} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 max-w-3xl">
              <div className="space-y-2 rounded-md border border-border bg-card p-4">
                <Label>Fila ativa</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ativar fila</span>
                  <Switch checked={config.enabled} onCheckedChange={(v) => setConfig((c) => ({ ...c, enabled: v }))} />
                </div>
              </div>
              <div className="space-y-2 rounded-md border border-border bg-card p-4">
                <Label>Modo de prioridade</Label>
                <Select value={config.priorityMode} onValueChange={(v) => setConfig((c) => ({ ...c, priorityMode: v as typeof c.priorityMode }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIFO">FIFO (ordem de chegada)</SelectItem>
                    <SelectItem value="PRIORITY">Prioridade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 rounded-md border border-border bg-card p-4">
                <Label>Janela de notificação (h)</Label>
                <Input type="number" value={config.notificationWindowHours} onChange={(e) => setConfig((c) => ({ ...c, notificationWindowHours: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <Button onClick={() => toast.success("Configuração salva")}>Salvar</Button>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

function RemoveEntryDialog({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost"><Trash2 size={16} strokeWidth={1.5} /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Remover da fila</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); setOpen(false); }}>Remover</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}