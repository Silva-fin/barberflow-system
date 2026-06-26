import { CalendarClock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatBRL } from "@/lib/format";
import type { Package } from "@/lib/booking/types";
import { ItemChip } from "./item-chip";

export function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 transition-colors hover:border-primary/60">
      <header>
        <h3 className="font-display text-xl leading-tight">{pkg.name}</h3>
        {pkg.description && (
          <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>
        )}
      </header>

      <div className="flex flex-wrap gap-1.5">
        {pkg.items.map((item, i) => (
          <ItemChip key={`${item.type}-${i}`} item={item} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Layers size={12} /> {pkg.total_cotas} cotas no total
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarClock size={12} /> Válido por {pkg.validity_days} dias
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-border">
        <span className="font-display text-2xl text-primary">{formatBRL(pkg.price_cents)}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <Button size="sm" disabled>Adicionar ao carrinho</Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Em breve</TooltipContent>
        </Tooltip>
      </div>
    </article>
  );
}