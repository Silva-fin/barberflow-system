import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockMyProfile } from "@/lib/mock/fase-reskin";

export const Route = createFileRoute("/_authenticated/configuracoes/perfil")({
  head: () => ({ meta: [{ title: "Meu Perfil — Paladino" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  const [name, setName] = useState(mockMyProfile.name);
  const dirty = name.trim() !== mockMyProfile.name;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configurações"
        title="Meu Perfil"
        description="Suas informações de acesso."
      />

      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="font-display text-lg">Informações pessoais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" value={mockMyProfile.email} readOnly className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">E-mail não editável. Fale com seu administrador para alterar.</p>
          </div>
          <div className="space-y-2">
            <Label>Papel</Label>
            <div>
              <Badge variant="outline" className="font-normal">{mockMyProfile.roleLabel}</Badge>
            </div>
          </div>
          <div className="flex justify-end border-t border-border pt-4">
            <Button disabled={!dirty} onClick={() => toast.success("Perfil atualizado")}>Salvar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}