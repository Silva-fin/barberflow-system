import { useAuth, type Role } from "@/lib/auth";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const ROLES: Role[] = ["OWNER", "ADMIN", "OPERATOR", "PROFESSIONAL"];

export function RoleDevSelector() {
  if (!import.meta.env.DEV) return null;
  const { role, setRole } = useAuth();
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        Role
      </span>
      <Select value={role} onValueChange={(v) => setRole(v as Role)}>
        <SelectTrigger
          className="h-7 min-w-[8.5rem] border-dashed border-border bg-transparent px-2 text-xs"
          aria-label="Trocar role (dev)"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}