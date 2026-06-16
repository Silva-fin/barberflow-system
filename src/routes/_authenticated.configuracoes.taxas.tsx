import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { mockPaymentFees, type PaymentMethodFee } from "@/lib/mock/fase-reskin";

export const Route = createFileRoute("/_authenticated/configuracoes/taxas")({
  head: () => ({ meta: [{ title: "Taxas de maquininha — Paladino" }] }),
  component: TaxasPage,
});

function TaxasPage() {
  const [rows, setRows] = useState<PaymentMethodFee[]>(mockPaymentFees);

  function update(id: string, patch: Partial<PaymentMethodFee>) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configurações"
        title="Taxas de maquininha"
        description="Taxas de processamento por método de pagamento."
      />

      <Card>
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-muted-foreground">
                <TableHead>Método</TableHead>
                <TableHead className="w-32 text-right">Taxa (%)</TableHead>
                <TableHead className="w-32 text-right">Fixa (R$)</TableHead>
                <TableHead className="w-28 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => {
                const unset = r.ratePct === null || r.fixedCents === null;
                return (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{r.label}</span>
                        {!r.editable && (
                          <span className="text-[11px] text-muted-foreground">0% — sem taxa</span>
                        )}
                        {r.editable && unset && (
                          <span className="text-[11px] text-muted-foreground">Não configurado</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {r.editable ? (
                        <Input
                          className="ml-auto h-8 w-24 text-right tabular-nums"
                          inputMode="decimal"
                          value={r.ratePct ?? ""}
                          onChange={e => {
                            const v = e.target.value;
                            update(r.id, { ratePct: v === "" ? null : Number(v.replace(",", ".")) });
                          }}
                        />
                      ) : (
                        <span className="text-muted-foreground">0%</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.editable ? (
                        <Input
                          className="ml-auto h-8 w-24 text-right tabular-nums"
                          inputMode="decimal"
                          value={
                            r.fixedCents === null ? "" : (r.fixedCents / 100).toFixed(2)
                          }
                          onChange={e => {
                            const v = e.target.value;
                            update(r.id, {
                              fixedCents: v === "" ? null : Math.round(Number(v.replace(",", ".")) * 100),
                            });
                          }}
                        />
                      ) : (
                        <span className="text-muted-foreground">R$ 0,00</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.editable ? (
                        <Button
                          variant="outline" size="sm"
                          onClick={() => toast.success(`Taxa de ${r.label} salva`)}
                        >
                          Salvar
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}