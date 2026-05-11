import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Navalha" }] }),
  component: ClientesPage,
});

function ClientesPage() {
  const { user } = useAuth();
  const shopId = user!.barbershopId;
  const { data: clients = [] } = useQuery({ queryKey: ["clients", shopId], queryFn: () => api.listClients(shopId) });
  const [q, setQ] = useState("");

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clients.length} cadastrados</p>
        </div>
        <div className="relative w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou telefone" className="pl-9" />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="text-right">Visitas</TableHead>
              <TableHead className="text-right">Total gasto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-medium text-primary">
                      {c.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
                    </div>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      {c.notes && <p className="text-xs text-muted-foreground line-clamp-1">{c.notes}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{c.phone}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.email ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{c.totalAppointments}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">{formatBRL(c.totalSpentCents)}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">Nenhum cliente encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
