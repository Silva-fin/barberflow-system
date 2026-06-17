export type TenantStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "CHURNED";

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  active: boolean;
  created_at: string;
}

export interface TenantHealth {
  company_id: string;
  status: TenantStatus;
  total_users: number;
  total_customers: number;
  appointments_30d: number;
  last_activity_at: string | null;
  communication_failures_7d: number;
  asaas_connected: boolean;
  whatsapp_connected: boolean;
}

export type ImpersonationMode = "READ_ONLY" | "ELEVATED";

export interface ImpersonationGrant {
  grant_id: string;
  company_id: string;
  tenant_name: string;
  mode: ImpersonationMode;
  reason: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
}

export type FlagValue = boolean | number | string | Record<string, unknown> | unknown[];
export type FlagsDict = Record<string, FlagValue>;

export type SettingValue = FlagValue;
export type SettingsDict = Record<string, SettingValue>;

export interface AuditItem {
  audit_id: string;
  company_id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  reason: string | null;
  before_snapshot: Record<string, unknown> | null;
  after_snapshot: Record<string, unknown> | null;
  occurred_at: string;
}

export interface AuditEnvelope {
  total: number;
  page: number;
  limit: number;
  items: AuditItem[];
}

export interface DeadLetterItem {
  id: string;
  module: string;
  event: string;
  error: string;
  occurred_at: string;
}

export interface RedispatchResult {
  new_log_id: string;
  status: string;
  original_log_id: string;
}

export type SimulateMode = "ok" | "empty" | "error";

export interface SimOptions {
  simulate?: SimulateMode;
}
