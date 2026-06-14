import type { AppointmentStatus, PaymentStatus, CrmClassification } from "@/components/app/fsm-badge";

/* =============================== APPOINTMENTS =============================== */

export type AppointmentService = { name: string; durationMin: number; price: string };
export type Transition = { at: string; from: AppointmentStatus | "—"; to: AppointmentStatus; by: string };

export type AppointmentDetail = {
  id: string;
  status: AppointmentStatus;
  clientId: string;
  clientName: string;
  clientPhone: string;
  startsAt: string;
  endsAt: string;
  professionalName: string;
  services: AppointmentService[];
  subtotal: string;
  discount: string;
  total: string;
  deposit?: { amount: string; status: PaymentStatus; paidAt: string };
  transitions: Transition[];
};

function iso(daysFromNow: number, h: number, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const mockAppointments: AppointmentDetail[] = [
  {
    id: "ap-001",
    status: "SCHEDULED",
    clientId: "c-001",
    clientName: "Henrique Costa",
    clientPhone: "(11) 98123-4567",
    startsAt: iso(0, 14, 30),
    endsAt: iso(0, 15, 30),
    professionalName: "Rafa Mendes",
    services: [
      { name: "Corte degradê", durationMin: 45, price: "65.00" },
      { name: "Barba terapia", durationMin: 15, price: "35.00" },
    ],
    subtotal: "100.00",
    discount: "0.00",
    total: "100.00",
    deposit: { amount: "30.00", status: "CONFIRMED", paidAt: iso(-1, 10, 12) },
    transitions: [
      { at: iso(-2, 9, 5), from: "—", to: "DRAFT", by: "Bot agendamento" },
      { at: iso(-2, 9, 6), from: "DRAFT", to: "SCHEDULED", by: "Bot agendamento" },
    ],
  },
  {
    id: "ap-002",
    status: "IN_PROGRESS",
    clientId: "c-002",
    clientName: "Marina Souza",
    clientPhone: "(11) 97777-1212",
    startsAt: iso(0, 11, 0),
    endsAt: iso(0, 12, 0),
    professionalName: "Zeca Almeida",
    services: [{ name: "Coloração", durationMin: 60, price: "180.00" }],
    subtotal: "180.00",
    discount: "20.00",
    total: "160.00",
    transitions: [
      { at: iso(-1, 18, 0), from: "—", to: "SCHEDULED", by: "Recepção" },
      { at: iso(0, 11, 2), from: "SCHEDULED", to: "IN_PROGRESS", by: "Recepção" },
    ],
  },
  {
    id: "ap-003",
    status: "COMPLETED",
    clientId: "c-003",
    clientName: "João Pedro Lima",
    clientPhone: "(11) 96655-4433",
    startsAt: iso(-1, 16, 0),
    endsAt: iso(-1, 16, 45),
    professionalName: "Caio Souza",
    services: [{ name: "Corte masculino", durationMin: 30, price: "50.00" }],
    subtotal: "50.00",
    discount: "0.00",
    total: "50.00",
    transitions: [
      { at: iso(-3, 10, 0), from: "—", to: "SCHEDULED", by: "Bot agendamento" },
      { at: iso(-1, 16, 0), from: "SCHEDULED", to: "IN_PROGRESS", by: "Recepção" },
      { at: iso(-1, 16, 50), from: "IN_PROGRESS", to: "COMPLETED", by: "Recepção" },
    ],
  },
  {
    id: "ap-004",
    status: "CANCELLED",
    clientId: "c-004",
    clientName: "Bruno Carvalho",
    clientPhone: "(11) 95544-9988",
    startsAt: iso(-2, 9, 0),
    endsAt: iso(-2, 9, 30),
    professionalName: "Bruno Lima",
    services: [{ name: "Corte infantil", durationMin: 30, price: "40.00" }],
    subtotal: "40.00",
    discount: "0.00",
    total: "40.00",
    transitions: [
      { at: iso(-4, 11, 0), from: "—", to: "SCHEDULED", by: "Bot" },
      { at: iso(-2, 8, 30), from: "SCHEDULED", to: "CANCELLED", by: "Cliente · WhatsApp" },
    ],
  },
];

/* =============================== CUSTOMERS =============================== */

export type Quota = {
  id: string;
  type: string;
  remaining: number;
  total: number;
  validUntil: string | null;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
};

export type Consent = {
  type: "COMMUNICATION" | "MARKETING" | "DATA_PROCESSING";
  status: "GRANTED" | "REVOKED";
  updatedAt: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  classification: CrmClassification;
  activeQuotas: number;
  daysSinceLastVisit: number | null;
  insights: { id: string; title: string; body: string }[];
  history: { id: string; date: string; service: string; status: AppointmentStatus }[];
  quotas: Quota[];
  consents: Consent[];
};

const NAMES = [
  "Henrique Costa","Marina Souza","João Pedro Lima","Bruno Carvalho","Ana Beatriz Rocha",
  "Carlos Vinícius","Diego Andrade","Eduarda Martins","Felipe Tavares","Gabriel Nunes",
  "Helena Prado","Isabela Ramos","Júlia Vieira","Lucas Faria","Mariana Castro",
  "Nicolas Pinto","Otávio Brito","Patrícia Lopes","Rafael Diniz","Sofia Albuquerque",
  "Tiago Moreira","Vanessa Cunha","William Sá","Yasmin Borges",
];

const CLASSIFICATIONS: CrmClassification[] = ["NOVO","FREQUENTE","VIP","EM_RISCO","RECUPERADO","REGULAR"];

export const mockCustomers: Customer[] = NAMES.map((name, i) => {
  const cls = CLASSIFICATIONS[i % CLASSIFICATIONS.length];
  return {
    id: `c-${String(i + 1).padStart(3, "0")}`,
    name,
    phone: `(11) 9${String(1000 + i)}-${String(2000 + i * 7).slice(0, 4)}`,
    classification: cls,
    activeQuotas: i % 4 === 0 ? 2 : i % 3 === 0 ? 1 : 0,
    daysSinceLastVisit: cls === "EM_RISCO" ? 45 + i : cls === "NOVO" ? null : 5 + (i % 30),
    insights:
      cls === "EM_RISCO"
        ? [
            { id: "i1", title: "Risco de churn", body: "Sem visita há mais de 45 dias. Considere oferecer 10% no próximo corte." },
            { id: "i2", title: "Sugestão: remarcar", body: "Cliente costumava vir a cada 21 dias." },
          ]
        : cls === "VIP"
        ? [{ id: "i3", title: "Oferecer pacote", body: "Cliente VIP elegível para pacote trimestral com 15% off." }]
        : [],
    history: Array.from({ length: 6 + (i % 4) }).map((_, k) => ({
      id: `h-${i}-${k}`,
      date: iso(-(7 + k * 14), 14, 30),
      service: ["Corte masculino", "Barba terapia", "Coloração", "Degradê"][k % 4],
      status: (["COMPLETED", "COMPLETED", "CANCELLED", "NO_SHOW"] as AppointmentStatus[])[k % 4],
    })),
    quotas:
      i % 4 === 0
        ? [
            { id: `q-${i}-1`, type: "Cortes mensais", remaining: 2, total: 4, validUntil: iso(60, 23, 59), status: "ACTIVE" },
            { id: `q-${i}-2`, type: "Barba", remaining: 1, total: 2, validUntil: null, status: "ACTIVE" },
          ]
        : i % 3 === 0
        ? [{ id: `q-${i}-1`, type: "Pacote essencial", remaining: 3, total: 5, validUntil: iso(30, 23, 59), status: "ACTIVE" }]
        : [],
    consents: [
      { type: "COMMUNICATION", status: "GRANTED", updatedAt: iso(-30, 10) },
      { type: "MARKETING", status: i % 2 ? "REVOKED" : "GRANTED", updatedAt: iso(-20, 10) },
      { type: "DATA_PROCESSING", status: "GRANTED", updatedAt: iso(-90, 10) },
    ],
  };
});

/* =============================== CONVERSATIONS =============================== */

export type Message = {
  id: string;
  sender: "CLIENT" | "BOT" | "AGENT";
  text: string;
  at: string;
};

export type Conversation = {
  id: string;
  clientName: string;
  clientPhone: string;
  status: "ESCALATED" | "RESOLVED";
  escalatedAt: string;
  lastMessage: string;
  messages: Message[];
};

export const mockConversations: Conversation[] = [
  {
    id: "cv-1",
    clientName: "Marina Souza",
    clientPhone: "(11) 97777-1212",
    status: "ESCALATED",
    escalatedAt: iso(0, new Date().getHours(), new Date().getMinutes() - 12),
    lastMessage: "Posso remarcar para amanhã às 16h?",
    messages: [
      { id: "m1", sender: "CLIENT", text: "Oi, preciso remarcar meu horário", at: iso(0, 10, 0) },
      { id: "m2", sender: "BOT", text: "Claro! Posso te ajudar. Para qual dia?", at: iso(0, 10, 1) },
      { id: "m3", sender: "CLIENT", text: "Posso remarcar para amanhã às 16h?", at: iso(0, 10, 3) },
    ],
  },
  {
    id: "cv-2",
    clientName: "Henrique Costa",
    clientPhone: "(11) 98123-4567",
    status: "ESCALATED",
    escalatedAt: iso(0, new Date().getHours() - 1, 0),
    lastMessage: "Vocês aceitam Pix parcelado?",
    messages: [
      { id: "m1", sender: "CLIENT", text: "Vocês aceitam Pix parcelado?", at: iso(0, 9, 30) },
      { id: "m2", sender: "BOT", text: "Vou transferir para um atendente humano.", at: iso(0, 9, 31) },
    ],
  },
  {
    id: "cv-3",
    clientName: "Sofia Albuquerque",
    clientPhone: "(11) 91020-3040",
    status: "RESOLVED",
    escalatedAt: iso(-1, 14, 0),
    lastMessage: "Obrigada!",
    messages: [
      { id: "m1", sender: "CLIENT", text: "Posso levar minha filha?", at: iso(-1, 13, 55) },
      { id: "m2", sender: "AGENT", text: "Claro, temos espaço infantil.", at: iso(-1, 14, 1) },
      { id: "m3", sender: "CLIENT", text: "Obrigada!", at: iso(-1, 14, 2) },
    ],
  },
];

/* =============================== QUEUE =============================== */

export type QueueEntry = {
  id: string;
  clientName: string;
  scope: "SERVICE" | "PROFESSIONAL" | "PRODUCT";
  target: string;
  priority: number;
  enqueuedAt: string;
  status: "WAITING" | "NOTIFIED" | "EXPIRED";
};

export const mockQueueEntries: QueueEntry[] = [
  { id: "q-1", clientName: "Patrícia Lopes", scope: "SERVICE", target: "Coloração", priority: 1, enqueuedAt: iso(0, 8, 0), status: "WAITING" },
  { id: "q-2", clientName: "Diego Andrade", scope: "PROFESSIONAL", target: "Rafa Mendes", priority: 2, enqueuedAt: iso(0, 9, 30), status: "WAITING" },
  { id: "q-3", clientName: "Lucas Faria", scope: "SERVICE", target: "Degradê", priority: 1, enqueuedAt: iso(-1, 16, 0), status: "NOTIFIED" },
  { id: "q-4", clientName: "Vanessa Cunha", scope: "PRODUCT", target: "Pomada Premium", priority: 3, enqueuedAt: iso(-2, 11, 0), status: "EXPIRED" },
  { id: "q-5", clientName: "Tiago Moreira", scope: "PROFESSIONAL", target: "Zeca Almeida", priority: 2, enqueuedAt: iso(0, 7, 15), status: "WAITING" },
];

export type QueueConfig = {
  enabled: boolean;
  priorityMode: "FIFO" | "PRIORITY";
  notificationWindowHours: number;
};

export const mockQueueConfig: QueueConfig = {
  enabled: true,
  priorityMode: "FIFO",
  notificationWindowHours: 4,
};

/* =============================== PAYMENTS =============================== */

export const PAYMENT_METHODS = [
  { value: "PIX", label: "Pix" },
  { value: "CREDIT_CARD", label: "Cartão de crédito" },
  { value: "DEBIT_CARD", label: "Cartão de débito" },
  { value: "CASH", label: "Dinheiro" },
  { value: "TRANSFER", label: "Transferência" },
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number]["value"];

export const REFUND_REASONS = [
  { value: "SERVICE_FAILURE", label: "Falha no serviço" },
  { value: "REGISTRATION_ERROR", label: "Erro de cadastro" },
  { value: "DEADLINE_POLICY", label: "Política de prazo" },
  { value: "OTHER", label: "Outro" },
] as const;

export type Payment = {
  id: string;
  createdAt: string;
  paidAt: string | null;
  refundedAt: string | null;
  clientName: string;
  appointmentId: string | null;
  method: PaymentMethod;
  submethod: string | null;
  provider: string;
  gross: string;
  discount: string;
  net: string;
  fee: string;
  status: PaymentStatus;
  couponCode: string | null;
};

const CLIENTS_POOL = NAMES.slice(0, 12);
const METHODS: PaymentMethod[] = ["PIX","CREDIT_CARD","DEBIT_CARD","CASH","TRANSFER"];

export const mockPayments: Payment[] = Array.from({ length: 30 }).map((_, i) => {
  const status: PaymentStatus = i % 5 === 0 ? "REFUNDED" : i % 3 === 0 ? "PENDING" : "CONFIRMED";
  const method = METHODS[i % METHODS.length];
  const gross = 50 + (i % 7) * 25;
  const discount = i % 4 === 0 ? 10 : 0;
  const net = gross - discount;
  const fee = method === "CREDIT_CARD" ? net * 0.029 : method === "PIX" ? net * 0.0099 : 0;
  return {
    id: `pay-${String(i + 1).padStart(3, "0")}`,
    createdAt: iso(-i, 10, (i * 7) % 60),
    paidAt: status === "PENDING" ? null : iso(-i, 11, 0),
    refundedAt: status === "REFUNDED" ? iso(-i + 1, 9, 0) : null,
    clientName: CLIENTS_POOL[i % CLIENTS_POOL.length],
    appointmentId: i % 3 === 0 ? null : `ap-${String((i % 4) + 1).padStart(3, "0")}`,
    method,
    submethod: method === "CREDIT_CARD" ? "Visa" : method === "PIX" ? "Chave CNPJ" : null,
    provider: method === "CREDIT_CARD" ? "Stripe" : method === "PIX" ? "Mercado Pago" : "Manual",
    gross: gross.toFixed(2),
    discount: discount.toFixed(2),
    net: net.toFixed(2),
    fee: fee.toFixed(2),
    status,
    couponCode: discount > 0 ? "BEMVINDO10" : null,
  };
});

export const tenantFlags = { feeNotConfigured: true };

/* =============================== DEPOSIT POLICIES =============================== */

export type DepositPolicy = {
  id: string;
  serviceName: string | null; // null = global
  type: "FIXED_AMOUNT" | "PERCENTAGE";
  value: string;
  cancellationWindowHours: number;
  refundOnTenantFault: boolean;
  retainOnNoShow: boolean;
  commissionOnRetainedDeposit: boolean;
};

export const mockDepositPolicies: DepositPolicy[] = [
  {
    id: "dp-1",
    serviceName: null,
    type: "PERCENTAGE",
    value: "30",
    cancellationWindowHours: 24,
    refundOnTenantFault: true,
    retainOnNoShow: true,
    commissionOnRetainedDeposit: false,
  },
  {
    id: "dp-2",
    serviceName: "Coloração",
    type: "FIXED_AMOUNT",
    value: "50.00",
    cancellationWindowHours: 48,
    refundOnTenantFault: true,
    retainOnNoShow: true,
    commissionOnRetainedDeposit: true,
  },
  {
    id: "dp-3",
    serviceName: "Combo barba & corte",
    type: "PERCENTAGE",
    value: "20",
    cancellationWindowHours: 12,
    refundOnTenantFault: false,
    retainOnNoShow: false,
    commissionOnRetainedDeposit: false,
  },
];

/* =============================== CRM =============================== */

export const mockCrmKpis = {
  atRisk: mockCustomers.filter((c) => c.classification === "EM_RISCO").length,
  newThisMonth: 7,
  vip: mockCustomers.filter((c) => c.classification === "VIP").length,
  recoveredThisWeek: mockCustomers.filter((c) => c.classification === "RECUPERADO").length,
};

export const mockCrmSuggestions = [
  { id: "s1", action: "Remarcar", customer: "Eduarda Martins", reason: "Sem visita há 53 dias" },
  { id: "s2", action: "Enviar pacote", customer: "Patrícia Lopes", reason: "VIP elegível trimestral" },
  { id: "s3", action: "Remarcar", customer: "Otávio Brito", reason: "Cadência habitual de 21 dias quebrada" },
];