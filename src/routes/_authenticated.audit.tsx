import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Eye, ChevronLeft, ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth, ROLE_LABELS } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import {
  mockAuditLogs, mockImpersonationAccesses,
  type AuditLog, type ImpersonationAccess,
} from "@/lib/mock/fase4";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({ meta: [{ title: "Auditoria — Paladino" }] }),
  component: AuditPage,
});

const LIMIT = 25;

function AuditPage() {
  const { role } = useAuth();
  if (role !== "OWNER" && role !== "ADMIN") {
    return <EmptyState title="Sem acesso" description="Apenas Proprietário e Administrador." />;
  }

  const [action, setAction] = useState("");
  const [actor, setActor] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [impPage, setImpPage] = useState(1);
  const [openLog, setOpenLog] = useState<AuditLog | null>(null);
  const [openImp, setOpenImp] = useState<ImpersonationAccess | null>(null);

  const filtered = useMemo(() => mockAuditLogs.filter((l) => {
    if (action && !l.action.includes(action)) return false;
    if (actor && l.actor_id !== actor) return false;
    if (from && l.occurred_at < from) return false;
    if (to && l.occurred_at > to) return false;
    return true;
  }), [action, actor, from, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const items = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const impItems = mockImpersonationAccesses.slice((impPage - 1) * LIMIT, impPage * LIMIT);
  const impTotalPages = Math.max(1, Math.ceil(mockImpersonationAccesses.length / LIMIT));

  function exportCsv() {
    if (role !== "OWNER") return;
    toast.success("CSV gerado · download iniciado");
  }

  const isOwner = role === "OWNER";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Auditoria"
        description="Trilha imutável de ações e acessos. Somente leitura."
        actions={
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button variant="outline" disabled={!isOwner} onClick={exportCsv}>
                    <Download size={16} strokeWidth={1.5} /> Exportar CSV
                  </Button>
                </span>
              </TooltipTrigger>
              {!isOwner && <TooltipContent>Exportação disponível apenas ao Proprietário.</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        }
      />

      <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card/40 p-3">
        <Filter label="Ação contém"><Input value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} placeholder="user.role_changed" /></Filter>
        <Filter label="Ator ID"><Input value={actor} onChange={(e) => { setActor(e.target.value); setPage(1); }} placeholder="u-1" /></Filter>
        <Filter label="De"><Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} /></Filter>
        <Filter label="Até"><Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} /></Filter>
      </div>

      <Tabs defaultValue="trail">
        <TabsList>
          <TabsTrigger value="trail">Trilha</TabsTrigger>
          <TabsTrigger value="impersonation">Acessos de impersonation</TabsTrigger>
        </TabsList>

        <TabsContent value="trail" className="space-y-3">
          {items.length === 0 ? (
            <EmptyState title="Sem registros" description="Nenhuma ação para os filtros aplicados." />
          ) : (
            <div className="rounded-md border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Ator</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead className="w-20 text-right">Snap.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((l) => (
                    <TableRow key={l.audit_id}>
                      <TableCell className="text-muted-foreground">{formatDateTime(l.occurred_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{l.actor_id}</span>
                          <Badge variant="outline" className="font-normal">{ROLE_LABELS[l.actor_role]}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{l.action}</TableCell>
                      <TableCell className="font-mono text-xs">{l.resource_type}·{l.resource_id ?? "—"}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">{l.reason ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{l.ip_address ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => setOpenLog(l)}>
                          <Eye size={16} strokeWidth={1.5} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <Pager page={page} total={totalPages} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
        </TabsContent>

        <TabsContent value="impersonation" className="space-y-3">
          {impItems.length === 0 ? (
            <EmptyState title="Sem acessos" description="Nenhum acesso de impersonation registrado." />
          ) : (
            <div className="rounded-md border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Grant</TableHead>
                    <TableHead>Ator</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead className="w-20 text-right">Req.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {impItems.map((i) => (
                    <TableRow key={i.audit_id}>
                      <TableCell className="text-muted-foreground">{formatDateTime(i.occurred_at)}</TableCell>
                      <TableCell className="font-mono text-xs">{i.grant_id ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{i.actor_id}</TableCell>
                      <TableCell className="max-w-md truncate text-muted-foreground">{i.reason ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => setOpenImp(i)}>
                          <Eye size={16} strokeWidth={1.5} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <Pager page={impPage} total={impTotalPages} onPrev={() => setImpPage((p) => p - 1)} onNext={() => setImpPage((p) => p + 1)} />
        </TabsContent>
      </Tabs>

      <Sheet open={!!openLog} onOpenChange={(v) => !v && setOpenLog(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          {openLog && (
            <div className="space-y-4">
              <SheetHeader><SheetTitle className="font-display text-2xl tracking-wide">Snapshot</SheetTitle></SheetHeader>
              <Snap title="Antes" data={openLog.before_snapshot} />
              <Snap title="Depois" data={openLog.after_snapshot} />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!openImp} onOpenChange={(v) => !v && setOpenImp(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          {openImp && (
            <div className="space-y-4">
              <SheetHeader><SheetTitle className="font-display text-2xl tracking-wide">Requisição</SheetTitle></SheetHeader>
              <Snap title="Payload" data={openImp.request} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label>{children}</div>;
}

function Snap({ title, data }: { title: string; data?: Record<string, unknown> }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      <pre className="max-h-72 overflow-auto rounded-md border border-border bg-card/40 p-3 text-xs">
        {data ? JSON.stringify(data, null, 2) : "—"}
      </pre>
    </div>
  );
}

function Pager({ page, total, onPrev, onNext }: { page: number; total: number; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-muted-foreground">Página {page} de {total}</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={onPrev}>
          <ChevronLeft size={16} strokeWidth={1.5} /> Anterior
        </Button>
        <Button size="sm" variant="outline" disabled={page >= total} onClick={onNext}>
          Próxima <ChevronRight size={16} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}