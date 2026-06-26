import { Package as PackageIcon, Scissors } from "lucide-react";
import type { PackageItem } from "@/lib/booking/types";

export function ItemChip({ item }: { item: PackageItem }) {
  const isService = item.type === "service";
  const Icon = isService ? Scissors : PackageIcon;
  const tone = isService
    ? "border-primary/30 bg-primary/10 text-primary"
    : "border-border bg-muted/40 text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${tone}`}
    >
      <Icon size={12} strokeWidth={1.75} />
      <span className="font-medium">{item.quantity}x</span>
      <span>{item.name}</span>
    </span>
  );
}