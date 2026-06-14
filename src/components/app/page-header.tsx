import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-5">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl tracking-wide text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}