import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatRelative, formatDateTime } from "@/lib/format";
import { mockConversations, type Conversation, type Message } from "@/lib/mock/fase1";

export const Route = createFileRoute("/_authenticated/inbox")({
  head: () => ({ meta: [{ title: "Atendimento humano — Paladino" }] }),
  component: InboxPage,
});

function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeId, setActiveId] = useState<string | null>(conversations.find((c) => c.status === "ESCALATED")?.id ?? null);
  const [tab, setTab] = useState<"ESCALATED" | "RESOLVED">("ESCALATED");
  const [reply, setReply] = useState("");

  const visible = conversations.filter((c) => c.status === tab);
  const active = conversations.find((c) => c.id === activeId);

  function sendReply() {
    if (!active || !reply.trim()) return;
    if (active.status !== "ESCALATED") {
      toast.error("Conversa não está em atendimento humano");
      return;
    }
    const msg: Message = { id: `m-${Date.now()}`, sender: "AGENT", text: reply, at: new Date().toISOString() };
    setConversations((cs) => cs.map((c) => c.id === active.id ? { ...c, messages: [...c.messages, msg], lastMessage: reply } : c));
    setReply("");
    toast.success("Resposta enviada");
  }

  function resolve(c: Conversation) {
    setConversations((cs) => cs.map((x) => x.id === c.id ? { ...x, status: "RESOLVED" } : x));
    toast.success("Bot reassumiu o atendimento");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação"
        title="Atendimento humano"
        description="Conversas escaladas pelo bot aguardando atendimento."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        <div className="space-y-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="w-full">
              <TabsTrigger value="ESCALATED" className="flex-1">Escaladas</TabsTrigger>
              <TabsTrigger value="RESOLVED" className="flex-1">Resolvidas</TabsTrigger>
            </TabsList>
            <TabsContent value="ESCALATED" className="mt-3">
              <ConversationList items={visible} activeId={activeId} onSelect={setActiveId} />
            </TabsContent>
            <TabsContent value="RESOLVED" className="mt-3">
              <ConversationList items={visible} activeId={activeId} onSelect={setActiveId} resolved />
            </TabsContent>
          </Tabs>
        </div>

        <div className="rounded-md border border-border bg-card">
          {!active ? (
            <EmptyState title="Nenhuma conversa em atendimento" description="Selecione uma conversa à esquerda." />
          ) : (
            <div className="flex h-[600px] flex-col">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="font-medium">{active.clientName}</p>
                  <p className="text-xs text-muted-foreground">{active.clientPhone}</p>
                </div>
                {active.status === "ESCALATED" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline"><CheckCircle2 size={16} strokeWidth={1.5} /> Resolver</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Resolver conversa</DialogTitle></DialogHeader>
                      <p className="text-sm text-muted-foreground">O bot retomará o atendimento desta conversa.</p>
                      <DialogFooter>
                        <Button variant="outline">Cancelar</Button>
                        <Button onClick={() => resolve(active)}>Confirmar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-3">
                  {active.messages.map((m) => (
                    <Bubble key={m.id} msg={m} />
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t border-border p-3">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={active.status === "ESCALATED" ? "Digite sua resposta…" : "Conversa resolvida"}
                    disabled={active.status !== "ESCALATED"}
                    className="min-h-10"
                  />
                  <Button onClick={sendReply} disabled={!reply.trim() || active.status !== "ESCALATED"}>
                    <Send size={16} strokeWidth={1.5} /> Enviar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationList({
  items, activeId, onSelect, resolved,
}: { items: Conversation[]; activeId: string | null; onSelect: (id: string) => void; resolved?: boolean }) {
  if (items.length === 0) {
    return <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
      {resolved ? "Nenhuma conversa resolvida" : "Nenhuma conversa em atendimento"}
    </p>;
  }
  return (
    <ul className="space-y-1">
      {items.map((c) => (
        <li key={c.id}>
          <button
            onClick={() => onSelect(c.id)}
            className={cn(
              "w-full rounded-md border border-transparent px-3 py-2 text-left transition-colors hover:border-border",
              activeId === c.id && "border-border bg-card"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="truncate text-sm font-medium">{c.clientName}</p>
              {resolved ? (
                <Badge variant="outline" className="text-[10px]">Resolvida</Badge>
              ) : (
                <Badge variant="outline" className="border-amber-500/40 text-amber-700 text-[10px] dark:text-amber-300">Em atendimento</Badge>
              )}
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">{c.lastMessage}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">esperando há {formatRelative(c.escalatedAt)}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Bubble({ msg }: { msg: Message }) {
  const isClient = msg.sender === "CLIENT";
  return (
    <div className={cn("flex flex-col", isClient ? "items-start" : "items-end")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
          isClient ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
        )}
      >
        {msg.text}
      </div>
      <p className="mt-1 px-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        {msg.sender} · {formatDateTime(msg.at)}
      </p>
    </div>
  );
}