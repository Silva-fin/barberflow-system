import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import {
  mockBarbers, mockServices, mockTimeSlots, mockNovoPagamentoClientes,
} from "@/lib/mock/fase-reskin";

export const Route = createFileRoute("/_authenticated/agenda/novo")({
  head: () => ({ meta: [{ title: "Novo Agendamento — Paladino" }] }),
  component: NovoAgendamentoPage,
});

function NovoAgendamentoPage() {
  const navigate = useNavigate();
  const [barberId, setBarberId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const customerOk = newCustomer ? newName.trim().length > 1 && newPhone.trim().length > 4 : !!customerId;
  const canSubmit = !!barberId && !!serviceId && !!time && customerOk;

  function submit() {
    if (!canSubmit) return;
    toast.success("Agendamento criado");
    navigate({ to: "/agenda" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação"
        title="Novo Agendamento"
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/agenda"><ArrowLeft size={16} strokeWidth={1.5} className="mr-1" />Voltar</Link>
          </Button>
        }
      />

      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-2">
            <Label>Barbeiro</Label>
            <Select value={barberId ?? ""} onValueChange={setBarberId}>
              <SelectTrigger><SelectValue placeholder="Selecione um barbeiro" /></SelectTrigger>
              <SelectContent>
                {mockBarbers.filter(b => b.active).map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Serviço</Label>
            <Select value={serviceId ?? ""} onValueChange={setServiceId}>
              <SelectTrigger><SelectValue placeholder="Selecione um serviço" /></SelectTrigger>
              <SelectContent>
                {mockServices.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {formatBRL(s.priceCents)} / {s.durationMin}min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Horário</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {mockTimeSlots.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTime(t)}
                  className={cn(
                    "h-10 rounded-md border text-sm transition-colors",
                    time === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:bg-muted/30",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Cliente</Label>
              <Button
                type="button" variant="ghost" size="sm"
                onClick={() => { setNewCustomer(v => !v); setCustomerId(null); }}
              >
                <Plus size={14} strokeWidth={1.5} className="mr-1" />
                {newCustomer ? "Cliente existente" : "Novo cliente"}
              </Button>
            </div>

            {!newCustomer ? (
              <Select value={customerId ?? ""} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Buscar cliente por nome ou telefone" /></SelectTrigger>
                <SelectContent>
                  {mockNovoPagamentoClientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} — {c.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="grid gap-2 rounded-md border border-dashed border-border p-3">
                <Input placeholder="Nome" value={newName} onChange={e => setNewName(e.target.value)} />
                <Input placeholder="Telefone" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                <Input placeholder="E-mail (opcional)" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" asChild><Link to="/agenda">Voltar</Link></Button>
            <Button disabled={!canSubmit} onClick={submit}>Confirmar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}