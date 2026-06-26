import { Package as PackageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatBRL } from "@/lib/format";
import type { PublicProduct } from "@/lib/booking/types";

export function ProductCard({ product }: { product: PublicProduct }) {
  const outOfStock = product.stock <= 0;
  return (
    <article
      className={`rounded-2xl border border-border bg-card p-4 flex flex-col gap-3 transition-colors hover:border-primary/60 ${
        outOfStock ? "opacity-60" : ""
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted/40 flex items-center justify-center">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <PackageIcon size={40} strokeWidth={1.25} className="text-muted-foreground" />
        )}
        {outOfStock && (
          <Badge variant="secondary" className="absolute top-2 right-2">Esgotado</Badge>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold leading-tight">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
        <span className="font-display text-lg text-primary">{formatBRL(product.price_cents)}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <Button size="sm" variant="outline" disabled>Adicionar</Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>{outOfStock ? "Esgotado" : "Em breve"}</TooltipContent>
        </Tooltip>
      </div>
    </article>
  );
}