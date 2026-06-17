import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface JsonEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  field: string;
  initialValue: unknown;
  busy?: boolean;
  onSave: (value: unknown) => Promise<void> | void;
}

export function JsonEditorDialog({
  open,
  onOpenChange,
  title,
  field,
  initialValue,
  busy,
  onSave,
}: JsonEditorDialogProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setText(JSON.stringify(initialValue, null, 2));
      setError(null);
    }
  }, [open, initialValue]);

  async function handleSave() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setError("JSON inválido.");
      return;
    }
    try {
      await onSave(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wide">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="json-field">{field}</Label>
          <Textarea
            id="json-field"
            value={text}
            onChange={(e) => { setText(e.target.value); setError(null); }}
            rows={10}
            className="font-mono text-xs"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancelar</Button>
          <Button onClick={handleSave} disabled={busy}>{busy ? "Salvando…" : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
