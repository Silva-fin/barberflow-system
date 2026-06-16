import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { PayoutBadge } from "@/components/app/fsm-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatBRL, formatDate } from "@/lib/format";
import {
  mockBarbers, mockPendingByBarber, mockPayouts, mockPaymentAccounts,
} from "@/lib/mock/fase-reskin";

export const Route = createFileRoute("/_authenticated/comissoes/pagamentos")({
  head: () => ({ meta: [{ title: "Pagamentos de comissões — Paladino" }] }),
  component: PagamentosPage,
});

function PagamentosPage() {
  const [barber, setBarber] = useState<string | null>(null);
  const [account, setAccount] = useState(mockPaymentAccounts[0].id);

  const pending = barber ? (mockPendingByBarber[barber] ?? []) : [];
  const total = pending.reduce((s, p) => s + p.amountCents, 0);
  const barberName = mockBarbers.find(b => b.id === barber)?.name ?? "";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Comissões"
        title="Pagamentos de comissões"
        description="Registre pagamentos à equipe e acompanhe o histórico."
      />

      <Card>
        <CardHeader><CardTitle className="font-display text-lg">Registrar pagamento</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Barbeiro</Label>
              <Select value={barber ?? ""} onValueChange={setBarber}>
                <SelectTrigger><SelectValue placeholder="Selecione um barbeiro" /></SelectTrigger>
                <SelectContent>
                  {mockBarbers.filter(b => b.active).map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Conta para débito</Label>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mockPaymentAccounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {barber && pending.length === 0 && (
            <p className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              Nenhuma comissão pendente para {barberName}.
            </p>
          )}

          {barber && pending.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Comissões pendentes
              </p>
              <ul className="divide-y divide-border rounded-md border border-border">
                {pending.map(p => (
                  <li key={p.id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{formatDate(p.date)} · {p.serviceName}</span>
                    <span className="tabular-nums">{formatBRL(p.amountCents)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">Total a pagar</span>
                <span className="font-display text-xl text-primary tabular-nums">{formatBRL(total)}</span>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Pagamento registrado")}>
                  Pagar {formatBRL(total)} em comissões
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-display text-lg">Histórico de pagamentos</CardTitle></CardHeader>
        <CardContent>
          {mockPayouts.length === 0 ? (
            <EmptyState title="Nenhum pagamento registrado" description="Pagamentos aparecem aqui após o registro." />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-muted-foreground">
                    <TableHead>Data</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead className="text-right">Comissões pagas</TableHead>
                    <TableHead className="text-right">Valor total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayouts.map(p => (
                    <TableRow key={p.id} className="hover:bg-muted/30">
                      <TableCell className="tabular-nums">{formatDate(p.date)}</TableCell>
                      <TableCell>{p.professional}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.commissionsCount}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatBRL(p.totalCents)}</TableCell>
                      <TableCell><PayoutBadge status={p.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}