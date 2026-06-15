import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, Upload, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { StatementBadge } from "@/components/app/fsm-badge";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatBRLFromDecimal, formatDateTime } from "@/lib/format";
import {
  mockStatementBatches, mockStatementLines, mockAccounts, mockAccountMovements,
  accountName, type StatementLine,
} from "@/lib/mock/fase3";
import { STATEMENT_STATUS, MOVEMENT_TYPE, type StatementStatus } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/financeiro/extrato")({
  component: ExtratoPage,
});

function ExtratoPage() {
  const [lines, setLines] = useState<StatementLine[]>(mockStatementLines);
  const [status, setStatus] = useState<"ALL" | StatementStatus>("ALL");
  const [batch, setBatch] = useState("ALL");
  const [acc, setAcc] = useState("ALL");
  const [importing, setImporting] = useState(false);
  const [matching, setMatching] = useState<StatementLine | null>(null);
  const [dismissing, setDismissing] = useState<StatementLine | null>(null);

  const filtered = useMemo(() => lines.filter((l) => {
    if (status !== "ALL" && l.status !== status) return false;
    if (batch !== "ALL" && l.batch_id !== batch) return false;
    if (acc !== "ALL" && l.account_id !== acc) return false;
    return true;
  }), [lines, status, batch, acc]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financeiro"
        title="Extrato bancário"
        description="Importação CSV, match e dispensa de lançamentos."
        actions={<Button size="sm" onClick={() => setImporting(true)}><Upload size={16} strokeWidth={1.5} />Importar CSV</Button>}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {mockStatementBatches.map((b) => (
          <Card key={b.batch_id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{accountName(b.account_id)}</p>
                <h3 className="mt-1 font-display text-lg">{b.batch_id}</h3>
                <p className="text-xs text-muted-foreground">{formatDateTime(b.created_at)}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              <div><p className="font-display text-xl">{b.total}</p><p className="text-muted-foreground">Total</p></div>
              <div><p className="font-display text-xl text-success">{b.matched}</p><p className="text-muted-foreground">Conciliado</p></div>
              <div><p className="font-display text-xl text-amber-700 dark:text-amber-300">{b.pending}</p><p className="text-muted-foreground">Pendente</p></div>
              <div><p className="font-display text-xl text-muted-foreground">{b.dismissed}</p><p className="text-muted-foreground">Dispensado</p></div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {Object.entries(STATEMENT_STATUS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Lote</Label>
            <Select value={batch} onValueChange={setBatch}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {mockStatementBatches.map((b) => <SelectItem key={b.batch_id} value={b.batch_id}>{b.batch_id}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Conta</Label>
            <Select value={acc} onValueChange={setAcc}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {mockAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? <EmptyState icon={<FileSpreadsheet size={28} strokeWidth={1.5} />} title="Nenhum lançamento" /> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-32">Valor</TableHead>
                <TableHead className="w-28">Direção</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-56 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-muted-foreground text-xs">{formatDateTime(l.occurred_at)}</TableCell>
                  <TableCell>{l.description}</TableCell>
                  <TableCell>{formatBRLFromDecimal(l.amount)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{l.direction === "INFLOW" ? "Entrada" : "Saída"}</TableCell>
                  <TableCell><StatementBadge status={l.status} /></TableCell>
                  <TableCell className="text-right">
                    {l.status === "PENDING" && (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setMatching(l)}>
                          <CheckCircle2 size={16} strokeWidth={1.5} />Ver sugestões
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDismissing(l)}>
                          <XCircle size={16} strokeWidth={1.5} />Dispensar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ImportDialog open={importing} onClose={() => setImporting(false)} />
      <MatchDialog line={matching} onClose={() => setMatching(null)}
        onMatch={(id) => {
          setLines((prev) => prev.map((x) => x.id === id ? { ...x, status: "MATCHED" } : x));
          toast.success("Match confirmado");
          setMatching(null);
        }}
      />
      <DismissDialog line={dismissing} onClose={() => setDismissing(null)}
        onDismiss={(id) => {
          setLines((prev) => prev.map((x) => x.id === id ? { ...x, status: "DISMISSED" } : x));
          toast.success("Lançamento dispensado");
          setDismissing(null);
        }}
      />
    </div>
  );
}

function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [account, setAccount] = useState("");
  const [mapping, setMapping] = useState({ date: "data", amount: "valor", description: "descricao", direction: "" });
  const [preview, setPreview] = useState<string[][]>([]);
  const [progress, setProgress] = useState(0);
  const [sending, setSending] = useState(false);

  const onFile = (f: File | null) => {
    setFile(f); setPreview([]);
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const rows = text.split(/\r?\n/).slice(0, 6).map((r) => r.split(/[,;]/));
      setPreview(rows);
    };
    reader.readAsText(f);
  };

  const submit = () => {
    setSending(true); setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 10;
      });
    }, 100);
    setTimeout(() => {
      clearInterval(interval); setProgress(100); setSending(false);
      toast.success("Importação concluída", {
        description: "42 importados · 0 inválidos · 3 duplicados · 28 auto-matched",
      });
      onClose(); setFile(null); setPreview([]); setProgress(0);
    }, 1200);
  };

  const canSubmit = file && account && mapping.date && mapping.amount;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar extrato CSV</DialogTitle>
          <DialogDescription>Multipart: file + account_id + column_mapping (JSON).</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Conta</Label>
            <Select value={account} onValueChange={setAccount}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {mockAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div
            className="cursor-pointer rounded-md border-2 border-dashed border-border bg-card/40 px-6 py-10 text-center hover:bg-card/60"
            onClick={() => ref.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0] ?? null); }}
          >
            <Upload size={28} strokeWidth={1.5} className="mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm">{file ? file.name : "Arraste o CSV ou clique para selecionar"}</p>
            <input ref={ref} type="file" accept=".csv" hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-md border border-border p-3">
            <div className="space-y-1"><Label className="text-xs">Coluna data *</Label><Input value={mapping.date} onChange={(e) => setMapping({ ...mapping, date: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Coluna valor *</Label><Input value={mapping.amount} onChange={(e) => setMapping({ ...mapping, amount: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Coluna descrição</Label><Input value={mapping.description} onChange={(e) => setMapping({ ...mapping, description: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Coluna direção</Label><Input value={mapping.direction} onChange={(e) => setMapping({ ...mapping, direction: e.target.value })} /></div>
          </div>

          {preview.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Preview (5 primeiras linhas)</Label>
              <div className="mt-1 overflow-x-auto rounded-md border border-border">
                <table className="w-full text-xs">
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        {r.map((c, j) => <td key={j} className="px-2 py-1 text-muted-foreground">{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {sending && <Progress value={progress} />}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canSubmit || sending} onClick={submit}>Importar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MatchDialog({ line, onClose, onMatch }: {
  line: StatementLine | null; onClose: () => void; onMatch: (id: string) => void;
}) {
  const [pick, setPick] = useState("");
  const suggestions = mockAccountMovements.slice(0, 3);
  return (
    <Dialog open={!!line} onOpenChange={(o) => { if (!o) { onClose(); setPick(""); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sugestões de match</DialogTitle>
          <DialogDescription>{line?.description} — {formatBRLFromDecimal(line?.amount)}</DialogDescription>
        </DialogHeader>
        <RadioGroup value={pick} onValueChange={setPick} className="space-y-2">
          {suggestions.map((s) => (
            <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 hover:bg-card/60">
              <RadioGroupItem value={s.id} />
              <div className="flex-1">
                <p className="text-sm">{MOVEMENT_TYPE[s.type]} · {formatBRLFromDecimal(s.amount)}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(s.occurred_at)} · {s.source}</p>
              </div>
            </label>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!pick} onClick={() => line && onMatch(line.id)}>Confirmar match</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DismissDialog({ line, onClose, onDismiss }: {
  line: StatementLine | null; onClose: () => void; onDismiss: (id: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={!!line} onOpenChange={(o) => { if (!o) { onClose(); setReason(""); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dispensar lançamento</DialogTitle>
          <DialogDescription>Motivo é obrigatório.</DialogDescription>
        </DialogHeader>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explique o motivo da dispensa" />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" disabled={!reason.trim()} onClick={() => line && onDismiss(line.id)}>Dispensar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}