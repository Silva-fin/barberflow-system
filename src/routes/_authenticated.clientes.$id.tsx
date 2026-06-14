import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { CrmBadge, AppointmentBadge } from "@/components/app/fsm-badge";
import { EmptyState } from "@/components/app/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { mockCustomers, type Customer, type Quota, type Consent } from "@/lib/mock/fase1";
import { formatDate, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/clientes/$id")({
  head: () => ({ meta: [{ title: "Ficha do cliente — Paladino" }] }),
  component: CustomerDetailPage,
});

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function CustomerDetailPage() {
  const { id } = Route.useParams();
  const base = useMemo(() => mockCustomers.find((c) => c.id === id) ?? mockCustomers[0], [id]);
  const [customer, setCustomer] = useState<Customer>(base);

  return (
    <div className="space-y-6">
      <Link to="/clientes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} strokeWidth={1.5} /> Clientes
      </Link>

      <header className="flex flex-wrap items-center gap-4 border-b border-border pb-5">
        <Avatar className="size-14">
          <AvatarFallback className="bg-primary text-primary-foreground font-display">
            {initials(customer.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl tracking-wide">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">{customer.phone}</p>
        </div>
        <CrmBadge classification={customer.classification} />
      </header>

      <Tabs defaultValue="resumo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="cotas">Cotas</TabsTrigger>
          <TabsTrigger value="consentimentos">Consentimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Telefone</CardTitle></CardHeader>
              <CardContent className="text-sm">{customer.phone}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Classificação</CardTitle></CardHeader>
              <CardContent><CrmBadge classification={customer.classification} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Dias sem visita</CardTitle></CardHeader>
              <CardContent className="font-mono text-lg">{customer.daysSinceLastVisit ?? "—"}</CardContent>
            </Card>
          </div>
          {customer.insights.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Sem insights no momento.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {customer.insights.map((ins) => (
                <Card key={ins.id}>
                  <CardHeader><CardTitle className="font-display text-lg">{ins.title}</CardTitle></CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{ins.body}</CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="historico">
          {customer.history.length === 0 ? (
            <EmptyState title="Sem histórico" />
          ) : (
            <div className="rounded-md border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="text-muted-foreground">{formatDateTime(h.date)}</TableCell>
                      <TableCell>{h.service}</TableCell>
                      <TableCell><AppointmentBadge status={h.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cotas" className="space-y-4">
          <div className="flex justify-end">
            <GrantQuotaDialog onGrant={(q) => setCustomer((c) => ({ ...c, quotas: [...c.quotas, q] }))} />
          </div>
          {customer.quotas.length === 0 ? (
            <EmptyState title="Nenhuma cota" description="Conceda uma cota a este cliente." />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {customer.quotas.map((q) => (
                <Card key={q.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-display text-lg">{q.type}</CardTitle>
                    <Badge variant={q.status === "ACTIVE" ? "outline" : "secondary"}>{q.status}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="font-mono text-2xl">{q.remaining}<span className="text-muted-foreground">/{q.total}</span></p>
                    <p className="text-xs text-muted-foreground">
                      Validade: {q.validUntil ? formatDate(q.validUntil) : "sem validade"}
                    </p>
                    <RevokeQuotaDialog
                      onRevoke={() => setCustomer((c) => ({ ...c, quotas: c.quotas.map((x) => x.id === q.id ? { ...x, status: "REVOKED" } : x) }))}
                      disabled={q.status !== "ACTIVE"}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="consentimentos">
          <div className="rounded-md border border-border bg-card divide-y divide-border">
            {customer.consents.map((c) => (
              <ConsentRow key={c.type} consent={c} onToggle={(next) => setCustomer((cu) => ({ ...cu, consents: cu.consents.map((x) => x.type === c.type ? next : x) }))} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GrantQuotaDialog({ onGrant }: { onGrant: (q: Quota) => void }) {
  const [open, setOpen] = useState(false);
  const [total, setTotal] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [reason, setReason] = useState("");
  const totalNum = parseInt(total, 10);
  const valid = totalNum > 0 && reason.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus size={16} strokeWidth={1.5} /> Conceder cota</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Conceder cota</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="total">Total de cotas *</Label>
            <Input id="total" type="number" min={1} value={total} onChange={(e) => setTotal(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="validUntil">Validade (opcional)</Label>
            <Input id="validUntil" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="reason">Motivo *</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Justificativa obrigatória" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button disabled={!valid} onClick={() => {
            onGrant({
              id: `q-new-${Date.now()}`,
              type: "Cota concedida",
              remaining: totalNum,
              total: totalNum,
              validUntil: validUntil ? new Date(validUntil).toISOString() : null,
              status: "ACTIVE",
            });
            setOpen(false); setTotal(""); setValidUntil(""); setReason("");
            toast.success("Cota concedida");
          }}>Conceder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RevokeQuotaDialog({ onRevoke, disabled }: { onRevoke: () => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>Revogar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Revogar cota</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={() => { onRevoke(); setOpen(false); toast.success("Cota revogada"); }}>Revogar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConsentRow({ consent, onToggle }: { consent: Consent; onToggle: (next: Consent) => void }) {
  const labels = {
    COMMUNICATION: "Comunicação",
    MARKETING: "Marketing",
    DATA_PROCESSING: "Tratamento de dados",
  };
  const granted = consent.status === "GRANTED";
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm font-medium">{labels[consent.type]}</p>
        <p className="text-xs text-muted-foreground">Atualizado em {formatDateTime(consent.updatedAt)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={granted ? "default" : "outline"}>{granted ? "Concedido" : "Revogado"}</Badge>
        <Button
          variant="outline" size="sm"
          onClick={() => { onToggle({ ...consent, status: granted ? "REVOKED" : "GRANTED", updatedAt: new Date().toISOString() }); toast.success(granted ? "Consentimento revogado" : "Consentimento concedido"); }}
        >
          {granted ? "Revogar" : "Conceder"}
        </Button>
      </div>
    </div>
  );
}