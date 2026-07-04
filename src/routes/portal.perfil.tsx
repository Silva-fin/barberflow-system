import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, LogOut } from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { usePortalSession } from "@/lib/portal/session";
import { fetchConsents, setConsent } from "@/lib/portal/api";
import type { ConsentGroup } from "@/lib/portal/mock";

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
  const { session, updateProfile, logout } = usePortalSession();
  const navigate = useNavigate();
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [phone, setPhone] = useState(session?.phone ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("saving");
    await new Promise((r) => setTimeout(r, 500));
    updateProfile({ name, email, phone });
    setState("saved");
    toast.success("Alterações salvas");
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-xl p-6">
        <h2 className="font-display text-xl">Dados pessoais</h2>
        <form onSubmit={submit} className="mt-4 space-y-4">
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
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={state === "saving"}>
              {state === "saving" && (
                <Loader2 size={14} strokeWidth={1.5} className="mr-2 animate-spin" />
              )}
              Salvar alterações
            </Button>
            {state === "saved" && (
              <span className="flex items-center gap-1 text-xs text-success">
                <CheckCircle2 size={12} /> Salvo
              </span>
            )}
          </div>
        </form>
      </Card>

      <ConsentsSection />

      <Card className="max-w-xl p-6">
        <h2 className="font-display text-xl">Sessão</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Encerra sua sessão neste dispositivo.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            logout();
            navigate({ to: "/portal/login" });
          }}
        >
          <LogOut size={14} strokeWidth={1.5} className="mr-2" />
          Sair
        </Button>
      </Card>
    </div>
  );
}

function ConsentsSection() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["portal", "consents"], queryFn: fetchConsents });

  const updateLocal = (mutator: (g: ConsentGroup[]) => ConsentGroup[]) => {
    qc.setQueryData<ConsentGroup[] | undefined>(["portal", "consents"], (old) =>
      old ? mutator(old) : old,
    );
  };

  const toggle = async (
    groupId: string,
    itemId: string,
    next: boolean,
    channel?: string,
  ) => {
    const prev = q.data;
    updateLocal((groups) =>
      groups.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              items: g.items.map((it) =>
                it.id !== itemId
                  ? it
                  : channel
                    ? {
                        ...it,
                        channels: it.channels?.map((c) =>
                          c.channel === channel ? { ...c, enabled: next } : c,
                        ),
                      }
                    : { ...it, enabled: next },
              ),
            },
      ),
    );
    try {
      await setConsent(groupId, itemId, next, channel);
    } catch (err) {
      if (prev) qc.setQueryData(["portal", "consents"], prev);
      toast.error((err as Error).message);
    }
  };

  return (
    <Card className="max-w-xl p-6">
      <h2 className="font-display text-xl">Consentimentos</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Controle como usamos seus dados.
      </p>
      <div className="mt-4 space-y-4">
        {q.isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        {q.data?.map((group) => (
          <div key={group.id} className="rounded-lg border border-border p-3">
            <p className="text-sm font-medium">{group.title}</p>
            {group.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {group.description}
              </p>
            )}
            <div className="mt-3 space-y-3">
              {group.items.map((it) => (
                <div key={it.id}>
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor={it.id} className="text-sm">
                      {it.label}
                    </Label>
                    <Switch
                      id={it.id}
                      checked={it.enabled}
                      onCheckedChange={(v) => toggle(group.id, it.id, v)}
                    />
                  </div>
                  {it.enabled && it.channels && (
                    <div className="mt-2 space-y-2 rounded-md bg-muted/40 p-3">
                      {it.channels.map((c) => (
                        <div
                          key={c.channel}
                          className="flex items-center justify-between"
                        >
                          <Label
                            htmlFor={`${it.id}-${c.channel}`}
                            className="text-xs text-muted-foreground"
                          >
                            {c.label}
                          </Label>
                          <Switch
                            id={`${it.id}-${c.channel}`}
                            checked={c.enabled}
                            onCheckedChange={(v) =>
                              toggle(group.id, it.id, v, c.channel)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
