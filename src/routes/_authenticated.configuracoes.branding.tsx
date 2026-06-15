import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { mockBranding, type Branding } from "@/lib/mock/fase4";

export const Route = createFileRoute("/_authenticated/configuracoes/branding")({
  head: () => ({ meta: [{ title: "Branding — Paladino" }] }),
  component: BrandingPage,
});

const FONT_OPTIONS = ["Inter", "Cormorant Garamond", "Playfair Display", "Manrope", "DM Sans"];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function BrandingPage() {
  const { role } = useAuth();
  if (role !== "OWNER" && role !== "ADMIN") {
    return <EmptyState title="Sem acesso" description="Apenas Proprietário e Administrador." />;
  }

  const [b, setB] = useState<Branding>(mockBranding);
  const [saving, setSaving] = useState(false);
  const logoRef = useRef<HTMLInputElement | null>(null);
  const favRef = useRef<HTMLInputElement | null>(null);

  const primaryOk = HEX_RE.test(b.primary_color);
  const secondaryOk = HEX_RE.test(b.secondary_color);
  const canSave = primaryOk && secondaryOk && !!b.font_family;

  function pickFile(kind: "logo" | "favicon", file?: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setB((x) => kind === "logo" ? { ...x, logo_url: url } : { ...x, favicon_url: url });
      toast.success(`${kind === "logo" ? "Logo" : "Favicon"} carregado`);
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    toast.success("Branding salvo");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configurações"
        title="Branding"
        description="Personalize cores, fonte e logo da sua marca."
        actions={<Button disabled={!canSave || saving} onClick={save}>{saving ? "Salvando…" : "Salvar"}</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base font-normal">Identidade visual</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cor primária</Label>
                <div className="flex gap-2">
                  <Input type="color" className="h-9 w-14 p-1" value={b.primary_color} onChange={(e) => setB({ ...b, primary_color: e.target.value })} />
                  <Input className="font-mono" value={b.primary_color} onChange={(e) => setB({ ...b, primary_color: e.target.value })} />
                </div>
                {!primaryOk && <p className="text-xs text-destructive">Use #RRGGBB</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Cor secundária</Label>
                <div className="flex gap-2">
                  <Input type="color" className="h-9 w-14 p-1" value={b.secondary_color} onChange={(e) => setB({ ...b, secondary_color: e.target.value })} />
                  <Input className="font-mono" value={b.secondary_color} onChange={(e) => setB({ ...b, secondary_color: e.target.value })} />
                </div>
                {!secondaryOk && <p className="text-xs text-destructive">Use #RRGGBB</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Fonte</Label>
              <Select value={b.font_family} onValueChange={(v) => setB({ ...b, font_family: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Logo</Label>
                <input ref={logoRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => pickFile("logo", e.target.files?.[0])} />
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => logoRef.current?.click()}>
                    <Upload size={16} strokeWidth={1.5} /> Enviar
                  </Button>
                  {b.logo_url && <img src={b.logo_url} alt="" className="h-9 w-9 rounded border border-border object-contain" />}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Favicon</Label>
                <input ref={favRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => pickFile("favicon", e.target.files?.[0])} />
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => favRef.current?.click()}>
                    <Upload size={16} strokeWidth={1.5} /> Enviar
                  </Button>
                  {b.favicon_url && <img src={b.favicon_url} alt="" className="h-9 w-9 rounded border border-border object-contain" />}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-normal">Pré-visualização</CardTitle></CardHeader>
          <CardContent>
            <div
              className="overflow-hidden rounded-lg border"
              style={{ borderColor: primaryOk ? b.primary_color : "#ddd", fontFamily: b.font_family }}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ backgroundColor: primaryOk ? b.primary_color : "#222", color: "#fff" }}
              >
                <span style={{ fontFamily: b.font_family, fontSize: 20, letterSpacing: 1 }}>
                  {b.logo_url ? <img src={b.logo_url} alt="" className="h-7" /> : "Sua Marca"}
                </span>
                <button
                  type="button"
                  style={{
                    backgroundColor: secondaryOk ? b.secondary_color : "#888",
                    color: "#fff", padding: "6px 14px", borderRadius: 6, fontSize: 13,
                  }}
                >
                  Agendar
                </button>
              </div>
              <div className="space-y-2 bg-white p-5 text-neutral-900">
                <h3 style={{ fontFamily: b.font_family, fontSize: 22, color: primaryOk ? b.primary_color : "#222" }}>
                  Bem-vindo ao painel
                </h3>
                <p style={{ fontFamily: b.font_family, fontSize: 14, color: "#555" }}>
                  Este é um cartão de exemplo com sua identidade aplicada.
                </p>
                <span
                  style={{
                    display: "inline-block", marginTop: 6, padding: "2px 10px",
                    borderRadius: 999, fontSize: 11,
                    backgroundColor: secondaryOk ? b.secondary_color + "22" : "#eee",
                    color: secondaryOk ? b.secondary_color : "#666",
                    border: `1px solid ${secondaryOk ? b.secondary_color : "#ddd"}`,
                  }}
                >
                  Selo decorativo
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}