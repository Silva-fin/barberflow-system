import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOwnerImpersonation } from "@/lib/owner/session";
import { IMPERSONATION_MODE_LABELS } from "@/lib/owner/constants";
import { revokeGrant } from "@/lib/owner/api";
import { ShieldAlert } from "lucide-react";

function formatExpiresAt(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function ImpersonationBanner() {
  const { grant, endGrant } = useOwnerImpersonation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!grant) return null;

  async function handleEnd() {
    setBusy(true);
    try {
      if (grant) await revokeGrant(grant.grantId);
      endGrant();
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-destructive/40 bg-destructive px-4 py-2 text-destructive-foreground shadow-sm">
        <ShieldAlert size={16} strokeWidth={1.5} />
        <p className="flex-1 text-sm">
          Acessando como <span className="font-semibold">PLATFORM_OWNER</span> em{" "}
          <span className="font-semibold">{grant.tenantName}</span> ·{" "}
          {IMPERSONATION_MODE_LABELS[grant.mode]} · Expira em{" "}
          <span className="font-mono tabular-nums">{formatExpiresAt(grant.expiresAt)}</span>
        </p>
        <Button
          size="sm"
          variant="outline"
          className="border-destructive-foreground/40 bg-transparent text-destructive-foreground hover:bg-destructive-foreground hover:text-destructive"
          onClick={() => setConfirmOpen(true)}
        >
          Encerrar
        </Button>
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">Encerrar acesso?</DialogTitle>
            <DialogDescription>
              A sessão de impersonation em <strong>{grant.tenantName}</strong> será revogada imediatamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={busy}>Cancelar</Button>
            <Button variant="destructive" onClick={handleEnd} disabled={busy}>{busy ? "Aguarde…" : "Encerrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
