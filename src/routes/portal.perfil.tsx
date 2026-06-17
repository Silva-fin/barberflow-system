import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePortalSession } from "@/lib/portal/session";

export const Route = createFileRoute("/portal/perfil")({
  component: () => (
    <RequirePortalAuth title="Perfil">
      <ProfilePage />
    </RequirePortalAuth>
  ),
});

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function ProfilePage() {
  const { session, updateProfile } = usePortalSession();
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [phone, setPhone] = useState(session?.phone ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("saving");
    await new Promise((r) => setTimeout(r, 600));
    try {
      updateProfile({ name, email, phone });
      setState("saved");
    } catch {
      setState("error");
    }
  };

  return (
    <Card className="max-w-xl p-6">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setState("idle");
            }}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setState("idle");
            }}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            inputMode="tel"
            value={phone}
            onChange={(e) => {
              setPhone(maskPhone(e.target.value));
              setState("idle");
            }}
            className="mt-1"
            placeholder="(11) 91234-5678"
          />
        </div>
        <div>
          <Button type="submit" disabled={state === "saving"}>
            {state === "saving" && (
              <Loader2 size={14} strokeWidth={1.5} className="mr-2 animate-spin" />
            )}
            Salvar
          </Button>
          {state === "saved" && (
            <p className="mt-2 flex items-center gap-1 text-xs text-success">
              <CheckCircle2 size={12} /> Alterações salvas.
            </p>
          )}
          {state === "error" && (
            <p className="mt-2 flex items-center gap-1 text-xs text-destructive">
              <AlertCircle size={12} /> Não foi possível salvar.
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}