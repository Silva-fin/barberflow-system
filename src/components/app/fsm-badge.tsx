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