import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/barbeiros")({
  head: () => ({ meta: [{ title: "Barbeiros — Navalha" }] }),
  component: BarbeirosPage,
});

const dayLabels = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function BarbeirosPage() {
  const { user } = useAuth();
  const shopId = user!.barbershopId;
  const { data: barbers = [] } = useQuery({ queryKey: ["barbers", shopId], queryFn: () => api.listBarbers(shopId) });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Equipe</h1>
          <p className="text-sm text-muted-foreground">{barbers.length} barbeiros ativos</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Novo barbeiro</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {barbers.map(b => (
          <Card key={b.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/15 text-primary font-semibold">
                    {b.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.workStart} – {b.workEnd}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1">
                {b.specialties.map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
              </div>
              <div className="mt-4 flex flex-wrap gap-1">
                {dayLabels.map((l, i) => (
                  <span key={l} className={`flex h-6 w-8 items-center justify-center rounded text-[10px] ${b.workingDays.includes(i) ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {l}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">Comissão</span>
                <span className="font-display text-xl text-primary">{b.commissionPct}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
