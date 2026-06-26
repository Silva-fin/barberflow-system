import { Layers, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatBRL } from "@/lib/format";
import type { SubscriptionPlan } from "@/lib/booking/types";
import { ItemChip } from "./item-chip";

const CYCLE_LABEL: Record<SubscriptionPlan["cycle"], string> = {
  monthly: "mês",
  quarterly: "trimestre",
  yearly: "ano",
};

export function SubscriptionCard({ plan }: { plan: SubscriptionPlan }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 transition-colors hover:border-primary/60">
      <header>
        <h3 className="font-display text-xl leading-tight">{plan.name}</h3>
        {plan.description && (
          <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
        )}
      </header>

      <div className="flex flex-wrap gap-1.5">
        {plan.items.map((item, i) => (
          <ItemChip key={`${item.type}-${i}`} item={item} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Layers size={12} /> {plan.total_cotas} cotas por ciclo
        </span>
        <span className="inline-flex items-center gap-1">
          <Repeat size={12} /> Renova a cada {CYCLE_LABEL[plan.cycle]}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-border">
        <span className="font-display text-2xl text-primary">
          {formatBRL(plan.price_cents)}
          <span className="ml-1 text-xs text-muted-foreground font-sans">/ {CYCLE_LABEL[plan.cycle]}</span>
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <Button size="sm" disabled>Assinar</Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Em breve</TooltipContent>
        </Tooltip>
      </div>
    </article>
  );
}