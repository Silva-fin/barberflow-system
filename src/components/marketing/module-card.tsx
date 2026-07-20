import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { CatalogModule } from "@/lib/marketing/catalog";
import { CATEGORY_LABELS } from "@/lib/marketing/catalog";

export function ModuleCard({ m }: { m: CatalogModule }) {
  const Icon = m.icon;
  return (
    <Link
      to="/modulos/$slug"
      params={{ slug: m.slug }}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-sidebar-primary/60 hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-sidebar-primary">
          <Icon size={18} strokeWidth={1.5} />
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {CATEGORY_LABELS[m.category]}
        </span>
      </div>
      <p className="mt-4 font-display text-xl leading-tight">{m.name}</p>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.tagline}</p>
      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs text-sidebar-primary opacity-0 transition-opacity group-hover:opacity-100">
        Ver detalhes <ChevronRight size={12} />
      </span>
    </Link>
  );
}