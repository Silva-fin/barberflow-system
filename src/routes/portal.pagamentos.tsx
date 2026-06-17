import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CreditCard, Plus, Trash2, Info } from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/portal/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { fetchPaymentCards, removePaymentCard } from "@/lib/portal/api";

export const Route = createFileRoute("/portal/pagamentos")({
  component: () => (
    <RequirePortalAuth title="Pagamentos">
      <PaymentsPage />
    </RequirePortalAuth>
  ),
});

function PaymentsPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["portal", "cards"],
    queryFn: fetchPaymentCards,
  });
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState("once");

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <Info size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" />
        <p>
          Esta área está em desenvolvimento. A integração de pagamentos estará
          disponível em breve.
        </p>
      </div>

      {q.isLoading && (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {q.data && q.data.length === 0 && (
        <div className="rounded-md border border-dashed border-border p-10 text-center">
          <CreditCard size={20} strokeWidth={1.5} className="mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhuma forma de pagamento.
          </p>
        </div>
      )}

      {q.data && q.data.length > 0 && (
        <ul className="space-y-2">
          {q.data.map((c) => (
            <li key={c.id}>
              <Card className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <CreditCard size={18} strokeWidth={1.5} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {c.brand} •••• {c.last4}
                    </p>
                    {c.default && (
                      <StatusBadge tone="primary" className="mt-1">
                        Cartão padrão
                      </StatusBadge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={async () => {
                    await removePaymentCard(c.id);
                    qc.invalidateQueries({ queryKey: ["portal", "cards"] });
                  }}
                >
                  <Trash2 size={14} strokeWidth={1.5} className="mr-2" />
                  Remover
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Button onClick={() => setOpen(true)}>
        <Plus size={14} strokeWidth={1.5} className="mr-2" />
        Adicionar forma de pagamento
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Autorização</DialogTitle>
            <DialogDescription>
              Como deseja autorizar o uso desta forma de pagamento?
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={authMode} onValueChange={setAuthMode} className="space-y-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="once" value="once" />
              <Label htmlFor="once">Apenas esta vez</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="always" value="always" />
              <Label htmlFor="always">Permitir sempre</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="never" value="never" />
              <Label htmlFor="never">Cancelar</Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            Em breve: cadastro completo de cartão com captura segura.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Voltar
            </Button>
            <Button onClick={() => setOpen(false)}>Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}