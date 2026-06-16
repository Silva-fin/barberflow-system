import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/configuracoes/seguranca")({
  head: () => ({ meta: [{ title: "Segurança — Paladino" }] }),
  component: SegurancaPage,
});

function SegurancaPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const errors = {
    next: next && !/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(next)
      ? "Mínimo 8 caracteres, 1 maiúscula e 1 número." : null,
    confirm: confirm && confirm !== next ? "As senhas não coincidem." : null,
  };
  const canSubmit = current && next && confirm && !errors.next && !errors.confirm;

  function submit() {
    toast.success("Senha alterada com sucesso");
    setCurrent(""); setNext(""); setConfirm("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configurações"
        title="Segurança"
        description="Altere a sua senha de acesso."
      />

      <Card className="max-w-xl">
        <CardHeader><CardTitle className="font-display text-lg">Trocar senha</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cur">Senha atual</Label>
            <Input id="cur" type="password" value={current} onChange={e => setCurrent(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="next">Nova senha</Label>
            <Input id="next" type="password" value={next} onChange={e => setNext(e.target.value)} />
            {errors.next
              ? <p className="text-xs text-destructive">{errors.next}</p>
              : <p className="text-xs text-muted-foreground">Mínimo 8 caracteres, 1 maiúscula e 1 número.</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf">Confirmar nova senha</Label>
            <Input id="cf" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>
          <div className="flex justify-end border-t border-border pt-4">
            <Button disabled={!canSubmit} onClick={submit}>Alterar senha</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}