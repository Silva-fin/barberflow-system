import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AlertCircle, PauseCircle, Play, Repeat, RotateCw, XCircle } from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge, subscriptionTone } from "@/components/portal/status-badge";
import { fetchSubscriptions, updateSubscriptionStatus } from "@/lib/portal/api";
import type { Subscription, SubscriptionStatus } from "@/lib/portal/mock";
import { formatBRLFromDecimal, formatDate } from "@/lib/format";

export const Route = createFileRoute("/portal/assinaturas")({
  component: () => (
    <RequirePortalAuth title="Assinaturas">
      <SubscriptionsPage />
    </RequirePortalAuth>
  ),
});

function SubscriptionsPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["portal", "subscriptions"],
    queryFn: fetchSubscriptions,
  });
  const [dialog, setDialog] = useState<{
    sub: Subscription;
    action: "pause" | "cancel" | "resume";
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    if (!dialog) return;
    setBusy(true);
    const next: SubscriptionStatus =
      dialog.action === "cancel"
        ? "cancelada"
        : dialog.action === "pause"
          ? "pausada"
          : "ativa";
    try {
      await updateSubscriptionStatus(dialog.sub.id, next);
      qc.invalidateQueries({ queryKey: ["portal", "subscriptions"] });
      setDialog(null);
    } finally {
      setBusy(false);
    }
  };

  if (q.isLoading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
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

  if (!q.data || q.data.length === 0)
    return (
      <div className="rounded-md border border-dashed border-border p-10 text-center">
        <Repeat size={20} strokeWidth={1.5} className="mx-auto text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Você não tem assinaturas.</p>
      </div>
    );

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {q.data.map((s) => (
          <Card key={s.id} className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.plan}</p>
                <p className="truncate text-xs text-primary">{s.establishment.name}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Próxima renovação: {formatDate(s.nextRenewal)} ·{" "}
                  {formatBRLFromDecimal(s.priceBRL)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge tone={subscriptionTone(s.status)}>
                  {s.status === "ativa" ? "Ativa" : s.status === "pausada" ? "Pausada" : "Cancelada"}
                </StatusBadge>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {s.status === "ativa" &&
                (s.allowPause ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDialog({ sub: s, action: "pause" })}
                  >
                    <PauseCircle size={14} strokeWidth={1.5} className="mr-2" />
                    Pausar
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0}>
                        <Button size="sm" variant="outline" disabled>
                          <PauseCircle size={14} strokeWidth={1.5} className="mr-2" />
                          Pausar
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Este plano não permite pausa.</TooltipContent>
                  </Tooltip>
                ))}
              {s.status === "pausada" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDialog({ sub: s, action: "resume" })}
                >
                  <Play size={14} strokeWidth={1.5} className="mr-2" />
                  Retomar
                </Button>
              )}
              {s.status !== "cancelada" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDialog({ sub: s, action: "cancel" })}
                >
                  <XCircle size={14} strokeWidth={1.5} className="mr-2" />
                  Cancelar
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.action === "cancel"
                ? "Cancelar assinatura?"
                : dialog?.action === "pause"
                  ? "Pausar assinatura?"
                  : "Retomar assinatura?"}
            </DialogTitle>
            <DialogDescription>
              {dialog?.action === "cancel"
                ? `O plano "${dialog?.sub.plan}" será cancelado e não renovará mais.`
                : dialog?.action === "pause"
                  ? `O plano "${dialog?.sub.plan}" ficará pausado até você retomar.`
                  : `O plano "${dialog?.sub.plan}" voltará a renovar normalmente.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)} disabled={busy}>
              Voltar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={busy}
              variant={dialog?.action === "cancel" ? "destructive" : "default"}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}