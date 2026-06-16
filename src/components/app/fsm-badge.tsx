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

/* ============ FASE 3 ============ */

const EMERALD = "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300";
const AMBER = "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300";
const SKY = "bg-sky-500/15 text-sky-700 border-sky-500/30 dark:text-sky-300";
const NEUTRAL = "bg-muted text-muted-foreground border-border";
const DESTRUCTIVE = "bg-destructive/15 text-destructive border-destructive/30";

export type ExpenseStatus = "PENDENTE" | "PAGA" | "CANCELLED";
const EXPENSE_MAP: Record<ExpenseStatus, { label: string; cls: string }> = {
  PENDENTE: { label: "Pendente", cls: AMBER },
  PAGA: { label: "Paga", cls: EMERALD },
  CANCELLED: { label: "Cancelada", cls: NEUTRAL },
};
export function ExpenseBadge({ status }: { status: ExpenseStatus }) {
  const m = EXPENSE_MAP[status];
  return <Badge variant="outline" className={cn("font-normal", m.cls)}>{m.label}</Badge>;
}

export type PayableStatus = "OPEN" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
const PAYABLE_MAP: Record<PayableStatus, { label: string; cls: string }> = {
  OPEN: { label: "Em aberto", cls: AMBER },
  PARTIALLY_PAID: { label: "Parcial", cls: SKY },
  PAID: { label: "Paga", cls: EMERALD },
  CANCELLED: { label: "Cancelada", cls: NEUTRAL },
};
export function PayableBadge({ status }: { status: PayableStatus }) {
  const m = PAYABLE_MAP[status];
  return <Badge variant="outline" className={cn("font-normal", m.cls)}>{m.label}</Badge>;
}

export type InstallmentStatus = "OPEN" | "PAID" | "CANCELLED";
const INSTALLMENT_MAP: Record<InstallmentStatus, { label: string; cls: string }> = {
  OPEN: { label: "Em aberto", cls: AMBER },
  PAID: { label: "Paga", cls: EMERALD },
  CANCELLED: { label: "Cancelada", cls: NEUTRAL },
};
export function InstallmentBadge({ status }: { status: InstallmentStatus }) {
  const m = INSTALLMENT_MAP[status];
  return <Badge variant="outline" className={cn("font-normal", m.cls)}>{m.label}</Badge>;
}

export type ReconciliationStatus = "OPEN" | "CLOSED";
const RECON_MAP: Record<ReconciliationStatus, { label: string; cls: string }> = {
  OPEN: { label: "Aberta", cls: AMBER },
  CLOSED: { label: "Fechada", cls: EMERALD },
};
export function ReconciliationBadge({ status }: { status: ReconciliationStatus }) {
  const m = RECON_MAP[status];
  return <Badge variant="outline" className={cn("font-normal", m.cls)}>{m.label}</Badge>;
}

export type StatementStatus = "PENDING" | "MATCHED" | "DISMISSED";
const STATEMENT_MAP: Record<StatementStatus, { label: string; cls: string }> = {
  PENDING: { label: "Pendente", cls: AMBER },
  MATCHED: { label: "Conciliado", cls: EMERALD },
  DISMISSED: { label: "Dispensado", cls: NEUTRAL },
};
export function StatementBadge({ status }: { status: StatementStatus }) {
  const m = STATEMENT_MAP[status];
  return <Badge variant="outline" className={cn("font-normal", m.cls)}>{m.label}</Badge>;
}

export type TransferStatus = "REQUESTED" | "COMPLETED" | "FAILED";
const TRANSFER_MAP: Record<TransferStatus, { label: string; cls: string }> = {
  REQUESTED: { label: "Solicitada", cls: AMBER },
  COMPLETED: { label: "Concluída", cls: EMERALD },
  FAILED: { label: "Falhou", cls: DESTRUCTIVE },
};
export function TransferBadge({ status }: { status: TransferStatus }) {
  const m = TRANSFER_MAP[status];
  return <Badge variant="outline" className={cn("font-normal", m.cls)}>{m.label}</Badge>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge variant="outline" className={cn("font-normal", active ? EMERALD : NEUTRAL)}>
      {active ? "Ativo" : "Inativo"}
    </Badge>
  );
}

/* ============ FASE 4 ============ */

export type NpsSurveyStatus = "PENDING" | "SENT" | "RESPONDED" | "EXPIRED";
const NPS_MAP: Record<NpsSurveyStatus, { label: string; cls: string }> = {
  PENDING: { label: "Pendente", cls: AMBER },
  SENT: { label: "Enviada", cls: SKY },
  RESPONDED: { label: "Respondida", cls: EMERALD },
  EXPIRED: { label: "Expirada", cls: NEUTRAL },
};
export function NpsSurveyBadge({ status }: { status: NpsSurveyStatus }) {
  const m = NPS_MAP[status];
  return <Badge variant="outline" className={cn("font-normal", m.cls)}>{m.label}</Badge>;
}

export type CommunicationLogStatus =
  | "SENT" | "SCHEDULED" | "FAILED"
  | "SKIPPED_QUIET_HOURS" | "SKIPPED_NO_CONSENT"
  | "SKIPPED_CHANNEL_DISABLED" | "SKIPPED_NO_TEMPLATE";
const COMMLOG_MAP: Record<CommunicationLogStatus, { label: string; cls: string }> = {
  SENT: { label: "Enviada", cls: EMERALD },
  SCHEDULED: { label: "Agendada", cls: SKY },
  FAILED: { label: "Falhou", cls: DESTRUCTIVE },
  SKIPPED_QUIET_HOURS: { label: "Adiada (silêncio)", cls: NEUTRAL },
  SKIPPED_NO_CONSENT: { label: "Sem consentimento", cls: NEUTRAL },
  SKIPPED_CHANNEL_DISABLED: { label: "Canal desativado", cls: NEUTRAL },
  SKIPPED_NO_TEMPLATE: { label: "Sem template", cls: NEUTRAL },
};
export function CommunicationLogBadge({ status }: { status: CommunicationLogStatus }) {
  const m = COMMLOG_MAP[status];
  return <Badge variant="outline" className={cn("font-normal", m.cls)}>{m.label}</Badge>;
}

/** NPS score chip: 0–6 detrator (destructive), 7–8 neutro (amber), 9–10 promotor (emerald). */
export function NpsScoreChip({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  const cls = score <= 6 ? DESTRUCTIVE : score <= 8 ? AMBER : EMERALD;
  return (
    <Badge variant="outline" className={cn("font-mono font-normal tabular-nums", cls)}>
      {score}
    </Badge>
  );
}

/* ============ RESKIN: Comissões & Pagamentos ============ */

export type CommissionStatus = "PENDING" | "DUE_SOON" | "PAID" | "REFUNDED";
const COMMISSION_MAP: Record<CommissionStatus, { label: string; cls: string }> = {
  PENDING: { label: "Pendente", cls: AMBER },
  DUE_SOON: { label: "Vence em breve", cls: SKY },
  PAID: { label: "Paga", cls: EMERALD },
  REFUNDED: { label: "Estornada", cls: DESTRUCTIVE },
};
export function CommissionBadge({ status }: { status: CommissionStatus }) {
  const m = COMMISSION_MAP[status];
  return <Badge variant="outline" className={cn("font-normal", m.cls)}>{m.label}</Badge>;
}

export type PayoutStatus = "PAID" | "PENDING" | "FAILED";
const PAYOUT_MAP: Record<PayoutStatus, { label: string; cls: string }> = {
  PAID: { label: "Pago", cls: EMERALD },
  PENDING: { label: "Pendente", cls: AMBER },
  FAILED: { label: "Falhou", cls: DESTRUCTIVE },
};
export function PayoutBadge({ status }: { status: PayoutStatus }) {
  const m = PAYOUT_MAP[status];
  return <Badge variant="outline" className={cn("font-normal", m.cls)}>{m.label}</Badge>;
}