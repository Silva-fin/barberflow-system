import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AlertCircle, AlertTriangle, RotateCw } from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fetchConsents, setConsent } from "@/lib/portal/api";
import type { ConsentGroup } from "@/lib/portal/mock";

export const Route = createFileRoute("/portal/consentimentos")({
  component: () => (
    <RequirePortalAuth title="Consentimentos">
      <ConsentsPage />
    </RequirePortalAuth>
  ),
});

function ConsentsPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["portal", "consents"],
    queryFn: fetchConsents,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateLocal = (mutator: (groups: ConsentGroup[]) => ConsentGroup[]) => {
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
    // optimistic
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
    setErrorMsg(null);
    try {
      await setConsent(groupId, itemId, next, channel);
    } catch (err) {
      setErrorMsg((err as Error).message);
      // revert
      if (prev) qc.setQueryData(["portal", "consents"], prev);
    }
  };

  if (q.isLoading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );

  if (q.isError)
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center">
        <AlertCircle size={20} strokeWidth={1.5} className="mx-auto text-destructive" />
        <Button size="sm" variant="outline" className="mt-3" onClick={() => q.refetch()}>
          <RotateCw size={14} strokeWidth={1.5} className="mr-2" />
          Tentar novamente
        </Button>
      </div>
    );

  const dataConsentOff = q.data
    ?.find((g) => g.id === "data")
    ?.items.find((i) => i.id === "data-base")
    ?.enabled === false;

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {errorMsg} — alteração revertida.
        </div>
      )}
      {dataConsentOff && (
        <Card className="border-warning/40 bg-warning/10 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} strokeWidth={1.5} className="mt-0.5 text-warning" />
            <div className="text-sm">
              <p className="font-medium">Atenção</p>
              <p className="text-muted-foreground">
                Sem o consentimento de tratamento de dados, não conseguiremos
                manter seu histórico nem oferecer agendamentos personalizados.
              </p>
            </div>
          </div>
        </Card>
      )}
      {q.data?.map((group) => (
        <Card key={group.id} className="p-4">
          <p className="text-sm font-medium">{group.title}</p>
          {group.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{group.description}</p>
          )}
          <div className="mt-3 space-y-3">
            {group.items.map((it) => (
              <div key={it.id}>
                <div className="flex items-center justify-between">
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
                  <div className="mt-2 space-y-2 rounded-md border border-border bg-muted/30 p-3">
                    {it.channels.map((c) => (
                      <div key={c.channel} className="flex items-center justify-between">
                        <Label
                          htmlFor={`${it.id}-${c.channel}`}
                          className="text-xs text-muted-foreground"
                        >
                          {c.label}
                        </Label>
                        <Switch
                          id={`${it.id}-${c.channel}`}
                          checked={c.enabled}
                          onCheckedChange={(v) => toggle(group.id, it.id, v, c.channel)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}