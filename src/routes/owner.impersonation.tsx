import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createGrant, listGrants, listTenants, revokeGrant } from "@/lib/owner/api";
import { useOwnerImpersonation } from "@/lib/owner/session";
import type { ImpersonationGrant, ImpersonationMode, TenantSummary } from "@/lib/owner/types";
import { IMPERSONATION_MODE_LABELS } from "@/lib/owner/constants";

export const Route = createFileRoute("/owner/impersonation")({
  head: () => ({ meta: [{ title: "Impersonation — Plataforma" }] }),
  component: ImpersonationPage,
});

function fmt(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function ImpersonationPage() {
  const { startGrant } = useOwnerImpersonation();
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [tenantsErr, setTenantsErr] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<ImpersonationMode>("READ_ONLY");
  const [duration, setDuration] = useState(30);
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [grants, setGrants] = useState<ImpersonationGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [listErr, setListErr] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ImpersonationGrant | null>(null);
  const [revoking, setRevoking] = useState(false);

  async function loadGrants() {
    setLoading(true); setListErr(null);
    try { setGrants(await listGrants()); }
    catch (e) { setListErr(e instanceof Error ? e.message : "Falha"); }
    finally { setLoading(false); }
  }

  async function loadTenants() {
    setTenantsErr(null);
    try {
      setTenants((await listTenants()).items);
    } catch (e) {
      setTenantsErr(e instanceof Error ? e.message : "Falha ao carregar tenants");
    }
  }

  useEffect(() => {
    loadTenants();
    loadGrants();
  }, []);

  const reasonInvalid = mode === "ELEVATED" && reason.trim().length < 20;

  async function handleCreate() {
    setCreateErr(null);
    if (!companyId) { setCreateErr("Selecione um tenant."); return; }
    if (!reason.trim()) { setCreateErr("Motivo é obrigatório."); return; }
    if (reasonInvalid) { setCreateErr("Modo elevado exige motivo com ≥ 20 caracteres."); return; }
    setCreating(true);
    try {
      const g = await createGrant({ company_id: companyId, mode, reason, duration_minutes: duration });
      startGrant({ grantId: g.grant_id, tenantName: g.tenant_name, mode: g.mode, expiresAt: g.expires_at });
      setReason(""); setCompanyId(""); setMode("READ_ONLY"); setDuration(30);
      await loadGrants();
    } catch (e) {
      setCreateErr(e instanceof Error ? e.message : "Falha ao criar acesso");
    } finally { setCreating(false); }
  }

  async function handleRevoke() {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await revokeGrant(revokeTarget.grant_id);
      setRevokeTarget(null);
      await loadGrants();
    } finally { setRevoking(false); }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Impersonation" description="Crie acessos temporários a tenants para investigação." />

      <Card className="p-5">
        <h2 className="font-display text-lg tracking-wide">Criar acesso</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Tenant</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>
                {tenants.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name} <span className="text-muted-foreground">· {t.slug}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tenantsErr && (
              <p className="text-xs text-destructive">
                Falha ao carregar tenants.{" "}
                <button type="button" className="underline" onClick={loadTenants}>
                  Tentar novamente
                </button>
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Modo</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as ImpersonationMode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="READ_ONLY">{IMPERSONATION_MODE_LABELS.READ_ONLY}</SelectItem>
                <SelectItem value="ELEVATED">{IMPERSONATION_MODE_LABELS.ELEVATED}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Duração (minutos)</Label>
            <Input
              type="number" min={1} max={480}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Motivo {mode === "ELEVATED" && <span className="text-muted-foreground">(mínimo 20 caracteres)</span>}</Label>
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
            {mode === "ELEVATED" && (
              <p className={`text-xs ${reasonInvalid ? "text-destructive" : "text-muted-foreground"}`}>
                {reason.trim().length}/20
              </p>
            )}
          </div>
        </div>
        {createErr && <p className="mt-3 text-sm text-destructive">{createErr}</p>}
        <div className="mt-4 flex justify-end">
          <Button onClick={handleCreate} disabled={creating}>{creating ? "Criando…" : "Criar acesso"}</Button>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="font-display text-xl tracking-wide">Grants ativos</h2>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : listErr ? (
          <ErrorState onRetry={loadGrants} />
        ) : grants.length === 0 ? (
          <EmptyState title="Nenhum acesso ativo" description="Crie um novo grant acima para iniciar uma sessão de impersonation." />
        ) : (
          <div className="rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Modo</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grants.map((g) => (
                  <TableRow key={g.grant_id}>
                    <TableCell>{g.tenant_name}</TableCell>
                    <TableCell>
                      <Badge variant={g.mode === "ELEVATED" ? "destructive" : "secondary"} className="font-normal">
                        {IMPERSONATION_MODE_LABELS[g.mode]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground" title={g.reason}>{g.reason}</TableCell>
                    <TableCell className="text-muted-foreground">{fmt(g.expires_at)}</TableCell>
                    <TableCell className="text-muted-foreground">{fmt(g.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setRevokeTarget(g)}>Encerrar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <Dialog open={!!revokeTarget} onOpenChange={(o) => !o && setRevokeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">Encerrar acesso?</DialogTitle>
            <DialogDescription>
              O grant em <strong>{revokeTarget?.tenant_name}</strong> será revogado imediatamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeTarget(null)} disabled={revoking}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRevoke} disabled={revoking}>{revoking ? "Aguarde…" : "Encerrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
