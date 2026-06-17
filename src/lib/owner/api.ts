import {
  tenants as seedTenants,
  healthByTenant as seedHealth,
  flagsByTenant as seedFlags,
  grants as seedGrants,
  settings as seedSettings,
  auditLog as seedAudit,
  deadLetter as seedDeadLetter,
} from "./mock";
import type {
  TenantSummary,
  TenantHealth,
  TenantStatus,
  ImpersonationGrant,
  ImpersonationMode,
  FlagsDict,
  FlagValue,
  SettingsDict,
  SettingValue,
  AuditEnvelope,
  AuditItem,
  DeadLetterItem,
  RedispatchResult,
  SimOptions,
} from "./types";

// in-memory mutable copies
let tenants: TenantSummary[] = seedTenants.map((t) => ({ ...t }));
const health: Record<string, TenantHealth> = Object.fromEntries(
  Object.entries(seedHealth).map(([k, v]) => [k, { ...v }]),
);
const flags: Record<string, FlagsDict> = Object.fromEntries(
  Object.entries(seedFlags).map(([k, v]) => [k, { ...v }]),
);
let grants: ImpersonationGrant[] = seedGrants.map((g) => ({ ...g }));
let settings: SettingsDict = { ...seedSettings };
const audit: AuditItem[] = seedAudit.slice();
const deadLetter: DeadLetterItem[] = seedDeadLetter.slice();

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

function maybeFail(opts?: SimOptions): boolean {
  if (opts?.simulate === "error") return true;
  return false;
}

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---- Tenants
export async function listTenants(
  filters: { status?: TenantStatus | "ALL"; search?: string } = {},
  opts?: SimOptions,
): Promise<{ items: TenantSummary[]; total: number }> {
  await delay();
  if (maybeFail(opts)) throw new Error("Falha ao listar tenants");
  if (opts?.simulate === "empty") return { items: [], total: 0 };
  const search = (filters.search ?? "").trim().toLowerCase();
  const items = tenants.filter((t) => {
    if (filters.status && filters.status !== "ALL" && t.status !== filters.status) return false;
    if (search && !t.name.toLowerCase().includes(search) && !t.slug.toLowerCase().includes(search)) return false;
    return true;
  });
  return { items, total: items.length };
}

export async function getTenant(id: string, opts?: SimOptions): Promise<TenantSummary> {
  await delay();
  if (maybeFail(opts)) throw new Error("Falha ao carregar tenant");
  const t = tenants.find((x) => x.id === id);
  if (!t) throw new Error("Tenant não encontrado");
  return { ...t };
}

export async function getTenantHealth(id: string, opts?: SimOptions): Promise<TenantHealth> {
  await delay();
  if (maybeFail(opts)) throw new Error("Falha ao carregar saúde");
  const h = health[id];
  if (!h) throw new Error("Sem dados de saúde");
  return { ...h };
}

export async function setTenantStatus(
  id: string,
  status: TenantStatus,
  reason?: string,
): Promise<TenantSummary> {
  await delay();
  if (status === "SUSPENDED" && !reason?.trim()) throw new Error("Motivo obrigatório");
  const idx = tenants.findIndex((t) => t.id === id);
  if (idx < 0) throw new Error("Tenant não encontrado");
  const updated = { ...tenants[idx], status, active: status === "ACTIVE" || status === "TRIAL" };
  tenants[idx] = updated;
  if (health[id]) health[id] = { ...health[id], status };
  return { ...updated };
}

// ---- Flags
export async function getFlags(tenantId: string, opts?: SimOptions): Promise<FlagsDict> {
  await delay();
  if (maybeFail(opts)) throw new Error("Config não encontrada");
  if (opts?.simulate === "empty") return {};
  return { ...(flags[tenantId] ?? {}) };
}

export async function setFlag(
  tenantId: string,
  key: string,
  value: FlagValue,
  opts?: SimOptions,
): Promise<FlagsDict> {
  await delay(200);
  if (maybeFail(opts)) throw new Error("Falha ao atualizar flag");
  const current = flags[tenantId] ?? {};
  flags[tenantId] = { ...current, [key]: value };
  return { ...flags[tenantId] };
}

// ---- Impersonation
export async function listGrants(opts?: SimOptions): Promise<ImpersonationGrant[]> {
  await delay();
  if (maybeFail(opts)) throw new Error("Falha ao listar grants");
  if (opts?.simulate === "empty") return [];
  return grants.filter((g) => !g.revoked_at && new Date(g.expires_at).getTime() > Date.now()).map((g) => ({ ...g }));
}

export async function createGrant(input: {
  company_id: string;
  mode: ImpersonationMode;
  reason: string;
  duration_minutes: number;
}): Promise<ImpersonationGrant> {
  await delay();
  if (!input.reason?.trim()) throw new Error("Motivo obrigatório");
  if (input.mode === "ELEVATED" && input.reason.trim().length < 20)
    throw new Error("Modo elevado exige motivo com pelo menos 20 caracteres");
  if (input.duration_minutes < 1 || input.duration_minutes > 480)
    throw new Error("Duração deve estar entre 1 e 480 minutos");
  const tenant = tenants.find((t) => t.id === input.company_id);
  if (!tenant) throw new Error("Tenant não encontrado");
  const grant: ImpersonationGrant = {
    grant_id: newId("g"),
    company_id: input.company_id,
    tenant_name: tenant.name,
    mode: input.mode,
    reason: input.reason.trim(),
    expires_at: new Date(Date.now() + input.duration_minutes * 60_000).toISOString(),
    revoked_at: null,
    created_at: new Date().toISOString(),
  };
  grants = [grant, ...grants];
  return { ...grant };
}

export async function revokeGrant(grantId: string): Promise<void> {
  await delay();
  grants = grants.map((g) => (g.grant_id === grantId ? { ...g, revoked_at: new Date().toISOString() } : g));
}

// ---- Settings
export async function getSettings(opts?: SimOptions): Promise<SettingsDict> {
  await delay();
  if (maybeFail(opts)) throw new Error("Falha ao carregar configurações");
  if (opts?.simulate === "empty") return {};
  return { ...settings };
}

export async function setSetting(key: string, value: SettingValue): Promise<SettingsDict> {
  await delay(200);
  settings = { ...settings, [key]: value };
  return { ...settings };
}

// ---- Audit
export async function listAudit(
  filters: {
    company_id?: string;
    actor_id?: string;
    action?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  } = {},
  opts?: SimOptions,
): Promise<AuditEnvelope> {
  await delay();
  if (maybeFail(opts)) throw new Error("Falha ao carregar auditoria");
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 25;
  if (opts?.simulate === "empty") return { total: 0, page, limit, items: [] };
  const all = audit.filter((a) => {
    if (filters.company_id && a.company_id !== filters.company_id) return false;
    if (filters.actor_id && !a.actor_id.includes(filters.actor_id)) return false;
    if (filters.action && a.action !== filters.action) return false;
    if (filters.date_from && new Date(a.occurred_at) < new Date(filters.date_from)) return false;
    if (filters.date_to && new Date(a.occurred_at) > new Date(filters.date_to)) return false;
    return true;
  });
  const start = (page - 1) * limit;
  return { total: all.length, page, limit, items: all.slice(start, start + limit) };
}

export function distinctActions(): string[] {
  return Array.from(new Set(audit.map((a) => a.action))).sort();
}

// ---- Communications
export async function redispatchCommunication(logId: string, reason: string): Promise<RedispatchResult> {
  await delay();
  if (!logId.trim()) throw new Error("log_id obrigatório");
  if (!reason.trim()) throw new Error("Motivo obrigatório");
  // simple UUID-ish check
  if (logId.trim().length < 8) throw new Error("log_id inválido");
  return {
    new_log_id: newId("log"),
    status: "QUEUED",
    original_log_id: logId.trim(),
  };
}

// ---- Dead-letter
export async function listDeadLetter(opts?: SimOptions): Promise<DeadLetterItem[]> {
  await delay();
  if (maybeFail(opts)) throw new Error("Falha ao carregar dead-letter");
  if (opts?.simulate === "empty") return [];
  return deadLetter.slice();
}

export async function replayDeadLetter(id: string, reason: string): Promise<void> {
  await delay();
  if (!reason.trim()) throw new Error("Motivo obrigatório");
  // mock: no-op
  void id;
}
