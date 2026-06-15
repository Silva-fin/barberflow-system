import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { PackagePurchaseBadge } from "@/components/app/fsm-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatBRLFromDecimal, formatDateTime } from "@/lib/format";
import { mockPackagePurchases, type PackagePurchase } from "@/lib/mock/fase2";

export const Route = createFileRoute("/_authenticated/pacotes/compras")({
  component: PurchasesPage,
});

function PurchasesPage() {
  const [status, setStatus] = useState<string>("ALL");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<PackagePurchase | null>(null);

  const rows = useMemo(() =>
    mockPackagePurchases.filter((p) =>
      (status === "ALL" || p.status === status) &&
      (!q.trim() || p.customer_name.toLowerCase().includes(q.toLowerCase())),
    ),
    [status, q]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pacotes" title="Compras" description="Histórico de vendas de pacotes." />
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input placeholder="Buscar cliente…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="PENDING_PAYMENT">Pagamento pendente</SelectItem>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="REVOKED">Revogado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {rows.length === 0 ? (
        <EmptyState title="Nenhuma compra" description="Ajuste os filtros ou venda um pacote." />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Pacote</TableHead>
                <TableHead className="w-32">Valor</TableHead>
                <TableHead className="w-40">Status</TableHead>
                <TableHead className="w-32">Pagamento</TableHead>
                <TableHead className="w-32 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => setDetail(p)}>
                  <TableCell>{formatDateTime(p.created_at)}</TableCell>
                  <TableCell className="font-medium">{p.customer_name}</TableCell>
                  <TableCell>{p.plan_name}</TableCell>
                  <TableCell>{formatBRLFromDecimal(p.total_price)}</TableCell>
                  <TableCell><PackagePurchaseBadge status={p.status} /></TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {p.payment_id ? (
                      <Button asChild variant="link" size="sm" className="px-0">
                        <Link to="/pagamentos/$id" params={{ id: p.payment_id }}>Ver</Link>
                      </Button>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/clientes/$id" params={{ id: p.customer_id }} hash="cotas">Ver cotas</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhe da compra</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              <Row label="Data" value={formatDateTime(detail.created_at)} />
              <Row label="Cliente" value={detail.customer_name} />
              <Row label="Pacote" value={detail.plan_name} />
              <Row label="Valor" value={formatBRLFromDecimal(detail.total_price)} />
              <Row label="Status" value={<PackagePurchaseBadge status={detail.status} />} />
              <p className="pt-2 text-xs text-muted-foreground">
                Cotas (saldo/validade) ficam na ficha do cliente.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}