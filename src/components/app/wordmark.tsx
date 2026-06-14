import { cn } from "@/lib/utils";

interface Props {
  collapsed?: boolean;
  className?: string;
  /** Use accent (brass) color. Default true. */
  accent?: boolean;
}

export function Wordmark({ collapsed, className, accent = true }: Props) {
  if (collapsed) {
    return (
      <span
        className={cn(
          "font-display text-3xl leading-none",
          accent ? "text-sidebar-primary" : "text-foreground",
          className,
        )}
      >
        P
      </span>
    );
  }
  return (
    <span
      className={cn(
        "font-display text-2xl uppercase leading-none tracking-[0.32em]",
        accent ? "text-sidebar-primary" : "text-foreground",
        className,
      )}
    >
      Paladino
    </span>
  );
}