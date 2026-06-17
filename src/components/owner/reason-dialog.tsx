import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  minLength?: number;
  busy?: boolean;
  onConfirm: (reason: string) => Promise<void> | void;
}

export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  destructive,
  minLength = 1,
  busy,
  onConfirm,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setError(null);
    }
  }, [open]);

  const valid = reason.trim().length >= minLength;

  async function handleConfirm() {
    if (!valid) {
      setError(
        minLength > 1
          ? `Motivo precisa ter pelo menos ${minLength} caracteres.`
          : "Motivo é obrigatório.",
      );
      return;
    }
    try {
      await onConfirm(reason.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao confirmar.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wide">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason">Motivo</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(null); }}
            rows={4}
            placeholder={minLength > 1 ? `Mínimo de ${minLength} caracteres` : "Descreva o motivo"}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {minLength > 1 && (
            <p className="text-xs text-muted-foreground">{reason.trim().length}/{minLength}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancelar</Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={busy || !valid}
          >
            {busy ? "Aguarde…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
