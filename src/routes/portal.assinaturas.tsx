import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PauseCircle, Play, Repeat, XCircle } from "lucide-react";
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
import { StatusBadge, subscriptionTone } from "@/components/portal/status-badge";
import { CompanyCta } from "@/components/portal/company-chips";
import { fetchSubscriptions, updateSubscriptionStatus } from "@/lib/portal/api";
import type { Subscription, SubscriptionStatus } from "@/lib/portal/mock";
import { formatBRLFromDecimal, formatDate } from "@/lib/format";
import { matchesCompany, useCompanyFilter } from "@/lib/portal/company-filter";

export const Route = createFileRoute("/portal/assinaturas")({
  component: () => (
    <RequirePortalAuth title="Assinaturas">
      <SubscriptionsPage />
    </RequirePortalAuth>
  ),
});

function SubscriptionsPage() {
  const { selected } = useCompanyFilter();
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

  const items = (q.data ?? []).filter((s) =>
    matchesCompany(selected, s.establishment.id),
  );

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
      toast.success(
        next === "cancelada"
          ? "Assinatura cancelada"
          : next === "pausada"
            ? "Assinatura pausada"
            : "Assinatura retomada",
      );
      setDialog(null);
    } finally {
      setBusy(false);
    }
  };

  if (q.isLoading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );

  return (
    <div className="space-y-4">
      <CompanyCta />

      {items.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <Repeat
            size={20}
            strokeWidth={1.5}
            className="mx-auto text-muted-foreground"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {selected === "all"
              ? "Você não tem assinaturas."
              : "Nenhuma assinatura nesta empresa."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-display text-lg leading-tight">{s.plan}</p>
                  {selected === "all" && (
                    <p className="text-[11px] uppercase tracking-widest text-primary/80">
                      {s.establishment.name}
                    </p>
                  )}
                  {s.items && s.items.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {s.items.map((it) => (
                        <span
                          key={it}
                          className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {it}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Renova em {formatDate(s.nextRenewal)} ·{" "}
                    {formatBRLFromDecimal(s.priceBRL)}
                  </p>
                </div>
                <StatusBadge tone={subscriptionTone(s.status)}>
                  {s.status === "ativa"
                    ? "Ativa"
                    : s.status === "pausada"
                      ? "Pausada"
                      : "Cancelada"}
                </StatusBadge>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {s.status === "ativa" && s.allowPause && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDialog({ sub: s, action: "pause" })}
                  >
                    <PauseCircle size={14} strokeWidth={1.5} className="mr-2" />
                    Pausar
                  </Button>
                )}
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
      )}

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
    </div>
  );
}
