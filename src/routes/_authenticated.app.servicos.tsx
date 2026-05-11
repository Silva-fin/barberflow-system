import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/servicos")({
  head: () => ({ meta: [{ title: "Serviços — Navalha" }] }),
  component: ServicosPage,
});

function ServicosPage() {
  const { user } = useAuth();
  const shopId = user!.barbershopId;
  const { data: services = [] } = useQuery({ queryKey: ["services", shopId], queryFn: () => api.listServices(shopId) });
  const { data: barbers = [] } = useQuery({ queryKey: ["barbers", shopId], queryFn: () => api.listBarbers(shopId) });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Serviços</h1>
          <p className="text-sm text-muted-foreground">{services.length} serviços no catálogo</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Novo serviço</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serviço</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Realizado por</TableHead>
              <TableHead className="text-right">Preço</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map(s => (
              <TableRow key={s.id}>
                <TableCell>
                  <p className="font-medium">{s.name}</p>
                  {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3 text-muted-foreground" /> {s.durationMin} min
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {s.barberIds.map(bid => {
                      const b = barbers.find(x => x.id === bid);
                      return b ? <Badge key={bid} variant="secondary" className="text-[10px]">{b.name.split(" ")[0]}</Badge> : null;
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-right font-display text-lg text-primary">{formatBRL(s.priceCents)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
