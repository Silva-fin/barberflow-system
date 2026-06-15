import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DateTimePicker({
  label,
  value,
  onChange,
  id,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={id} className="text-xs">{label}</Label>}
      <Input
        id={id}
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}