import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { NpsSurveyBadge, NpsScoreChip } from "@/components/app/fsm-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { mockNpsSurveys, type NpsSurvey } from "@/lib/mock/fase4";

export const Route = createFileRoute("/_authenticated/nps/")({
  head: () => ({ meta: [{ title: "NPS — Pesquisas — Paladino" }] }),
  component: NpsListPage,
});

function NpsListPage() {
  const { role } = useAuth();
  if (role !== "OWNER" && role !== "ADMIN") {
    return <EmptyState title="Sem acesso" description="Apenas Proprietário e Administrador." />;
  }

  const [surveys, setSurveys] = useState<NpsSurvey[]>(mockNpsSurveys);
  const [status, setStatus] = useState<string>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState<NpsSurvey | null>(null);

  const filtered = useMemo(() => surveys.filter((s) => {
    if (status !== "ALL" && s.status !== status) return false;
    if (from && s.scheduled_for < from) return false;
    if (to && s.scheduled_for > to) return false;
    return true;
  }), [surveys, status, from, to]);

  function reply(id: string, text: string) {
    setSurveys((xs) => xs.map((s) => s.id === id && s.response
      ? { ...s, response: { ...s.response, tenant_response: text } }
      : s));
    toast.success("Resposta enviada");
    setOpen(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="NPS"
        title="Pesquisas"
        description="Acompanhe envios, respostas e notas de satisfação."
        actions={
          <Button variant="outline" asChild>
            <Link to="/nps/config">Configuração</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card/40 p-3">
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="SENT">Enviada</SelectItem>
              <SelectItem value="RESPONDED">Respondida</SelectItem>
              <SelectItem value="EXPIRED">Expirada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">De</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Até</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhuma pesquisa" description="Ajuste os filtros para ver resultados." />
      ) : (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agendada</TableHead>
                <TableHead>Enviada</TableHead>
                <TableHead>Respondida</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead className="w-20 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.customer_name}</TableCell>
                  <TableCell><NpsSurveyBadge status={s.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(s.scheduled_for)}</TableCell>
                  <TableCell className="text-muted-foreground">{s.sent_at ? formatDateTime(s.sent_at) : "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{s.responded_at ? formatDateTime(s.responded_at) : "—"}</TableCell>
                  <TableCell><NpsScoreChip score={s.response?.score} /></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setOpen(s)}>
                      <Eye size={16} strokeWidth={1.5} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DetailSheet survey={open} onClose={() => setOpen(null)} onReply={reply} />
    </div>
  );
}

function DetailSheet({ survey, onClose, onReply }: {
  survey: NpsSurvey | null;
  onClose: () => void;
  onReply: (id: string, text: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <Sheet open={!!survey} onOpenChange={(v) => { if (!v) { onClose(); setText(""); } }}>
      <SheetContent className="w-full sm:max-w-md">
        {survey && (
          <div className="space-y-4">
            <SheetHeader>
              <SheetTitle className="font-display text-2xl tracking-wide">{survey.customer_name}</SheetTitle>
            </SheetHeader>
            <div className="space-y-2 text-sm">
              <Row k="Status"><NpsSurveyBadge status={survey.status} /></Row>
              <Row k="Agendada">{formatDateTime(survey.scheduled_for)}</Row>
              {survey.sent_at && <Row k="Enviada">{formatDateTime(survey.sent_at)}</Row>}
              {survey.responded_at && <Row k="Respondida">{formatDateTime(survey.responded_at)}</Row>}
              <Row k="Expira">{formatDateTime(survey.expires_at)}</Row>
            </div>
            {survey.response && (
              <div className="space-y-2 rounded-md border border-border bg-card/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Resposta</span>
                  <NpsScoreChip score={survey.response.score} />
                </div>
                <p className="text-sm">{survey.response.comment ?? <span className="italic text-muted-foreground">Sem comentário</span>}</p>
              </div>
            )}
            {survey.response?.tenant_response ? (
              <div className="space-y-1 rounded-md border border-border p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Sua resposta</p>
                <p className="text-sm">{survey.response.tenant_response}</p>
              </div>
            ) : survey.status === "RESPONDED" && survey.response ? (
              <div className="space-y-2">
                <Label>Responder ao cliente</Label>
                <Textarea rows={4} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Mensagem ao cliente…" />
                <div className="flex justify-end">
                  <Button disabled={!text.trim()} onClick={() => onReply(survey.id, text.trim())}>Responder</Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span>{children}</span>
    </div>
  );
}