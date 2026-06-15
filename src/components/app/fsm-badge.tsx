import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AppointmentStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "FAILED";

export type PaymentStatus = "PENDING" | "CONFIRMED" | "REFUNDED";

export type CrmClassification =
  | "NOVO"
  | "FREQUENTE"
  | "VIP"
  | "EM_RISCO"
  | "RECUPERADO"
  | "REGULAR";

const APPT_LABEL: Record<AppointmentStatus, string> = {
  DRAFT: "Rascunho",
  SCHEDULED: "Agendado",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "No-show",
  FAILED: "Falhou",
};

const APPT_CLASS: Record<AppointmentStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  SCHEDULED: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  IN_PROGRESS: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300",
  COMPLETED: "bg-muted text-muted-foreground border-border",
  CANCELLED: "bg-destructive/15 text-destructive border-destructive/30",
  NO_SHOW: "bg-destructive/15 text-destructive border-destructive/30",
  FAILED: "bg-destructive/15 text-destructive border-destructive/30",
};

export function AppointmentBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant="outline" className={cn("font-normal", APPT_CLASS[status])}>
      {APPT_LABEL[status]}
    </Badge>
  );
}

const PAY_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  REFUNDED: "Estornado",
};

const PAY_CLASS: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300",
  CONFIRMED: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  REFUNDED: "bg-muted text-muted-foreground border-border",
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant="outline" className={cn("font-normal", PAY_CLASS[status])}>
      {PAY_LABEL[status]}
    </Badge>
  );
}

const CRM_LABEL: Record<CrmClassification, string> = {
  NOVO: "Novo",
  FREQUENTE: "Frequente",
  VIP: "VIP",
  EM_RISCO: "Em risco",
  RECUPERADO: "Recuperado",
  REGULAR: "Regular",
};

const CRM_CLASS: Record<CrmClassification, string> = {
  NOVO: "bg-sky-500/15 text-sky-700 border-sky-500/30 dark:text-sky-300",
  FREQUENTE: "bg-primary/10 text-primary border-primary/30",
  VIP: "bg-sidebar-primary/15 text-sidebar-primary border-sidebar-primary/40",
  EM_RISCO: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300",
  RECUPERADO: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  REGULAR: "bg-muted text-muted-foreground border-border",
};

export function CrmBadge({ classification }: { classification: CrmClassification }) {
  return (
    <Badge variant="outline" className={cn("font-normal", CRM_CLASS[classification])}>
      {CRM_LABEL[classification]}
    </Badge>
  );
}

/* ============ PackagePurchase ============ */
export type PackagePurchaseStatus = "PENDING_PAYMENT" | "ACTIVE" | "REVOKED";
const PKG_LABEL: Record<PackagePurchaseStatus, string> = {
  PENDING_PAYMENT: "Pagamento pendente",
  ACTIVE: "Ativo",
  REVOKED: "Revogado",
};
const PKG_CLASS: Record<PackagePurchaseStatus, string> = {
  PENDING_PAYMENT: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300",
  ACTIVE: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  REVOKED: "bg-destructive/15 text-destructive border-destructive/30",
};
export function PackagePurchaseBadge({ status }: { status: PackagePurchaseStatus }) {
  return (
    <Badge variant="outline" className={cn("font-normal", PKG_CLASS[status])}>
      {PKG_LABEL[status]}
    </Badge>
  );
}

/* ============ Subscription ============ */
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "OVERDUE" | "SUSPENDED" | "CANCELLED";
const SUB_LABEL: Record<SubscriptionStatus, string> = {
  ACTIVE: "Ativa",
  PAUSED: "Pausada",
  OVERDUE: "Em atraso",
  SUSPENDED: "Suspensa",
  CANCELLED: "Cancelada",
};
const SUB_CLASS: Record<SubscriptionStatus, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  PAUSED: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300",
  OVERDUE: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300",
  SUSPENDED: "bg-destructive/15 text-destructive border-destructive/30",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};
export function SubscriptionBadge({ status }: { status: SubscriptionStatus }) {
  return (
    <Badge variant="outline" className={cn("font-normal", SUB_CLASS[status])}>
      {SUB_LABEL[status]}
    </Badge>
  );
}

/* ============ Promotion ============ */
export type PromotionStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "CANCELLED";
const PROMO_LABEL: Record<PromotionStatus, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativa",
  PAUSED: "Pausada",
  EXPIRED: "Expirada",
  CANCELLED: "Cancelada",
};
const PROMO_CLASS: Record<PromotionStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  ACTIVE: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  PAUSED: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300",
  EXPIRED: "bg-muted text-muted-foreground border-border",
  CANCELLED: "bg-destructive/15 text-destructive border-destructive/30",
};
export function PromotionBadge({ status }: { status: PromotionStatus }) {
  return (
    <Badge variant="outline" className={cn("font-normal", PROMO_CLASS[status])}>
      {PROMO_LABEL[status]}
    </Badge>
  );
}

/* ============ Coupon ============ */
export type CouponStatus = "ACTIVE" | "EXHAUSTED" | "CANCELLED";
const COUPON_LABEL: Record<CouponStatus, string> = {
  ACTIVE: "Ativo",
  EXHAUSTED: "Esgotado",
  CANCELLED: "Cancelado",
};
const COUPON_CLASS: Record<CouponStatus, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  EXHAUSTED: "bg-muted text-muted-foreground border-border",
  CANCELLED: "bg-destructive/15 text-destructive border-destructive/30",
};
export function CouponBadge({ status }: { status: CouponStatus }) {
  return (
    <Badge variant="outline" className={cn("font-normal", COUPON_CLASS[status])}>
      {COUPON_LABEL[status]}
    </Badge>
  );
}