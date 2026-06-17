import { cn } from "@/lib/utils";

export function quotaPercent(remaining: number, total: number) {
  if (total === 0) return 0;
  return Math.max(0, Math.min(100, (remaining / total) * 100));
}

export function quotaColor(remaining: number, total: number) {
  if (total === 0 || remaining === 0) return "bg-muted-foreground/60";
  const pct = (remaining / total) * 100;
  if (pct < 25) return "bg-warning";
  if (pct < 50) return "bg-primary/60";
  return "bg-primary";
}

export function QuotaBar({
  remaining,
  total,
  expired,
  className,
}: {
  remaining: number;
  total: number;
  expired?: boolean;
  className?: string;
}) {
  const pct = quotaPercent(remaining, total);
  const color = expired ? "bg-destructive/70" : quotaColor(remaining, total);
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full transition-all", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}