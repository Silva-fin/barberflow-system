import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { TenantStatusBadge } from "@/components/owner/tenant-status-badge";
import { ReasonDialog } from "@/components/owner/reason-dialog";
import { listTenants, setTenantStatus } from "@/lib/owner/api";
import type { TenantStatus, TenantSummary } from "@/lib/owner/types";
import { TENANT_STATUS_LABELS } from "@/lib/owner/constants";

export const Route = createFileRoute("/owner/tenants/")({
  head: () => ({ meta: [{ title: "Tenants — Plataforma" }] }),
  component: TenantsListPage,
});

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
}

function TenantsListPage() {
  const [items, setItems] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TenantStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [suspendTarget, setSuspendTarget] = useState<TenantSummary | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<TenantSummary | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listTenants({ status, search });
      setItems(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(load, 100);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  async function doSuspend(reason: string) {
    if (!suspendTarget) return;
    setBusy(true);
    try {
      const updated = await setTenantStatus(suspendTarget.id, "SUSPENDED", reason);
      setItems((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSuspendTarget(null);
    } finally {
      setBusy(false);
    }
  }

  async function doReactivate() {
    if (!reactivateTarget) return;
    setBusy(true);
    try {
      const updated = await setTenantStatus(reactivateTarget.id, "ACTIVE");
      setItems((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setReactivateTarget(null);
    } finally {
      setBusy(false);
    }
  }

  const hasFilters = status !== "ALL" || search.trim() !== "";

  return (
    <div className="space-y-6">
      <PageHeader title="Tenants" description="Visão de todos os estabelecimentos da plataforma." />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={status} onValueChange={(v) => setStatus(v as TenantStatus | "ALL")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os status</SelectItem>
            <SelectItem value="TRIAL">{TENANT_STATUS_LABELS.TRIAL}</SelectItem>
            <SelectItem value="ACTIVE">{TENANT_STATUS_LABELS.ACTIVE}</SelectItem>
            <SelectItem value="SUSPENDED">{TENANT_STATUS_LABELS.SUSPENDED}</SelectItem>
            <SelectItem value="CHURNED">{TENANT_STATUS_LABELS.CHURNED}</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Buscar por nome ou slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[280px]"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Nenhum tenant encontrado" : "Nenhum tenant cadastrado"}
          description={hasFilters ? "Ajuste os filtros para ver mais resultados." : undefined}
        />
      ) : (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((t) => (
                <TableRow key={t.id} className="cursor-pointer">
                  <TableCell>
                    <Link to="/owner/tenants/$id" params={{ id: t.id }} className="hover:underline">
                      {t.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.slug}</TableCell>
                  <TableCell><TenantStatusBadge status={t.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(t.created_at)}</TableCell>
                  <TableCell className="text-muted-foreground">{t.active ? "Sim" : "Não"}</TableCell>
                  <TableCell className="text-right">
                    {(t.status === "ACTIVE" || t.status === "TRIAL") && (
                      <Button size="sm" variant="outline" onClick={() => setSuspendTarget(t)}>Suspender</Button>
                    )}
                    {t.status === "SUSPENDED" && (
                      <Button size="sm" variant="outline" onClick={() => setReactivateTarget(t)}>Reativar</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ReasonDialog
        open={!!suspendTarget}
        onOpenChange={(o) => !o && setSuspendTarget(null)}
        title={suspendTarget ? `Suspender ${suspendTarget.name}?` : ""}
        description="O tenant ficará inacessível até ser reativado. O motivo será registrado em auditoria."
        confirmLabel="Suspender"
        destructive
        busy={busy}
        onConfirm={doSuspend}
      />

      <Dialog open={!!reactivateTarget} onOpenChange={(o) => !o && setReactivateTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">
              Reativar {reactivateTarget?.name}?
            </DialogTitle>
            <DialogDescription>O tenant voltará a operar normalmente.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReactivateTarget(null)} disabled={busy}>Cancelar</Button>
            <Button onClick={doReactivate} disabled={busy}>{busy ? "Aguarde…" : "Reativar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
