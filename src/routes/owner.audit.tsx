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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { distinctActions, listAudit } from "@/lib/owner/api";
import type { AuditItem } from "@/lib/owner/types";

export const Route = createFileRoute("/owner/audit")({
  head: () => ({ meta: [{ title: "Auditoria — Plataforma" }] }),
  component: AuditPage,
});

function fmt(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

function AuditPage() {
  const [tab, setTab] = useState<"all" | "imp">("all");
  const [companyId, setCompanyId] = useState("");
  const [actorId, setActorId] = useState("");
  const [action, setAction] = useState<string>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [items, setItems] = useState<AuditItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<AuditItem | null>(null);

  const actions = distinctActions();

  async function load() {
    setLoading(true); setError(null);
    try {
      const r = await listAudit({
        company_id: companyId || undefined,
        actor_id: actorId || undefined,
        action: tab === "imp" ? "impersonated_request" : (action !== "ALL" ? action : undefined),
        date_from: from || undefined,
        date_to: to || undefined,
        page, limit,
      });
      setItems(r.items); setTotal(r.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab, companyId, actorId, action, from, to, page, limit]);
  useEffect(() => { setPage(1); }, [tab, companyId, actorId, action, from, to, limit]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <PageHeader title="Auditoria" description="Registros append-only de todas as ações sensíveis da plataforma." />

      <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "imp")}>
        <TabsList>
          <TabsTrigger value="all">Tudo</TabsTrigger>
          <TabsTrigger value="imp">Impersonation</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="space-y-1.5">
            <Label className="text-xs">company_id</Label>
            <Input value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="t-001" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">actor_id</Label>
            <Input value={actorId} onChange={(e) => setActorId(e.target.value)} placeholder="user-1" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">action</Label>
            <Select value={action} onValueChange={setAction} disabled={tab === "imp"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">De</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Até</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum registro" description="Ajuste os filtros para ver mais resultados." />
      ) : (
        <>
          <div className="rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>company_id</TableHead>
                  <TableHead>Ator</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Ocorrido em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.audit_id} className="cursor-pointer" onClick={() => setOpen(it)}>
                    <TableCell className="font-mono text-xs">{it.company_id}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{it.actor_id}</span>
                      <Badge variant="outline" className="ml-2 font-normal">{it.actor_role}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{it.action}</TableCell>
                    <TableCell className="text-muted-foreground">{it.resource_type} <span className="font-mono text-xs">{it.resource_id}</span></TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground" title={it.reason ?? ""}>{it.reason ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{fmt(it.occurred_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">{total} registros</p>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Por página</Label>
              <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                <SelectTrigger className="w-[88px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
              <span className="text-muted-foreground">Página {page} de {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">Detalhes da auditoria</DialogTitle>
          </DialogHeader>
          {open && (
            <div className="space-y-3 text-sm">
              <dl className="grid grid-cols-2 gap-2">
                <div><dt className="text-xs text-muted-foreground">audit_id</dt><dd className="font-mono text-xs">{open.audit_id}</dd></div>
                <div><dt className="text-xs text-muted-foreground">company_id</dt><dd className="font-mono text-xs">{open.company_id}</dd></div>
                <div><dt className="text-xs text-muted-foreground">ator</dt><dd className="font-mono text-xs">{open.actor_id} <Badge variant="outline" className="ml-1 font-normal">{open.actor_role}</Badge></dd></div>
                <div><dt className="text-xs text-muted-foreground">ação</dt><dd className="font-mono text-xs">{open.action}</dd></div>
                <div><dt className="text-xs text-muted-foreground">recurso</dt><dd className="font-mono text-xs">{open.resource_type}/{open.resource_id}</dd></div>
                <div><dt className="text-xs text-muted-foreground">ocorrido em</dt><dd>{fmt(open.occurred_at)}</dd></div>
              </dl>
              {open.reason && (
                <div><p className="text-xs text-muted-foreground">motivo</p><p>{open.reason}</p></div>
              )}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">before</p>
                  <pre className="mt-1 max-h-60 overflow-auto rounded bg-muted/40 p-2 text-xs">{JSON.stringify(open.before_snapshot, null, 2)}</pre>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">after</p>
                  <pre className="mt-1 max-h-60 overflow-auto rounded bg-muted/40 p-2 text-xs">{JSON.stringify(open.after_snapshot, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
