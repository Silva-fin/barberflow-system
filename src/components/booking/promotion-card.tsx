import { CalendarDays, Sparkles, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Promotion } from "@/lib/booking/types";

function formatDate(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}

export function PromotionCard({ promo }: { promo: Promotion }) {
  const Icon = promo.kind === "auto" ? Sparkles : Ticket;
  const until = formatDate(promo.valid_until);
  return (
    <article className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 transition-colors hover:border-primary/60">
      <header className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon size={18} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg leading-tight">{promo.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{promo.description}</p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
        {promo.kind === "auto" ? (
          <Badge variant="outline" className="border-primary/40 text-primary">
            Aplicado automaticamente
          </Badge>
        ) : (
          <Badge variant="outline" className="border-primary/40 text-primary font-mono">
            Use o cupom: {promo.coupon_code}
          </Badge>
        )}
        {until && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays size={12} /> Válido até {until}
          </span>
        )}
      </div>
    </article>
  );
}