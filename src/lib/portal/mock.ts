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
  address?: string;
  phone?: string;
  mapUrl?: string;
}

export interface Appointment {
  id: string;
  service: string;
  duration?: number; // minutes
  professional: string;
  establishment: Establishment;
  when: string; // ISO
  status: AppointmentStatus;
  amountBRL: number;
  hasDeposit?: boolean;
  notes?: string;
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
  items?: string[];
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
  zeca: {
    id: "shop-1",
    name: "Barbearia do Zeca",
    address: "Rua das Palmeiras, 128 · Vila Mariana, São Paulo/SP",
    phone: "(11) 3555-1200",
    mapUrl: "https://maps.google.com/?q=Rua+das+Palmeiras+128",
  } as Establishment,
  paladino: {
    id: "shop-2",
    name: "Studio Alpha",
    address: "Av. Rebouças, 940 · Pinheiros, São Paulo/SP",
    phone: "(11) 3222-8877",
    mapUrl: "https://maps.google.com/?q=Av+Reboucas+940",
  } as Establishment,
  oasis: {
    id: "shop-3",
    name: "Barber King",
    address: "Rua Augusta, 2010 · Consolação, São Paulo/SP",
    phone: "(11) 3777-4433",
    mapUrl: "https://maps.google.com/?q=Rua+Augusta+2010",
  } as Establishment,
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
    duration: 60,
    professional: "Zeca",
    establishment: ESTAB.zeca,
    when: addDays(2),
    status: "agendado",
    amountBRL: 95,
    hasDeposit: true,
  },
  {
    id: "ap-101",
    service: "Barba",
    duration: 30,
    professional: "Rafael",
    establishment: ESTAB.paladino,
    when: addDays(7),
    status: "agendado",
    amountBRL: 50,
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
    plan: "Clube Zeca — mensal",
    establishment: ESTAB.zeca,
    status: "ativa",
    nextRenewal: addDays(18),
    priceBRL: 89.9,
    allowPause: true,
    items: ["2x Corte", "1x Barba"],
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
// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------
export type ProductStatus = "reservado" | "comprado" | "retirado";

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unitPriceBRL: number;
  status: ProductStatus;
  establishment: Establishment;
  date: string; // ISO
}

export const PRODUCTS: Product[] = [
  {
    id: "pr-1",
    name: "Pomada Modeladora Matte",
    quantity: 1,
    unitPriceBRL: 49.9,
    status: "reservado",
    establishment: ESTAB.zeca,
    date: addDays(-1),
  },
  {
    id: "pr-2",
    name: "Óleo para Barba",
    quantity: 1,
    unitPriceBRL: 35.9,
    status: "reservado",
    establishment: ESTAB.paladino,
    date: addDays(-3),
  },
  {
    id: "pr-3",
    name: "Talco Pós-Barba",
    quantity: 1,
    unitPriceBRL: 22.5,
    status: "retirado",
    establishment: ESTAB.zeca,
    date: addDays(-25),
  },
];

// ---------------------------------------------------------------------------
// Cupons
// ---------------------------------------------------------------------------
export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountLabel: string;
  validUntil: string;
  establishment: Establishment;
  personal: boolean;
}

export const COUPONS: Coupon[] = [
  {
    id: "cp-1",
    code: "INDICA10",
    description: "Desconto por indicação de amigo",
    discountLabel: "R$ 10 de desconto",
    validUntil: addDays(45),
    establishment: ESTAB.zeca,
    personal: true,
  },
];

// ---------------------------------------------------------------------------
// Pagamentos (histórico)
// ---------------------------------------------------------------------------
export type PaymentMethod = "dinheiro" | "pix" | "cartao";
export type PaymentStatus = "pago" | "pendente";

export interface PaymentEntry {
  id: string;
  description: string;
  amountBRL: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  establishment: Establishment;
  couponCode?: string;
}

export const PAYMENT_HISTORY: PaymentEntry[] = [
  {
    id: "pay-1",
    description: "Corte + barba",
    amountBRL: 85,
    method: "pix",
    status: "pago",
    date: addDays(-10),
    establishment: ESTAB.zeca,
    couponCode: "INDICA10",
  },
  {
    id: "pay-2",
    description: "Pacote 5 cortes",
    amountBRL: 220,
    method: "cartao",
    status: "pago",
    date: addDays(-30),
    establishment: ESTAB.zeca,
  },
  {
    id: "pay-3",
    description: "Barba",
    amountBRL: 50,
    method: "dinheiro",
    status: "pago",
    date: addDays(-42),
    establishment: ESTAB.paladino,
  },
  {
    id: "pay-4",
    description: "Talco Pós-Barba",
    amountBRL: 22.5,
    method: "pix",
    status: "pago",
    date: addDays(-25),
    establishment: ESTAB.zeca,
  },
  {
    id: "pay-5",
    description: "Assinatura Clube Zeca — julho",
    amountBRL: 89.9,
    method: "cartao",
    status: "pendente",
    date: addDays(-2),
    establishment: ESTAB.zeca,
  },
];
