import { Badge } from "@/components/ui/badge";
import { TENANT_STATUS_LABELS } from "@/lib/owner/constants";
import type { TenantStatus } from "@/lib/owner/types";

const VARIANT: Record<TenantStatus, "secondary" | "default" | "destructive" | "outline"> = {
  TRIAL: "secondary",
  ACTIVE: "default",
  SUSPENDED: "destructive",
  CHURNED: "outline",
};

export function TenantStatusBadge({ status }: { status: TenantStatus }) {
  return (
    <Badge variant={VARIANT[status]} className="font-normal">
      {TENANT_STATUS_LABELS[status]}
    </Badge>
  );
}
