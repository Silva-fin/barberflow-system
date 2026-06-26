import { Clock, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/format";
import type { PublicService } from "@/lib/booking/types";

export function ServiceCard({
  service,
  onBook,
}: {
  service: PublicService;
  onBook: (id: string) => void;
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-5 flex items-center gap-4 transition-colors hover:border-primary/60">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Scissors size={20} strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold">{service.name}</h3>
        {service.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{service.description}</p>
        )}
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {service.duration_min} min
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="font-display text-lg text-primary">{formatBRL(service.price_cents)}</span>
        <Button size="sm" onClick={() => onBook(service.id)}>
          Agendar
        </Button>
      </div>
    </article>
  );
}