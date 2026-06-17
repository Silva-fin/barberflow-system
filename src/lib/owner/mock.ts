import type {
  TenantSummary,
  TenantHealth,
  ImpersonationGrant,
  FlagsDict,
  SettingsDict,
  AuditItem,
  DeadLetterItem,
} from "./types";

export const tenants: TenantSummary[] = [
  { id: "t-001", name: "Barbearia do Zeca",      slug: "zeca",       status: "ACTIVE",    active: true,  created_at: "2024-03-12T10:00:00Z" },
  { id: "t-002", name: "Studio Lâmina",           slug: "lamina",     status: "ACTIVE",    active: true,  created_at: "2024-06-21T14:20:00Z" },
  { id: "t-003", name: "Corte & Cia",             slug: "cortecia",   status: "TRIAL",     active: true,  created_at: "2026-05-30T09:10:00Z" },
  { id: "t-004", name: "Navalha de Ouro",         slug: "navalha",    status: "TRIAL",     active: true,  created_at: "2026-06-02T16:45:00Z" },
  { id: "t-005", name: "Barba Boêmia",            slug: "boemia",     status: "SUSPENDED", active: false, created_at: "2024-01-08T11:00:00Z" },
  { id: "t-006", name: "Imperial Barber",         slug: "imperial",   status: "ACTIVE",    active: true,  created_at: "2023-11-15T08:30:00Z" },
  { id: "t-007", name: "Mestre da Tesoura",       slug: "mestre",     status: "CHURNED",   active: false, created_at: "2023-04-02T12:00:00Z" },
  { id: "t-008", name: "Vintage Shop",            slug: "vintage",    status: "ACTIVE",    active: true,  created_at: "2024-09-19T17:15:00Z" },
  { id: "t-009", name: "Garagem do Barbeiro",     slug: "garagem",    status: "SUSPENDED", active: false, created_at: "2024-02-11T13:25:00Z" },
  { id: "t-010", name: "Reserva Cavalheiro",      slug: "reserva",    status: "CHURNED",   active: false, created_at: "2023-07-28T10:40:00Z" },
];

export const healthByTenant: Record<string, TenantHealth> = {
  "t-001": { company_id: "t-001", status: "ACTIVE",    total_users: 8,  total_customers: 1240, appointments_30d: 412, last_activity_at: "2026-06-16T18:22:00Z", communication_failures_7d: 2,  asaas_connected: true,  whatsapp_connected: true  },
  "t-002": { company_id: "t-002", status: "ACTIVE",    total_users: 4,  total_customers:  680, appointments_30d: 198, last_activity_at: "2026-06-17T09:11:00Z", communication_failures_7d: 0,  asaas_connected: true,  whatsapp_connected: false },
  "t-003": { company_id: "t-003", status: "TRIAL",     total_users: 2,  total_customers:   12, appointments_30d:   4, last_activity_at: "2026-06-15T20:00:00Z", communication_failures_7d: 0,  asaas_connected: false, whatsapp_connected: false },
  "t-004": { company_id: "t-004", status: "TRIAL",     total_users: 1,  total_customers:    0, appointments_30d:   0, last_activity_at: null,                    communication_failures_7d: 0,  asaas_connected: false, whatsapp_connected: false },
  "t-005": { company_id: "t-005", status: "SUSPENDED", total_users: 3,  total_customers:  220, appointments_30d:   8, last_activity_at: "2026-05-02T14:00:00Z", communication_failures_7d: 27, asaas_connected: true,  whatsapp_connected: false },
  "t-006": { company_id: "t-006", status: "ACTIVE",    total_users: 12, total_customers: 2105, appointments_30d: 730, last_activity_at: "2026-06-17T07:50:00Z", communication_failures_7d: 1,  asaas_connected: true,  whatsapp_connected: true  },
  "t-007": { company_id: "t-007", status: "CHURNED",   total_users: 0,  total_customers:  150, appointments_30d:   0, last_activity_at: "2025-09-14T11:00:00Z", communication_failures_7d: 0,  asaas_connected: false, whatsapp_connected: false },
  "t-008": { company_id: "t-008", status: "ACTIVE",    total_users: 5,  total_customers:  410, appointments_30d: 142, last_activity_at: "2026-06-16T22:30:00Z", communication_failures_7d: 0,  asaas_connected: true,  whatsapp_connected: true  },
  "t-009": { company_id: "t-009", status: "SUSPENDED", total_users: 2,  total_customers:   90, appointments_30d:   3, last_activity_at: "2026-04-19T08:00:00Z", communication_failures_7d: 14, asaas_connected: false, whatsapp_connected: false },
  "t-010": { company_id: "t-010", status: "CHURNED",   total_users: 0,  total_customers:   60, appointments_30d:   0, last_activity_at: "2025-12-01T15:00:00Z", communication_failures_7d: 0,  asaas_connected: false, whatsapp_connected: false },
};

export const flagsByTenant: Record<string, FlagsDict> = {
  "t-001": {
    use_communication_service: true,
    allows_subscription_pause: true,
    allows_subscription_cancel: true,
    booking_window_days: 30,
    rate_limits: { sms_per_day: 200, email_per_day: 1000 },
  },
  "t-002": {
    use_communication_service: true,
    allows_subscription_pause: false,
    allows_subscription_cancel: true,
    booking_window_days: 14,
  },
  "t-003": {},
  "t-004": {
    use_communication_service: false,
    allows_subscription_pause: false,
    allows_subscription_cancel: false,
  },
  "t-005": {
    use_communication_service: false,
    allows_subscription_pause: false,
    allows_subscription_cancel: true,
  },
  "t-006": {
    use_communication_service: true,
    allows_subscription_pause: true,
    allows_subscription_cancel: true,
    booking_window_days: 60,
    rate_limits: { sms_per_day: 500, email_per_day: 5000 },
  },
  "t-007": {},
  "t-008": { use_communication_service: true, allows_subscription_pause: true, allows_subscription_cancel: false },
  "t-009": { use_communication_service: false },
  "t-010": {},
};

export const grants: ImpersonationGrant[] = [
  {
    grant_id: "g-001",
    company_id: "t-001",
    tenant_name: "Barbearia do Zeca",
    mode: "READ_ONLY",
    reason: "Investigando inconsistência em comissões reportada pelo cliente",
    expires_at: new Date(Date.now() + 22 * 60 * 1000).toISOString(),
    revoked_at: null,
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    grant_id: "g-002",
    company_id: "t-005",
    tenant_name: "Barba Boêmia",
    mode: "ELEVATED",
    reason: "Reativando integração WhatsApp após reset do tenant",
    expires_at: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    revoked_at: null,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

export const settings: SettingsDict = {
  default_trial_days: 14,
  support_email: "suporte@paladino.com",
  maintenance_mode: false,
  rate_limits: { api_per_minute: 600, login_per_hour: 30 },
};

const ACTIONS = [
  "tenant.suspended",
  "tenant.reactivated",
  "impersonated_request",
  "flag.updated",
  "settings.updated",
  "communication.redispatched",
];
const RESOURCES = ["company", "user", "flag", "setting", "communication_log"];

function pad(n: number) { return n.toString().padStart(2, "0"); }
function isoDaysAgo(d: number) {
  const date = new Date(Date.now() - d * 86_400_000);
  return date.toISOString();
}

export const auditLog: AuditItem[] = Array.from({ length: 87 }, (_, i) => {
  const tenant = tenants[i % tenants.length];
  const action = ACTIONS[i % ACTIONS.length];
  const resource = RESOURCES[i % RESOURCES.length];
  const isImp = action === "impersonated_request";
  return {
    audit_id: `a-${pad(i + 1)}`,
    company_id: tenant.id,
    actor_id: isImp ? "platform-owner-1" : `user-${(i % 5) + 1}`,
    actor_role: isImp ? "PLATFORM_OWNER" : (["OWNER","ADMIN","OPERATOR","PROFESSIONAL"][i % 4] as string),
    action,
    resource_type: resource,
    resource_id: `${resource}-${pad((i % 20) + 1)}`,
    reason: action === "tenant.suspended" || isImp ? "Investigação operacional registrada pelo time de plataforma." : null,
    before_snapshot: action.includes("updated") || action === "tenant.suspended" ? { value: "old" } : null,
    after_snapshot: action.includes("updated") || action === "tenant.suspended" || action === "tenant.reactivated" ? { value: "new" } : null,
    occurred_at: isoDaysAgo(i * 0.4),
  };
});

export const deadLetter: DeadLetterItem[] = [
  { id: "dl-1", module: "PaymentsEngine",   event: "asaas.charge.failed",       error: "Timeout 504 ao consultar Asaas",         occurred_at: isoDaysAgo(0.2) },
  { id: "dl-2", module: "CommunicationCore", event: "whatsapp.send.failed",     error: "Token inválido",                          occurred_at: isoDaysAgo(0.5) },
  { id: "dl-3", module: "CommissionEngine", event: "commission.recalc.failed",   error: "Divisão por zero em regra customizada",  occurred_at: isoDaysAgo(1.1) },
  { id: "dl-4", module: "BookingService",   event: "appointment.confirm.failed", error: "Conflito de horário detectado",          occurred_at: isoDaysAgo(2.3) },
  { id: "dl-5", module: "FinancialCore",    event: "ledger.entry.failed",        error: "Saldo negativo bloqueado",               occurred_at: isoDaysAgo(3.0) },
];
