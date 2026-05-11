import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Navalha" }] }),
  component: ConfigPage,
});

function ConfigPage() {
  const { user } = useAuth();
  const { data: shop } = useQuery({ queryKey: ["shop"], queryFn: () => api.getMyBarbershop() });

  if (!shop || !user) return null;
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/b/${shop.slug}` : `/b/${shop.slug}`;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Configurações</h1>
        <p className="text-sm text-muted-foreground">Dados da barbearia e link público</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Link de agendamento público</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Compartilhe este link com seus clientes para que possam agendar online.</p>
          <div className="flex gap-2">
            <Input readOnly value={publicUrl} className="font-mono text-sm" />
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("Link copiado!"); }}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Dados da barbearia</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Nome</Label><Input defaultValue={shop.name} /></div>
          <div className="space-y-2"><Label>Slug público</Label><Input defaultValue={shop.slug} /></div>
          <div className="space-y-2"><Label>Endereço</Label><Input defaultValue={shop.address} /></div>
          <div className="space-y-2"><Label>Telefone</Label><Input defaultValue={shop.phone} /></div>
          <div className="space-y-2"><Label>Descrição</Label><Textarea defaultValue={shop.description} /></div>
          <Button onClick={() => toast.success("Salvo (demo)")}>Salvar alterações</Button>
        </CardContent>
      </Card>
    </div>
  );
}
