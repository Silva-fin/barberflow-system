import { Link } from "@tanstack/react-router";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Bullet = { icon: LucideIcon; label: string };

export function PillarBlock({
  eyebrow, title, description, bullets, ctaLabel, ctaTo,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  bullets: Bullet[];
  ctaLabel: string;
  ctaTo: string;
  reverse?: boolean;
}) {
  return (
    <div className={cn(
      "grid items-center gap-10 md:grid-cols-2",
      reverse && "md:[&>:first-child]:order-2",
    )}>
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-sidebar-primary">{eyebrow}</span>
        <h3 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{title}</h3>
        <p className="mt-4 text-base text-muted-foreground">{description}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b.label} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-sidebar-primary">
                <b.icon size={16} strokeWidth={1.5} />
              </span>
              <span className="text-sm">{b.label}</span>
            </li>
          ))}
        </ul>
        <Link
          to={ctaTo}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sidebar-primary hover:underline"
        >
          {ctaLabel} <ArrowRight size={14} />
        </Link>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
        <MockScreen />
      </div>
    </div>
  );
}

function MockScreen() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <div className="ml-2 h-3 flex-1 rounded bg-muted/60" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="h-16 rounded-md bg-muted/40" />
        <div className="h-16 rounded-md bg-muted/40" />
        <div className="h-16 rounded-md bg-sidebar-primary/20" />
      </div>
      <div className="space-y-2">
        <div className="h-8 rounded-md bg-muted/40" />
        <div className="h-8 rounded-md bg-muted/40" />
        <div className="h-8 rounded-md bg-muted/40" />
        <div className="h-8 w-2/3 rounded-md bg-muted/40" />
      </div>
    </div>
  );
}