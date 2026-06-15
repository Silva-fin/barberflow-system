import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { QrCode, Smartphone, RefreshCw, LogOut, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { WHATSAPP_API_TYPE_LABELS, type WhatsappApiType } from "@/lib/constants";
import { mockWhatsappConnection, type WhatsappConnection } from "@/lib/mock/fase4";

export const Route = createFileRoute("/_authenticated/configuracoes/integracoes")({
  head: () => ({ meta: [{ title: "Integrações — Paladino" }] }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const { role } = useAuth();
  if (role !== "OWNER" && role !== "ADMIN") {
    return <EmptyState title="Sem acesso" description="Apenas Proprietário e Administrador." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Configurações" title="Integrações" description="Conexões com canais e provedores externos." />
      <Tabs defaultValue="whatsapp">
        <TabsList>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="email" disabled>E-mail (em breve)</TabsTrigger>
          <TabsTrigger value="payments" disabled>Pagamentos (em breve)</TabsTrigger>
        </TabsList>
        <TabsContent value="whatsapp" className="space-y-4">
          <TabWhatsApp />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TabWhatsApp() {
  const [conn, setConn] = useState<WhatsappConnection>(mockWhatsappConnection);
  const [apiType, setApiType] = useState<WhatsappApiType>("UNOFFICIAL_BAILEYS");
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [qrExpires, setQrExpires] = useState<number>(0);
  const [confirmDisc, setConfirmDisc] = useState(false);

  useEffect(() => {
    if (conn.status !== "CONNECTING" || !conn.qr_expires_in) return;
    setQrExpires(conn.qr_expires_in);
    const id = setInterval(() => setQrExpires((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [conn.status, conn.qr_expires_in]);

  // QR mock (PNG 1x1 transparente em base64)
  const QR_MOCK_BASE64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  function connect() {
    setConn({ status: "CONNECTING", qr_code: QR_MOCK_BASE64, qr_expires_in: 60 });
    toast("Gerando QR…");
  }
  function regen() {
    setConn((c) => ({ ...c, qr_code: QR_MOCK_BASE64, qr_expires_in: 60 }));
    setQrExpires(60);
    toast("Novo QR gerado");
  }
  function disconnect() {
    setConn({ status: "DISCONNECTED" });
    setConfirmDisc(false);
    toast.success("WhatsApp desconectado");
  }
  function saveSettings() {
    toast.success("Configurações de comunicação salvas");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-normal">
            <Smartphone size={16} strokeWidth={1.5} /> Conexão WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
              <StatusBadge status={conn.status} />
              {conn.phone_number && <p className="mt-1 font-mono text-sm">{conn.phone_number}</p>}
              {conn.connected_at && <p className="text-xs text-muted-foreground">Conectado em {formatDateTime(conn.connected_at)}</p>}
            </div>
            {conn.status === "CONNECTED" ? (
              <Button variant="outline" onClick={() => setConfirmDisc(true)}>
                <LogOut size={16} strokeWidth={1.5} /> Desconectar
              </Button>
            ) : conn.status === "CONNECTING" ? (
              <Button variant="outline" onClick={regen}>
                <RefreshCw size={16} strokeWidth={1.5} /> Gerar novo QR
              </Button>
            ) : (
              <Button onClick={connect}>
                <QrCode size={16} strokeWidth={1.5} /> Conectar
              </Button>
            )}
          </div>

          {conn.status === "CONNECTING" && conn.qr_code && (
            <div className="flex flex-col items-center gap-3 rounded-md border border-border bg-card/40 p-6">
              <img
                src={`data:image/png;base64,${conn.qr_code}`}
                alt="QR Code WhatsApp"
                className="h-56 w-56 bg-white p-3"
              />
              <p className="text-xs text-muted-foreground">
                {qrExpires > 0 ? (
                  <>Expira em <span className="font-mono">{qrExpires}s</span></>
                ) : (
                  <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Aguardando…</span>
                )}
              </p>
              <p className="text-center text-xs text-muted-foreground">
                Abra o WhatsApp no celular → Aparelhos conectados → Conectar um aparelho
              </p>
            </div>
          )}

          {conn.status === "ERROR" && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {conn.disconnect_reason ?? "Erro de conexão"}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal">Configurações de canal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tipo de API</Label>
            <Select value={apiType} onValueChange={(v) => setApiType(v as WhatsappApiType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(WHATSAPP_API_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Início silêncio</Label>
              <Input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Fim silêncio</Label>
              <Input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Mensagens automáticas dentro desta janela são adiadas.</p>
          <div className="flex justify-end">
            <Button onClick={saveSettings}>Salvar</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmDisc} onOpenChange={setConfirmDisc}>
        <DialogContent>
          <DialogHeader><DialogTitle>Desconectar WhatsApp</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Mensagens automáticas via WhatsApp deixarão de ser enviadas. Você pode reconectar quando quiser.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDisc(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={disconnect}>Desconectar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: WhatsappConnection["status"] }) {
  const map: Record<WhatsappConnection["status"], { label: string; cls: string }> = {
    DISCONNECTED: { label: "Desconectado", cls: "bg-muted text-muted-foreground border-border" },
    CONNECTING: { label: "Conectando…", cls: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300" },
    CONNECTED: { label: "Conectado", cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300" },
    ERROR: { label: "Erro", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  };
  return <Badge variant="outline" className={`font-normal ${map[status].cls}`}>{map[status].label}</Badge>;
}