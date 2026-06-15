import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { ActiveBadge } from "@/components/app/fsm-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import {
  COMMUNICATION_AUDIENCE_LABELS, COMMUNICATION_CHANNEL_LABELS,
  COMMUNICATION_EVENT_TYPE_LABELS, TEMPLATE_VARIABLES_BY_EVENT,
  type CommunicationAudience, type CommunicationChannel, type CommunicationEventType,
} from "@/lib/constants";
import { mockCommTemplates, type CommTemplate } from "@/lib/mock/fase4";

export const Route = createFileRoute("/_authenticated/comunicacao/")({
  head: () => ({ meta: [{ title: "Comunicação — Templates — Paladino" }] }),
  component: CommTemplatesPage,
});

const EVENTS = Object.keys(COMMUNICATION_EVENT_TYPE_LABELS) as CommunicationEventType[];
const CHANNELS = Object.keys(COMMUNICATION_CHANNEL_LABELS) as CommunicationChannel[];
const AUDIENCES = Object.keys(COMMUNICATION_AUDIENCE_LABELS) as CommunicationAudience[];

function CommTemplatesPage() {
  const { role } = useAuth();
  if (role !== "OWNER" && role !== "ADMIN") {
    return <EmptyState title="Sem acesso" description="Apenas Proprietário e Administrador." />;
  }

  const [items, setItems] = useState<CommTemplate[]>(mockCommTemplates);
  const [channel, setChannel] = useState<"ALL" | CommunicationChannel>("ALL");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CommTemplate | null>(null);

  const filtered = useMemo(() => items.filter((t) => channel === "ALL" || t.channel === channel), [items, channel]);

  function save(t: CommTemplate) {
    setItems((xs) => {
      const exists = xs.some((x) => x.template_id === t.template_id);
      return exists ? xs.map((x) => x.template_id === t.template_id ? t : x) : [...xs, t];
    });
    toast.success(editing ? "Template atualizado" : "Template criado");
    setOpen(false); setEditing(null);
  }

  function remove(id: string) {
    setItems((xs) => xs.filter((x) => x.template_id !== id));
    toast.success("Template excluído");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Comunicação"
        title="Templates"
        description="Mensagens automáticas por evento, canal e público."
        actions={
          <>
            <Button variant="outline" asChild><Link to="/comunicacao/logs">Logs</Link></Button>
            <Button onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus size={16} strokeWidth={1.5} /> Novo template
            </Button>
          </>
        }
      />

      <Tabs value={channel} onValueChange={(v) => setChannel(v as typeof channel)}>
        <TabsList>
          <TabsTrigger value="ALL">Todos</TabsTrigger>
          {CHANNELS.map((c) => <TabsTrigger key={c} value={c}>{COMMUNICATION_CHANNEL_LABELS[c]}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhum template" description="Crie um template para este canal." />
      ) : (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Público</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead>Padrão</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.template_id}>
                  <TableCell>{COMMUNICATION_EVENT_TYPE_LABELS[t.event_type]}</TableCell>
                  <TableCell>{COMMUNICATION_CHANNEL_LABELS[t.channel]}</TableCell>
                  <TableCell>{COMMUNICATION_AUDIENCE_LABELS[t.audience]}</TableCell>
                  <TableCell><ActiveBadge active={t.is_active} /></TableCell>
                  <TableCell>{t.is_default && <Badge variant="outline" className="font-normal">Padrão</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(t); setOpen(true); }}>
                      <Pencil size={16} strokeWidth={1.5} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(t.template_id)}>
                      <Trash2 size={16} strokeWidth={1.5} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TemplateDialog open={open} onOpenChange={setOpen} editing={editing} onSave={save} />
    </div>
  );
}

function TemplateDialog({ open, onOpenChange, editing, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void; editing: CommTemplate | null;
  onSave: (t: CommTemplate) => void;
}) {
  const [event, setEvent] = useState<CommunicationEventType>(editing?.event_type ?? "appointment.confirmed");
  const [channel, setChannel] = useState<CommunicationChannel>(editing?.channel ?? "WHATSAPP");
  const [audience, setAudience] = useState<CommunicationAudience>(editing?.audience ?? "CLIENT");
  const [body, setBody] = useState(editing?.body_template ?? "");
  const [active, setActive] = useState(editing?.is_active ?? true);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function reset() {
    setEvent(editing?.event_type ?? "appointment.confirmed");
    setChannel(editing?.channel ?? "WHATSAPP");
    setAudience(editing?.audience ?? "CLIENT");
    setBody(editing?.body_template ?? "");
    setActive(editing?.is_active ?? true);
  }

  function insertVar(v: string) {
    const el = textareaRef.current;
    const token = `{{${v}}}`;
    if (!el) { setBody(body + token); return; }
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const next = body.slice(0, start) + token + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + token.length;
    });
  }

  const vars = TEMPLATE_VARIABLES_BY_EVENT[event] ?? [];

  function preview(): string {
    const examples: Record<string, string> = {
      cliente_nome: "Lucas", servico: "Corte masculino", profissional: "Marcos",
      data: "20/06", horario: "14:30", empresa_nome: "Barbearia do Zeca",
      manage_url: "https://paladino.app/g/abc", nps_url: "https://paladino.app/nps/x",
      token: "ABC123", user_name: "Ana", company_name: "Barbearia do Zeca",
      activation_link: "https://paladino.app/i/x", nota: "5",
      comentario: "Esperei muito tempo.", customer_name: "Lucas",
      phone: "+55 11 99999-9999", panel_url: "https://paladino.app/inbox",
    };
    return body.replace(/\{\{(\w+)\}\}/g, (_, k) => examples[k] ?? `{{${k}}}`);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v) reset(); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{editing ? "Editar template" : "Novo template"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Evento</Label>
              {editing ? (
                <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  {COMMUNICATION_EVENT_TYPE_LABELS[event]}
                </p>
              ) : (
                <Select value={event} onValueChange={(v) => setEvent(v as CommunicationEventType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENTS.map((e) => <SelectItem key={e} value={e}>{COMMUNICATION_EVENT_TYPE_LABELS[e]}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Canal</Label>
                {editing ? (
                  <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">{COMMUNICATION_CHANNEL_LABELS[channel]}</p>
                ) : (
                  <Select value={channel} onValueChange={(v) => setChannel(v as CommunicationChannel)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CHANNELS.map((c) => <SelectItem key={c} value={c}>{COMMUNICATION_CHANNEL_LABELS[c]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Público</Label>
                {editing ? (
                  <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">{COMMUNICATION_AUDIENCE_LABELS[audience]}</p>
                ) : (
                  <Select value={audience} onValueChange={(v) => setAudience(v as CommunicationAudience)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AUDIENCES.map((a) => <SelectItem key={a} value={a}>{COMMUNICATION_AUDIENCE_LABELS[a]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Corpo</Label>
              <Textarea ref={textareaRef} rows={8} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Digite o corpo da mensagem…" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Variáveis disponíveis</Label>
              <div className="flex flex-wrap gap-1.5">
                {vars.map((v) => (
                  <button key={v} type="button" onClick={() => insertVar(v)}
                    className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-mono hover:bg-accent">
                    {`{{${v}}}`}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <span className="text-sm">Ativo</span>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base font-normal">Pré-visualização</CardTitle></CardHeader>
            <CardContent>
              {channel === "WHATSAPP" ? (
                <div className="min-h-40 rounded-md bg-emerald-500/5 p-4">
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-emerald-600/90 px-3 py-2 text-sm text-emerald-50 shadow-sm whitespace-pre-wrap">
                    {preview() || <span className="italic opacity-70">Mensagem aparece aqui…</span>}
                  </div>
                </div>
              ) : channel === "EMAIL" ? (
                <div className="space-y-2 rounded-md border border-border bg-card p-3 text-sm">
                  <div className="border-b border-border pb-2 text-xs text-muted-foreground">
                    <p>De: Paladino</p>
                    <p>Para: cliente@exemplo.com</p>
                  </div>
                  <p className="whitespace-pre-wrap">{preview() || <span className="italic text-muted-foreground">Mensagem aparece aqui…</span>}</p>
                </div>
              ) : (
                <div className="rounded-md border border-border bg-card p-3 font-mono text-xs whitespace-pre-wrap">
                  {preview() || <span className="italic text-muted-foreground">Mensagem aparece aqui…</span>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={!body.trim()} onClick={() => onSave({
            template_id: editing?.template_id ?? `tpl-${Date.now()}`,
            company_id: "shop-1",
            event_type: event, channel, audience,
            body_template: body, is_active: active,
            is_default: editing?.is_default ?? false,
          })}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}