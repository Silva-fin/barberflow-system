import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MoneyInput({
  value,
  onChange,
  placeholder = "0,00",
  className,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        R$
      </span>
      <Input
        id={id}
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ""))}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}