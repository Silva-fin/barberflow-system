import type { TenantStatus, ImpersonationMode } from "./types";

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  TRIAL: "Período de teste",
  ACTIVE: "Ativo",
  SUSPENDED: "Suspenso",
  CHURNED: "Cancelado",
};

export const IMPERSONATION_MODE_LABELS: Record<ImpersonationMode, string> = {
  READ_ONLY: "Somente leitura",
  ELEVATED: "Elevado",
};

export const FINANCIAL_MODULES = [
  "PaymentsEngine",
  "CommissionEngine",
  "FinancialCore",
] as const;

export function isFinancialModule(m: string): boolean {
  return (FINANCIAL_MODULES as readonly string[]).includes(m);
}
