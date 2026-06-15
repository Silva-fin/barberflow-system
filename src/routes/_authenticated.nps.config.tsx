import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Settings2 } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { mockNpsConfig, type NpsConfig } from "@/lib/mock/fase4";

export const Route = createFileRoute("/_authenticated/nps/config")({
  head: () => ({ meta: [{ title: "NPS — Configuração — Paladino" }] }),
  component: NpsConfigPage,
});

function NpsConfigPage() {
  const { role } = useAuth();
  if (role !== "OWNER" && role !== "ADMIN") {
    return <EmptyState title="Sem acesso" description="Apenas Proprietário e Administrador." />;
  }

  const [cfg, setCfg] = useState<NpsConfig>(mockNpsConfig);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    toast.success("Configuração de NPS salva");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="NPS"
        title="Configuração"
        description="Quando e como enviar a pesquisa de satisfação."
        actions={
          <Button variant="outline" asChild>
            <Link to="/nps">Ver pesquisas</Link>
          </Button>
        }
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-normal">
            <Settings2 size={16} strokeWidth={1.5} /> Parâmetros gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Row label="Pesquisa NPS ativa" hint="Quando ativa, pesquisas são agendadas após cada atendimento concluído.">
            <Switch checked={cfg.enabled} onCheckedChange={(v) => setCfg({ ...cfg, enabled: v })} />
          </Row>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Canal de envio</Label>
              <Select value={cfg.channel} onValueChange={(v) => setCfg({ ...cfg, channel: v as NpsConfig["channel"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="EMAIL">E-mail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Atraso após conclusão (min)</Label>
              <Input type="number" min={0} value={cfg.delay_minutes}
                onChange={(e) => setCfg({ ...cfg, delay_minutes: parseInt(e.target.value || "0") })} />
              <p className="text-xs text-muted-foreground">min. após conclusão do atendimento</p>
            </div>
            <div className="space-y-1.5">
              <Label>Intervalo mínimo (dias)</Label>
              <Input type="number" min={0} value={cfg.min_interval_days}
                onChange={(e) => setCfg({ ...cfg, min_interval_days: parseInt(e.target.value || "0") })} />
              <p className="text-xs text-muted-foreground">dias entre pesquisas para o mesmo cliente</p>
            </div>
            <div className="space-y-1.5">
              <Label>Limite para nota baixa (0–10)</Label>
              <Input type="number" min={0} max={10} value={cfg.low_score_threshold}
                onChange={(e) => setCfg({ ...cfg, low_score_threshold: parseInt(e.target.value || "0") })} />
              <p className="text-xs text-muted-foreground">notas ≤ limite disparam alerta</p>
            </div>
          </div>

          <Row label="Alerta de nota baixa" hint="Notificar gestão quando o cliente avaliar abaixo do limite.">
            <Switch checked={cfg.low_score_alert_enabled}
              onCheckedChange={(v) => setCfg({ ...cfg, low_score_alert_enabled: v })} />
          </Row>

          <div className="flex justify-end pt-2">
            <Button onClick={save} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-border p-3">
      <div>
        <p className="text-sm">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}