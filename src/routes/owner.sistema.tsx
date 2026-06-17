import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { ErrorState } from "@/components/app/error-state";
import { EmptyState } from "@/components/app/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ReasonDialog } from "@/components/owner/reason-dialog";
import { listDeadLetter, redispatchCommunication, replayDeadLetter } from "@/lib/owner/api";
import { isFinancialModule } from "@/lib/owner/constants";
import type { DeadLetterItem, RedispatchResult } from "@/lib/owner/types";

export const Route = createFileRoute("/owner/sistema")({
  head: () => ({ meta: [{ title: "Sistema — Plataforma" }] }),
  component: SistemaPage,
});

function SistemaPage() {
  const [logId, setLogId] = useState("");
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<RedispatchResult | null>(null);
  const [redispatchErr, setRedispatchErr] = useState<string | null>(null);
  const [redispatching, setRedispatching] = useState(false);

  const [items, setItems] = useState<DeadLetterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listErr, setListErr] = useState<string | null>(null);
  const [replayTarget, setReplayTarget] = useState<DeadLetterItem | null>(null);
  const [replayBusy, setReplayBusy] = useState(false);

  async function loadDl() {
    setLoading(true); setListErr(null);
    try { setItems(await listDeadLetter()); }
    catch (e) { setListErr(e instanceof Error ? e.message : "Falha"); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadDl(); }, []);

  async function handleRedispatch() {
    setRedispatchErr(null); setResult(null);
    setRedispatching(true);
    try {
      const r = await redispatchCommunication(logId, reason);
      setResult(r);
    } catch (e) {
      setRedispatchErr(e instanceof Error ? e.message : "Falha");
    } finally { setRedispatching(false); }
  }

  async function handleReplay(motivo: string) {
    if (!replayTarget) return;
    setReplayBusy(true);
    try {
      await replayDeadLetter(replayTarget.id, motivo);
      setReplayTarget(null);
    } finally { setReplayBusy(false); }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Sistema" description="Operações de baixo nível na plataforma." />

      <Card className="p-5">
        <h2 className="font-display text-lg tracking-wide">Reenviar comunicação</h2>
        <p className="text-xs text-muted-foreground">
          Apenas logs com status FAILED são aceitos. Esta ação é registrada em auditoria.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>log_id (UUID)</Label>
            <Input value={logId} onChange={(e) => setLogId(e.target.value)} placeholder="00000000-0000-0000-0000-000000000000" />
          </div>
          <div className="space-y-1.5 md:row-span-2">
            <Label>Motivo</Label>
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
        {redispatchErr && <p className="mt-3 text-sm text-destructive">{redispatchErr}</p>}
        {result && (
          <div className="mt-3 rounded-md border border-border bg-muted/30 p-3 text-sm">
            <p><span className="text-muted-foreground">Novo log:</span> <span className="font-mono">{result.new_log_id}</span></p>
            <p><span className="text-muted-foreground">Status:</span> <Badge variant="secondary" className="font-normal">{result.status}</Badge></p>
            <p><span className="text-muted-foreground">Original:</span> <span className="font-mono">{result.original_log_id}</span></p>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button onClick={handleRedispatch} disabled={redispatching}>{redispatching ? "Enviando…" : "Reenviar"}</Button>
        </div>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl tracking-wide">Dead-letter / workers</h2>
          <Badge variant="outline" className="font-normal">Em breve · mock</Badge>
        </div>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : listErr ? (
          <ErrorState onRetry={loadDl} />
        ) : items.length === 0 ? (
          <EmptyState title="Sem eventos pendentes" description="A fila de dead-letter está vazia." />
        ) : (
          <div className="rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Erro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => {
                  const blocked = isFinancialModule(it.module);
                  return (
                    <TableRow key={it.id}>
                      <TableCell><Badge variant="outline" className="font-mono font-normal">{it.module}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{it.event}</TableCell>
                      <TableCell className="max-w-md truncate text-muted-foreground" title={it.error}>{it.error}</TableCell>
                      <TableCell className="text-right">
                        {blocked ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0}>
                                  <Button size="sm" variant="outline" disabled>Replay</Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Replay desabilitado para módulos financeiros.</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setReplayTarget(it)}>Replay</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <ReasonDialog
        open={!!replayTarget}
        onOpenChange={(o) => !o && setReplayTarget(null)}
        title={replayTarget ? `Replay · ${replayTarget.event}` : ""}
        description="O evento será reprocessado. O motivo é registrado em auditoria."
        confirmLabel="Replay"
        busy={replayBusy}
        onConfirm={handleReplay}
      />
    </div>
  );
}
