import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { ErrorState } from "@/components/app/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { TenantStatusBadge } from "@/components/owner/tenant-status-badge";
import { ReasonDialog } from "@/components/owner/reason-dialog";
import { getTenant, getTenantHealth, setTenantStatus } from "@/lib/owner/api";
import type { TenantSummary, TenantHealth } from "@/lib/owner/types";

export const Route = createFileRoute("/owner/tenants/$id/")({
  head: () => ({ meta: [{ title: "Tenant — Plataforma" }] }),
  component: TenantDetailPage,
});

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl tracking-wide">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

function TenantDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<TenantSummary | null>(null);
  const [tenantErr, setTenantErr] = useState<string | null>(null);
  const [tenantLoading, setTenantLoading] = useState(true);
  const [health, setHealth] = useState<TenantHealth | null>(null);
  const [healthErr, setHealthErr] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function loadTenant() {
    setTenantLoading(true); setTenantErr(null);
    try { setTenant(await getTenant(id)); }
    catch (e) { setTenantErr(e instanceof Error ? e.message : "Falha"); }
    finally { setTenantLoading(false); }
  }
  async function loadHealth() {
    setHealthLoading(true); setHealthErr(null);
    try { setHealth(await getTenantHealth(id)); }
    catch (e) { setHealthErr(e instanceof Error ? e.message : "Falha"); }
    finally { setHealthLoading(false); }
  }
  useEffect(() => { loadTenant(); loadHealth(); /* eslint-disable-next-line */ }, [id]);

  async function doSuspend(reason: string) {
    setBusy(true);
    try {
      const u = await setTenantStatus(id, "SUSPENDED", reason);
      setTenant(u); setSuspendOpen(false);
    } finally { setBusy(false); }
  }
  async function doReactivate() {
    setBusy(true);
    try {
      const u = await setTenantStatus(id, "ACTIVE");
      setTenant(u); setReactivateOpen(false);
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate({ to: "/owner/tenants" })}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} strokeWidth={1.5} /> Tenants
      </button>

      {tenantLoading ? (
        <Skeleton className="h-12 w-72" />
      ) : tenantErr || !tenant ? (
        <ErrorState onRetry={loadTenant} />
      ) : (
        <PageHeader
          title={tenant.name}
          eyebrow={tenant.slug}
          actions={
            <div className="flex items-center gap-2">
              <TenantStatusBadge status={tenant.status} />
              {(tenant.status === "ACTIVE" || tenant.status === "TRIAL") && (
                <Button variant="outline" size="sm" onClick={() => setSuspendOpen(true)}>Suspender</Button>
              )}
              {tenant.status === "SUSPENDED" && (
                <Button variant="outline" size="sm" onClick={() => setReactivateOpen(true)}>Reativar</Button>
              )}
            </div>
          }
        />
      )}

      {tenant && (
        <section className="space-y-3">
          <h2 className="font-display text-xl tracking-wide">Dados</h2>
          <Card className="p-5">
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div><dt className="text-xs text-muted-foreground">Nome</dt><dd>{tenant.name}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Slug</dt><dd>{tenant.slug}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Ativo</dt><dd>{tenant.active ? "Sim" : "Não"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Criado em</dt><dd>{fmtDate(tenant.created_at)}</dd></div>
            </dl>
          </Card>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl tracking-wide">Saúde</h2>
          <Link
            to="/owner/tenants/$id/flags"
            params={{ id }}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Feature flags <ChevronRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
        {healthLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : healthErr || !health ? (
          <ErrorState onRetry={loadHealth} description="Não foi possível carregar a saúde deste tenant." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              <Kpi label="Usuários" value={health.total_users} />
              <Kpi label="Clientes" value={health.total_customers} />
              <Kpi label="Agendamentos (30d)" value={health.appointments_30d} />
              <Kpi label="Último acesso" value={health.last_activity_at ? fmtDate(health.last_activity_at) : "Nunca"} />
              <Kpi label="Falhas comunic. (7d)" value={health.communication_failures_7d} />
            </div>
            <Card className="p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Integrações</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Asaas</span>
                  <Badge variant={health.asaas_connected ? "default" : "outline"} className="font-normal">
                    {health.asaas_connected ? "Conectado" : "Não conectado"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">WhatsApp</span>
                  <Badge variant={health.whatsapp_connected ? "default" : "outline"} className="font-normal">
                    {health.whatsapp_connected ? "Conectado" : "Não conectado"}
                  </Badge>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Credenciais nunca são exibidas. O backend retorna apenas o status de conexão.
              </p>
            </Card>
          </>
        )}
      </section>

      <ReasonDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        title={`Suspender ${tenant?.name ?? ""}?`}
        description="O tenant ficará inacessível até ser reativado. O motivo será registrado em auditoria."
        confirmLabel="Suspender"
        destructive
        busy={busy}
        onConfirm={doSuspend}
      />
      <Dialog open={reactivateOpen} onOpenChange={setReactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">Reativar {tenant?.name}?</DialogTitle>
            <DialogDescription>O tenant voltará a operar normalmente.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReactivateOpen(false)} disabled={busy}>Cancelar</Button>
            <Button onClick={doReactivate} disabled={busy}>{busy ? "Aguarde…" : "Reativar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
