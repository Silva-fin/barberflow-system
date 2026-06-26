import { Check, Plus, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/format";
import type { CrossSellSuggestion } from "@/lib/booking/types";
import { ItemChip } from "./item-chip";

const CYCLE_LABEL = { monthly: "mês", quarterly: "trimestre", yearly: "ano" } as const;

export function CrossSellCard({
  suggestion, added, onAdd,
}: {
  suggestion: CrossSellSuggestion;
  added: boolean;
  onAdd: () => void;
}) {
  const { item } = suggestion;
  const isSub = suggestion.kind === "subscription";
  return (
    <article className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3 transition-colors hover:border-primary/60">
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {isSub ? "Assinatura" : "Pacote"}
        </div>
        <h3 className="mt-0.5 font-display text-lg leading-tight">{item.name}</h3>
        {item.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {item.items.map((it, i) => <ItemChip key={i} item={it} />)}
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-2 border-t border-border">
        <span className="font-display text-xl text-primary">
          {formatBRL(item.price_cents)}
          {isSub && (
            <span className="ml-1 text-xs text-muted-foreground font-sans">
              <Repeat className="inline h-3 w-3" /> /{CYCLE_LABEL[suggestion.item.cycle]}
            </span>
          )}
        </span>
        <Button size="sm" variant={added ? "secondary" : "default"} onClick={onAdd} disabled={added}>
          {added ? (
            <><Check className="mr-1 h-3.5 w-3.5" /> Adicionado</>
          ) : (
            <><Plus className="mr-1 h-3.5 w-3.5" /> Adicionar</>
          )}
        </Button>
      </div>
    </article>
  );
}