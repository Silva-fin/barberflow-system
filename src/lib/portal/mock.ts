export type AppointmentStatus =
  | "agendado"
  | "concluido"
  | "cancelado"
  | "no-show";

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  agendado: "Agendado",
  concluido: "Concluído",
  cancelado: "Cancelado",
  "no-show": "Não compareceu",
};

export interface Establishment {
  id: string;
  name: string;
}

export interface Appointment {
  id: string;
  service: string;
  professional: string;
  establishment: Establishment;
  when: string; // ISO
  status: AppointmentStatus;
  amountBRL: number;
}

export type QuotaStatus = "ativa" | "encerrada" | "expirada";

export interface Quota {
  id: string;
  service: string;
  establishment: Establishment;
  total: number;
  used: number;
  validUntil: string; // ISO
  status: QuotaStatus;
}

export interface QuotaUsage {
  id: string;
  date: string;
  professional: string;
}

export type SubscriptionStatus = "ativa" | "pausada" | "cancelada";

export interface Subscription {
  id: string;
  plan: string;
  establishment: Establishment;
  status: SubscriptionStatus;
  nextRenewal: string;
  priceBRL: number;
  allowPause: boolean;
}

export interface PaymentCard {
  id: string;
  brand: "Visa" | "Mastercard" | "Elo";
  last4: string;
  default: boolean;
}

export type ConsentChannel = "whatsapp" | "email" | "sms";
export interface ConsentItem {
  id: string;
  label: string;
  enabled: boolean;
  // se presente, comportamento por canal
  channels?: { channel: ConsentChannel; label: string; enabled: boolean }[];
}
export interface ConsentGroup {
  id: string;
  title: string;
  description?: string;
  items: ConsentItem[];
}

const ESTAB = {
  zeca: { id: "shop-1", name: "Barbearia do Zeca" } as Establishment,
  paladino: { id: "shop-2", name: "Studio Paladino" } as Establishment,
  oasis: { id: "shop-3", name: "Oásis Estética" } as Establishment,
};

export const ESTABLISHMENTS: Establishment[] = Object.values(ESTAB);

const today = new Date();
const addDays = (d: number) => {
  const x = new Date(today);
  x.setDate(x.getDate() + d);
  return x.toISOString();
};

export const UPCOMING_APPOINTMENTS: Appointment[] = [
  {
    id: "ap-100",
    service: "Corte + barba",
    professional: "Zeca",
    establishment: ESTAB.zeca,
    when: addDays(2),
    status: "agendado",
    amountBRL: 95,
  },
  {
    id: "ap-101",
    service: "Limpeza de pele",
    professional: "Carla",
    establishment: ESTAB.oasis,
    when: addDays(7),
    status: "agendado",
    amountBRL: 180,
  },
  {
    id: "ap-102",
    service: "Massagem relaxante",
    professional: "Beto",
    establishment: ESTAB.paladino,
    when: addDays(12),
    status: "agendado",
    amountBRL: 220,
  },
];

export const PAST_APPOINTMENTS: Appointment[] = Array.from({ length: 28 }).map(
  (_, i) => {
    const shops = [ESTAB.zeca, ESTAB.paladino, ESTAB.oasis];
    const services = ["Corte", "Barba", "Limpeza de pele", "Massagem", "Manicure"];
    const pros = ["Zeca", "Beto", "Carla", "Lara"];
    const statuses: AppointmentStatus[] = [
      "concluido",
      "concluido",
      "concluido",
      "cancelado",
      "no-show",
    ];
    return {
      id: `ap-${i}`,
      service: services[i % services.length],
      professional: pros[i % pros.length],
      establishment: shops[i % shops.length],
      when: addDays(-(i + 1) * 5),
      status: statuses[i % statuses.length],
      amountBRL: 40 + (i % 7) * 20,
    };
  },
);

export const ALL_APPOINTMENTS: Appointment[] = [
  ...UPCOMING_APPOINTMENTS,
  ...PAST_APPOINTMENTS,
];

export const QUOTAS: Quota[] = [
  {
    id: "q-1",
    service: "Corte mensal",
    establishment: ESTAB.zeca,
    total: 10,
    used: 3,
    validUntil: addDays(120),
    status: "ativa",
  },
  {
    id: "q-2",
    service: "Sessões de massagem",
    establishment: ESTAB.paladino,
    total: 10,
    used: 8,
    validUntil: addDays(30),
    status: "ativa",
  },
  {
    id: "q-3",
    service: "Pacote estética facial",
    establishment: ESTAB.oasis,
    total: 6,
    used: 6,
    validUntil: addDays(-15),
    status: "expirada",
  },
  {
    id: "q-4",
    service: "Manicure",
    establishment: ESTAB.oasis,
    total: 4,
    used: 0,
    validUntil: addDays(-2),
    status: "expirada",
  },
];

export const QUOTA_USAGE: Record<string, QuotaUsage[]> = {
  "q-1": [
    { id: "u1", date: addDays(-10), professional: "Zeca" },
    { id: "u2", date: addDays(-32), professional: "Beto" },
    { id: "u3", date: addDays(-60), professional: "Zeca" },
  ],
  "q-2": [
    { id: "u1", date: addDays(-5), professional: "Beto" },
    { id: "u2", date: addDays(-15), professional: "Beto" },
    { id: "u3", date: addDays(-25), professional: "Carla" },
    { id: "u4", date: addDays(-40), professional: "Beto" },
    { id: "u5", date: addDays(-55), professional: "Beto" },
    { id: "u6", date: addDays(-70), professional: "Carla" },
    { id: "u7", date: addDays(-85), professional: "Beto" },
    { id: "u8", date: addDays(-100), professional: "Beto" },
  ],
  "q-3": [],
  "q-4": [],
};

export const SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub-1",
    plan: "Clube do Corte — mensal",
    establishment: ESTAB.zeca,
    status: "ativa",
    nextRenewal: addDays(18),
    priceBRL: 89.9,
    allowPause: true,
  },
  {
    id: "sub-2",
    plan: "Plano Bem-estar",
    establishment: ESTAB.paladino,
    status: "pausada",
    nextRenewal: addDays(45),
    priceBRL: 149,
    allowPause: true,
  },
  {
    id: "sub-3",
    plan: "Fidelidade Anual",
    establishment: ESTAB.oasis,
    status: "ativa",
    nextRenewal: addDays(210),
    priceBRL: 1290,
    allowPause: false,
  },
];

export const PAYMENT_CARDS: PaymentCard[] = [
  { id: "pm-1", brand: "Visa", last4: "4242", default: true },
  { id: "pm-2", brand: "Mastercard", last4: "5566", default: false },
];

export const CONSENT_GROUPS: ConsentGroup[] = [
  {
    id: "comm",
    title: "Comunicação",
    description: "Como podemos te avisar sobre seus agendamentos.",
    items: [
      {
        id: "comm-tx",
        label: "Lembretes de agendamento",
        enabled: true,
        channels: [
          { channel: "whatsapp", label: "WhatsApp", enabled: true },
          { channel: "email", label: "E-mail", enabled: true },
          { channel: "sms", label: "SMS", enabled: false },
        ],
      },
    ],
  },
  {
    id: "data",
    title: "Tratamento de dados",
    description: "Uso de dados pessoais para prestação do serviço.",
    items: [
      { id: "data-base", label: "Autorizar tratamento de dados", enabled: true },
    ],
  },
  {
    id: "pay",
    title: "Armazenamento de pagamento",
    items: [
      { id: "pay-store", label: "Salvar cartões para próximas compras", enabled: true },
    ],
  },
  {
    id: "mkt",
    title: "Marketing",
    description: "Promoções e novidades dos estabelecimentos.",
    items: [
      {
        id: "mkt-promos",
        label: "Receber promoções",
        enabled: false,
        channels: [
          { channel: "whatsapp", label: "WhatsApp", enabled: false },
          { channel: "email", label: "E-mail", enabled: false },
          { channel: "sms", label: "SMS", enabled: false },
        ],
      },
    ],
  },
];