import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { CommunicationLogBadge } from "@/components/app/fsm-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import {
  COMMUNICATION_CHANNEL_LABELS, COMMUNICATION_EVENT_TYPE_LABELS,
  COMMUNICATION_LOG_STATUS_LABELS,
} from "@/lib/constants";
import { mockCommLogs, type CommLog } from "@/lib/mock/fase4";

export const Route = createFileRoute("/_authenticated/comunicacao/logs")({
  head: () => ({ meta: [{ title: "Comunicação — Logs — Paladino" }] }),
  component: CommLogsPage,
});

const LIMIT = 20;

function CommLogsPage() {
  const { role } = useAuth();
  if (role !== "OWNER" && role !== "ADMIN") {
    return <EmptyState title="Sem acesso" description="Apenas Proprietário e Administrador." />;
  }

  const [event, setEvent] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [channel, setChannel] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<CommLog | null>(null);

  const filteredAll = useMemo(() => mockCommLogs.filter((l) => {
    if (event !== "ALL" && l.event_type !== event) return false;
    if (status !== "ALL" && l.status !== status) return false;
    if (channel !== "ALL" && l.channel !== channel) return false;
    if (from && l.created_at < from) return false;
    if (to && l.created_at > to) return false;
    return true;
  }), [event, status, channel, from, to]);

  const items = filteredAll.slice((page - 1) * LIMIT, page * LIMIT);
  const hasNext = items.length === LIMIT;

  function resetFilters<T>(fn: (v: T) => void, v: T) { fn(v); setPage(1); }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Comunicação"
        title="Logs"
        description="Histórico de mensagens enviadas, agendadas, falhas e ignoradas."
        actions={<Button variant="outline" asChild><Link to="/comunicacao">Templates</Link></Button>}
      />

      <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card/40 p-3">
        <Filter label="Evento">
          <Select value={event} onValueChange={(v) => resetFilters(setEvent, v)}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {Object.entries(COMMUNICATION_EVENT_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Filter>
        <Filter label="Status">
          <Select value={status} onValueChange={(v) => resetFilters(setStatus, v)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {Object.entries(COMMUNICATION_LOG_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Filter>
        <Filter label="Canal">
          <Select value={channel} onValueChange={(v) => resetFilters(setChannel, v)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {Object.entries(COMMUNICATION_CHANNEL_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Filter>
        <Filter label="De"><Input type="date" value={from} onChange={(e) => resetFilters(setFrom, e.target.value)} /></Filter>
        <Filter label="Até"><Input type="date" value={to} onChange={(e) => resetFilters(setTo, e.target.value)} /></Filter>
      </div>

      {items.length === 0 ? (
        <EmptyState title="Sem registros" description="Ajuste os filtros para ver mensagens." />
      ) : (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Destinatário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((l) => (
                <TableRow key={l.log_id}>
                  <TableCell className="text-muted-foreground">{formatDateTime(l.created_at)}</TableCell>
                  <TableCell>{COMMUNICATION_EVENT_TYPE_LABELS[l.event_type]}</TableCell>
                  <TableCell>{COMMUNICATION_CHANNEL_LABELS[l.channel]}</TableCell>
                  <TableCell className="font-mono text-xs">{l.recipient_type}·{l.recipient_id}</TableCell>
                  <TableCell><CommunicationLogBadge status={l.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setOpen(l)}>
                      <Eye size={16} strokeWidth={1.5} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Página {page}</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={16} strokeWidth={1.5} /> Anterior
          </Button>
          <Button size="sm" variant="outline" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
            Próxima <ChevronRight size={16} strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {open && (
            <div className="space-y-4">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl tracking-wide">{COMMUNICATION_EVENT_TYPE_LABELS[open.event_type]}</SheetTitle>
              </SheetHeader>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Status</p>
                <CommunicationLogBadge status={open.status} />
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Corpo renderizado</p>
                <p className="whitespace-pre-wrap rounded-md border border-border bg-card/40 p-3">{open.rendered_body ?? "—"}</p>
              </div>
              {open.error_message && (
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Erro</p>
                  <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive">{open.error_message}</p>
                </div>
              )}
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