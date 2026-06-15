import type {
  CommunicationAudience,
  CommunicationChannel,
  CommunicationEventType,
  CommunicationLogStatus,
  ModuleName,
  NpsSurveyStatus,
} from "@/lib/constants";
import type { Role } from "@/lib/auth";

/* ============ NPS ============ */
export type NpsConfig = {
  id: string;
  company_id: string;
  enabled: boolean;
  channel: "WHATSAPP" | "EMAIL";
  delay_minutes: number;
  min_interval_days: number;
  low_score_threshold: number;
  low_score_alert_enabled: boolean;
};

export const mockNpsConfig: NpsConfig = {
  id: "nps-cfg-1",
  company_id: "shop-1",
  enabled: true,
  channel: "WHATSAPP",
  delay_minutes: 60,
  min_interval_days: 30,
  low_score_threshold: 6,
  low_score_alert_enabled: true,
};

export type NpsResponse = {
  score: number;
  comment: string | null;
  tenant_response: string | null;
  responded_at: string;
};

export type NpsSurvey = {
  id: string;
  customer_id: string;
  customer_name: string;
  appointment_id: string;
  status: NpsSurveyStatus;
  scheduled_for: string;
  sent_at?: string;
  responded_at?: string;
  expires_at: string;
  response?: NpsResponse;
};

export const mockNpsSurveys: NpsSurvey[] = [
  {
    id: "nps-1", customer_id: "c-1", customer_name: "Lucas Pereira",
    appointment_id: "ap-1", status: "RESPONDED",
    scheduled_for: "2026-06-10T18:00:00Z", sent_at: "2026-06-10T18:05:00Z",
    responded_at: "2026-06-11T09:12:00Z", expires_at: "2026-06-17T18:00:00Z",
    response: { score: 10, comment: "Excelente atendimento, voltarei!", tenant_response: "Obrigado, Lucas!", responded_at: "2026-06-11T09:12:00Z" },
  },
  {
    id: "nps-2", customer_id: "c-2", customer_name: "Mariana Costa",
    appointment_id: "ap-2", status: "RESPONDED",
    scheduled_for: "2026-06-11T16:00:00Z", sent_at: "2026-06-11T16:05:00Z",
    responded_at: "2026-06-12T11:30:00Z", expires_at: "2026-06-18T16:00:00Z",
    response: { score: 5, comment: "Esperei muito tempo.", tenant_response: null, responded_at: "2026-06-12T11:30:00Z" },
  },
  {
    id: "nps-3", customer_id: "c-3", customer_name: "Rafael Souza",
    appointment_id: "ap-3", status: "SENT",
    scheduled_for: "2026-06-13T14:00:00Z", sent_at: "2026-06-13T14:05:00Z",
    expires_at: "2026-06-20T14:00:00Z",
  },
  {
    id: "nps-4", customer_id: "c-4", customer_name: "Em breve",
    appointment_id: "ap-4", status: "PENDING",
    scheduled_for: "2026-06-15T19:00:00Z",
    expires_at: "2026-06-22T19:00:00Z",
  },
  {
    id: "nps-5", customer_id: "c-5", customer_name: "Bruno Lima",
    appointment_id: "ap-5", status: "EXPIRED",
    scheduled_for: "2026-05-20T18:00:00Z", sent_at: "2026-05-20T18:05:00Z",
    expires_at: "2026-05-27T18:00:00Z",
  },
];

/* ============ Communication Templates ============ */
export type CommTemplate = {
  template_id: string;
  company_id: string;
  event_type: CommunicationEventType;
  channel: CommunicationChannel;
  audience: CommunicationAudience;
  body_template: string;
  is_active: boolean;
  is_default: boolean;
};

export const mockCommTemplates: CommTemplate[] = [
  {
    template_id: "tpl-1", company_id: "shop-1",
    event_type: "appointment.confirmed", channel: "WHATSAPP", audience: "CLIENT",
    body_template: "Olá {{cliente_nome}}, seu agendamento de {{servico}} com {{profissional}} está confirmado para {{data}} às {{horario}}. Gerencie em {{manage_url}}.",
    is_active: true, is_default: true,
  },
  {
    template_id: "tpl-2", company_id: "shop-1",
    event_type: "appointment.reminder_24h", channel: "WHATSAPP", audience: "CLIENT",
    body_template: "Oi {{cliente_nome}}, lembrete: amanhã às {{horario}} temos seu {{servico}} marcado. Até lá!",
    is_active: true, is_default: true,
  },
  {
    template_id: "tpl-3", company_id: "shop-1",
    event_type: "appointment.completed", channel: "EMAIL", audience: "CLIENT",
    body_template: "Obrigado pela visita, {{cliente_nome}}! Conta pra gente como foi: {{nps_url}}",
    is_active: true, is_default: false,
  },
  {
    template_id: "tpl-4", company_id: "shop-1",
    event_type: "nps.low_score_alert", channel: "EMAIL", audience: "OWNER",
    body_template: "Atenção: {{cliente_nome}} avaliou com nota {{nota}}. Comentário: {{comentario}}.",
    is_active: true, is_default: true,
  },
  {
    template_id: "tpl-5", company_id: "shop-1",
    event_type: "user.invitation_sent", channel: "EMAIL", audience: "PROFESSIONAL",
    body_template: "{{user_name}}, você foi convidado para {{company_name}}. Ative: {{activation_link}}",
    is_active: false, is_default: false,
  },
];

/* ============ Communication Logs ============ */
export type CommLog = {
  log_id: string;
  template_id?: string;
  event_type: CommunicationEventType;
  channel: CommunicationChannel;
  recipient_id: string;
  recipient_type: CommunicationAudience;
  status: CommunicationLogStatus;
  scheduled_send_at?: string;
  rendered_body?: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
};

export const mockCommLogs: CommLog[] = Array.from({ length: 87 }, (_, i): CommLog => {
  const events: CommunicationEventType[] = [
    "appointment.confirmed", "appointment.reminder_24h", "appointment.completed",
    "appointment.cancelled", "nps.survey_request", "user.invitation_sent",
  ];
  const channels: CommunicationChannel[] = ["WHATSAPP", "EMAIL", "SMS"];
  const statuses: CommunicationLogStatus[] = [
    "SENT", "SENT", "SENT", "SCHEDULED", "FAILED",
    "SKIPPED_QUIET_HOURS", "SKIPPED_NO_CONSENT", "SKIPPED_CHANNEL_DISABLED",
  ];
  const ev = events[i % events.length];
  const ch = channels[i % channels.length];
  const st = statuses[i % statuses.length];
  const d = new Date(Date.now() - i * 3600_000).toISOString();
  return {
    log_id: `log-${i + 1}`,
    template_id: `tpl-${(i % 5) + 1}`,
    event_type: ev, channel: ch,
    recipient_id: `r-${(i % 12) + 1}`,
    recipient_type: "CLIENT",
    status: st,
    sent_at: st === "SENT" ? d : undefined,
    scheduled_send_at: st === "SCHEDULED" ? d : undefined,
    rendered_body: `Olá Cliente ${(i % 12) + 1}, mensagem renderizada de exemplo para evento ${ev} via ${ch}.`,
    error_message: st === "FAILED" ? "Número não encontrado no provedor." : undefined,
    created_at: d,
  };
});

/* ============ WhatsApp ============ */
export type WhatsappConnection = {
  status: "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "ERROR";
  phone_number?: string;
  connected_at?: string;
  qr_code?: string;
  qr_expires_in?: number;
  disconnect_reason?: string;
};

export const mockWhatsappConnection: WhatsappConnection = {
  status: "CONNECTED",
  phone_number: "+55 11 91234-5678",
  connected_at: "2026-06-10T13:00:00Z",
};

/* ============ Users / Invitations ============ */
export type UserRow = {
  id: string;
  company_id?: string;
  email: string;
  name?: string;
  role: Role;
  active: boolean;
};

export const mockUsers: UserRow[] = [
  { id: "u-1", company_id: "shop-1", email: "zeca@barbeariadozeca.com.br", name: "Zeca Almeida", role: "OWNER", active: true },
  { id: "u-2", company_id: "shop-1", email: "ana@barbeariadozeca.com.br", name: "Ana Vieira", role: "ADMIN", active: true },
  { id: "u-3", company_id: "shop-1", email: "carlos@barbeariadozeca.com.br", name: "Carlos Mota", role: "OPERATOR", active: true },
  { id: "u-4", company_id: "shop-1", email: "marcos@barbeariadozeca.com.br", name: "Marcos Dias", role: "PROFESSIONAL", active: true },
  { id: "u-5", company_id: "shop-1", email: "joao.antigo@barbeariadozeca.com.br", name: "João Antigo", role: "OPERATOR", active: false },
];

export type Invitation = {
  invitation_id: string;
  email: string;
  role: Role;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";
  expires_at: string;
  created_at: string;
  invited_by_user_id: string;
};

export const mockInvitations: Invitation[] = [
  { invitation_id: "inv-1", email: "novo@exemplo.com", role: "PROFESSIONAL", status: "PENDING",
    expires_at: "2026-06-22T12:00:00Z", created_at: "2026-06-15T12:00:00Z", invited_by_user_id: "u-1" },
  { invitation_id: "inv-2", email: "antigo@exemplo.com", role: "OPERATOR", status: "EXPIRED",
    expires_at: "2026-05-10T12:00:00Z", created_at: "2026-05-03T12:00:00Z", invited_by_user_id: "u-2" },
];

/* ============ Modules ============ */
export type ModuleActivation = {
  activation_id: string;
  company_id: string;
  module_name: ModuleName;
  is_active: boolean;
};

export const mockModules: ModuleActivation[] = (Object.keys({
  ESTOQUE: 1, COMISSOES: 1, PACOTES: 1, ASSINATURAS: 1, PROMOCOES: 1,
  CRM: 1, NPS: 1, FILA: 1, BOT_WHATSAPP: 1, LINK_PUBLICO: 1,
}) as ModuleName[]).map((m, i) => ({
  activation_id: `act-${i + 1}`,
  company_id: "shop-1",
  module_name: m,
  is_active: !["BOT_WHATSAPP"].includes(m),
}));

export const MODULE_DEPENDENCIES: Partial<Record<ModuleName, string>> = {
  COMISSOES: "Funciona melhor com Estoque ativo.",
  PACOTES: "Requer Catálogo de serviços.",
  ASSINATURAS: "Requer integração de pagamento.",
  NPS: "Use junto com WhatsApp ou E-mail.",
  BOT_WHATSAPP: "Requer conexão WhatsApp ativa.",
};

/* ============ Branding ============ */
export type Branding = {
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  favicon_url: string | null;
  custom_texts: Record<string, string>;
};

export const mockBranding: Branding = {
  logo_url: null,
  primary_color: "#2A2A2A",
  secondary_color: "#C9A26B",
  font_family: "Inter",
  favicon_url: null,
  custom_texts: {},
};

/* ============ Audit ============ */
export type AuditLog = {
  audit_id: string;
  company_id?: string;
  actor_id: string;
  actor_role: Role;
  action: string;
  resource_type: string;
  resource_id?: string;
  reason?: string;
  before_snapshot?: Record<string, unknown>;
  after_snapshot?: Record<string, unknown>;
  occurred_at: string;
  ip_address?: string;
};

export const mockAuditLogs: AuditLog[] = Array.from({ length: 134 }, (_, i): AuditLog => {
  const actions = ["user.role_changed", "user.invited", "module.activated", "module.deactivated",
    "branding.updated", "expense.created", "payable.paid", "appointment.cancelled"];
  const types = ["user", "module", "branding", "expense", "payable", "appointment"];
  const roles: Role[] = ["OWNER", "ADMIN"];
  return {
    audit_id: `aud-${i + 1}`,
    company_id: "shop-1",
    actor_id: `u-${(i % 4) + 1}`,
    actor_role: roles[i % roles.length],
    action: actions[i % actions.length],
    resource_type: types[i % types.length],
    resource_id: `${types[i % types.length]}-${i + 1}`,
    reason: i % 3 === 0 ? "Ajuste solicitado pelo cliente." : undefined,
    before_snapshot: { role: "OPERATOR" },
    after_snapshot: { role: "ADMIN" },
    occurred_at: new Date(Date.now() - i * 1800_000).toISOString(),
    ip_address: `200.150.${(i % 250)}.${(i * 7) % 250}`,
  };
});

export type ImpersonationAccess = {
  audit_id: string;
  grant_id?: string;
  actor_id: string;
  reason?: string;
  request: Record<string, unknown>;
  occurred_at: string;
};

export const mockImpersonationAccesses: ImpersonationAccess[] = Array.from({ length: 12 }, (_, i) => ({
  audit_id: `imp-${i + 1}`,
  grant_id: `grant-${(i % 3) + 1}`,
  actor_id: "platform-user-1",
  reason: i % 2 === 0 ? "Suporte ao cliente — ticket #" + (1000 + i) : "Investigação financeira",
  request: { path: "/api/financeiro/contas", method: "GET" },
  occurred_at: new Date(Date.now() - i * 86400_000).toISOString(),
}));