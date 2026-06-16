import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, Banknote, QrCode, Smartphone, CreditCard, Loader2, CheckCircle2,
  AlertCircle, type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MoneyInput } from "@/components/app/money-input";
import { cn } from "@/lib/utils";
import {
  mockNovoPagamentoClientes, mockAgendamentosByCliente, mockPagamentoMethods,
} from "@/lib/mock/fase-reskin";

export const Route = createFileRoute("/_authenticated/pagamentos/novo")({
  head: () => ({ meta: [{ title: "Registrar Pagamento — Paladino" }] }),
  component: NovoPagamentoPage,
});

const ICONS: Record<string, LucideIcon> = {
  Banknote, QrCode, Smartphone, CreditCard,
};

type Phase = "form" | "submitting" | "done";

function NovoPagamentoPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("form");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [agId, setAgId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string | null>(null);

  const canSubmit = !!customerId && amount.length > 0 && !!method;
  const agendamentos = customerId ? (mockAgendamentosByCliente[customerId] ?? []) : [];
  const methodObj = mockPagamentoMethods.find(m => m.id === method);
  // demo: "credito-mc" tem taxa não configurada
  const taxaNaoConfigurada = method === "credito-mc";

  function submit() {
    if (!canSubmit) return;
    setPhase("submitting");
    setTimeout(() => setPhase("done"), 800);
  }

  function reset() {
    setPhase("form");
    setCustomerId(null);
    setAgId(null);
    setAmount("");
    setMethod(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financeiro"
        title="Registrar Pagamento"
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/pagamentos"><ArrowLeft size={16} strokeWidth={1.5} className="mr-1" />Voltar</Link>
          </Button>
        }
      />

      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-6">
          {phase === "form" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={customerId ?? ""} onValueChange={(v) => { setCustomerId(v); setAgId(null); }}>
                  <SelectTrigger><SelectValue placeholder="Buscar cliente" /></SelectTrigger>
                  <SelectContent>
                    {mockNovoPagamentoClientes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name} — {c.phone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {customerId && (
                <div className="space-y-2">
                  <Label>Agendamento (opcional)</Label>
                  <Select value={agId ?? ""} onValueChange={setAgId}>
                    <SelectTrigger><SelectValue placeholder="Nenhum / avulso" /></SelectTrigger>
                    <SelectContent>
                      {agendamentos.length === 0 ? (
                        <SelectItem value="none" disabled>Sem agendamentos</SelectItem>
                      ) : agendamentos.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <MoneyInput id="amount" value={amount} onChange={setAmount} />
                {amount && (
                  <p className="text-xs text-muted-foreground">
                    R$ {Number(amount.replace(",", ".")).toFixed(2).replace(".", ",")}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Método de pagamento</Label>
                {(["Dinheiro", "PIX", "Maquininha"] as const).map(group => (
                  <div key={group}>
                    <p className="mb-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{group}</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {mockPagamentoMethods.filter(m => m.group === group).map(m => {
                        const Icon = ICONS[m.icon] ?? CreditCard;
                        const active = method === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setMethod(m.id)}
                            className={cn(
                              "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                              active
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card hover:bg-muted/30",
                            )}
                          >
                            <Icon size={16} strokeWidth={1.5} />
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end border-t border-border pt-4">
                <Button disabled={!canSubmit} onClick={submit}>Confirmar pagamento</Button>
              </div>
            </div>
          )}

          {phase === "submitting" && (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <Loader2 size={28} strokeWidth={1.5} className="animate-spin text-primary" />
              <p className="text-sm">Registrando pagamento…</p>
            </div>
          )}

          {phase === "done" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-2 rounded-md border border-success/40 bg-success/10 px-6 py-8 text-center">
                <CheckCircle2 size={32} strokeWidth={1.5} className="text-success" />
                <p className="font-display text-xl">Pagamento confirmado</p>
                <p className="text-xs text-muted-foreground">{methodObj?.label}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Info label="Valor líquido" value="R$ 96,30" />
                <Info label="Taxa aplicada" value="R$ 3,70" />
              </div>

              {taxaNaoConfigurada && (
                <div className="flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                  <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 text-amber-700 dark:text-amber-300" />
                  <div className="flex-1">
                    <p className="text-foreground">Este método ainda não tem taxa configurada.</p>
                    <p className="text-xs text-muted-foreground">A taxa exibida é estimada.</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/configuracoes/taxas">Configurar</Link>
                  </Button>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="outline" onClick={reset}>Novo pagamento</Button>
                <Button onClick={() => navigate({ to: "/pagamentos" })}>Ver lista</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-xl tabular-nums">{value}</p>
    </div>
  );
}