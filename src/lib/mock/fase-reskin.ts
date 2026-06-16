import type { CommissionStatus, PayoutStatus } from "@/components/app/fsm-badge";

/* ============ Barbeiros (2.2 / 2.3) ============ */
export type Barber = {
  id: string;
  name: string;
  workStart: string;
  workEnd: string;
  workingDays: number[]; // 0=Dom..6=Sáb
  specialties: string[];
  commissionPct: number | null;
  active: boolean;
};

export const mockBarbers: Barber[] = [
  { id: "b1", name: "João Pereira",     workStart: "09:00", workEnd: "19:00", workingDays: [1,2,3,4,5,6], specialties: ["Corte clássico","Barba"], commissionPct: 45, active: true },
  { id: "b2", name: "Carlos Silva",     workStart: "10:00", workEnd: "20:00", workingDays: [2,3,4,5,6],   specialties: ["Degradê","Pigmentação"],  commissionPct: 50, active: true },
  { id: "b3", name: "Rafael Lima",      workStart: "09:00", workEnd: "18:00", workingDays: [1,2,3,4,5],   specialties: [],                          commissionPct: null, active: true },
  { id: "b4", name: "Pedro Souza",      workStart: "11:00", workEnd: "21:00", workingDays: [3,4,5,6,0],   specialties: ["Barba"],                   commissionPct: 40, active: true },
  { id: "b5", name: "Mateus Andrade",   workStart: "08:00", workEnd: "17:00", workingDays: [1,2,3,4,5],   specialties: ["Corte infantil"],          commissionPct: 35, active: false },
  { id: "b6", name: "Diego Fonseca",    workStart: "10:00", workEnd: "19:00", workingDays: [2,3,4,5,6],   specialties: [],                          commissionPct: null, active: true },
];

/* ============ Serviços (2.2) ============ */
export type Service = { id: string; name: string; priceCents: number; durationMin: number };

export const mockServices: Service[] = [
  { id: "s1", name: "Corte",                   priceCents: 4500, durationMin: 30 },
  { id: "s2", name: "Corte + Barba",           priceCents: 7500, durationMin: 50 },
  { id: "s3", name: "Barba terapia",           priceCents: 5500, durationMin: 40 },
  { id: "s4", name: "Pigmentação",             priceCents: 9000, durationMin: 60 },
];

export const mockTimeSlots = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
];

/* ============ Comissões (3.x) ============ */
export const mockCommissionsHub = {
  aPagarCents: 124000,
  pago30dCents: 388000,
  profissionaisPendentes: 4,
};

export type CommissionBase = "PERCENT" | "FIXED";
export type CommissionPayer = "SHOP" | "SPLIT" | "BARBER";

export const mockGeneralCommissionRule = {
  base: "PERCENT" as CommissionBase,
  ratePct: 40,
  fixedCents: 0,
  payer: "SHOP" as CommissionPayer,
};

export type SpecificCommissionRule = {
  id: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  base: CommissionBase;
  ratePct: number;
  fixedCents: number;
  payer: CommissionPayer;
};

export const mockSpecificRules: SpecificCommissionRule[] = [
  { id: "r1", professionalId: "b1", professionalName: "João Pereira",   serviceId: "s3", serviceName: "Barba terapia",     base: "PERCENT", ratePct: 50, fixedCents: 0,    payer: "SPLIT" },
  { id: "r2", professionalId: "b2", professionalName: "Carlos Silva",   serviceId: "s4", serviceName: "Pigmentação",       base: "PERCENT", ratePct: 55, fixedCents: 0,    payer: "SHOP" },
  { id: "r3", professionalId: "b4", professionalName: "Pedro Souza",    serviceId: "*",  serviceName: "Todos os serviços", base: "FIXED",   ratePct: 0,  fixedCents: 1500, payer: "BARBER" },
];

export type CommissionType = "AGENDAMENTO" | "PACOTE" | "ASSINATURA";
export type CommissionHistoryRow = {
  id: string;
  date: string;
  professional: string;
  type: CommissionType;
  grossCents: number;
  commissionCents: number;
  status: CommissionStatus;
};

export const mockCommissionHistory: CommissionHistoryRow[] = [
  { id: "c01", date: "2026-06-15", professional: "João Pereira",   type: "AGENDAMENTO", grossCents: 4500, commissionCents: 1800, status: "PENDING" },
  { id: "c02", date: "2026-06-14", professional: "Carlos Silva",   type: "PACOTE",      grossCents: 22000,commissionCents: 8800, status: "DUE_SOON" },
  { id: "c03", date: "2026-06-14", professional: "Rafael Lima",    type: "AGENDAMENTO", grossCents: 7500, commissionCents: 3000, status: "PAID" },
  { id: "c04", date: "2026-06-13", professional: "João Pereira",   type: "ASSINATURA",  grossCents: 9900, commissionCents: 3960, status: "PAID" },
  { id: "c05", date: "2026-06-13", professional: "Pedro Souza",    type: "AGENDAMENTO", grossCents: 5500, commissionCents: 1500, status: "PENDING" },
  { id: "c06", date: "2026-06-12", professional: "Carlos Silva",   type: "AGENDAMENTO", grossCents: 9000, commissionCents: 4950, status: "REFUNDED" },
  { id: "c07", date: "2026-06-12", professional: "Rafael Lima",    type: "AGENDAMENTO", grossCents: 4500, commissionCents: 1800, status: "PAID" },
  { id: "c08", date: "2026-06-11", professional: "João Pereira",   type: "AGENDAMENTO", grossCents: 7500, commissionCents: 3000, status: "PENDING" },
  { id: "c09", date: "2026-06-11", professional: "Pedro Souza",    type: "PACOTE",      grossCents: 22000,commissionCents: 6600, status: "DUE_SOON" },
  { id: "c10", date: "2026-06-10", professional: "Carlos Silva",   type: "AGENDAMENTO", grossCents: 9000, commissionCents: 4500, status: "PAID" },
];

export const mockCommissionTotalPendingCents = 62000;

/* ============ Pagamentos de comissões (3.4) ============ */
export type PendingCommission = { id: string; date: string; serviceName: string; amountCents: number };

export const mockPendingByBarber: Record<string, PendingCommission[]> = {
  b1: [
    { id: "p1", date: "2026-06-15", serviceName: "Corte",          amountCents: 1800 },
    { id: "p2", date: "2026-06-13", serviceName: "Assinatura",     amountCents: 3960 },
    { id: "p3", date: "2026-06-11", serviceName: "Corte + Barba",  amountCents: 3000 },
    { id: "p4", date: "2026-06-10", serviceName: "Corte",          amountCents: 1800 },
  ],
  b2: [],
  b4: [
    { id: "p5", date: "2026-06-13", serviceName: "Barba terapia",  amountCents: 1500 },
    { id: "p6", date: "2026-06-11", serviceName: "Pacote 4 cortes",amountCents: 6600 },
  ],
};

export type PayoutRow = {
  id: string;
  date: string;
  professional: string;
  commissionsCount: number;
  totalCents: number;
  status: PayoutStatus;
};

export const mockPayouts: PayoutRow[] = [
  { id: "py1", date: "2026-06-08", professional: "João Pereira",   commissionsCount: 5, totalCents: 18200, status: "PAID" },
  { id: "py2", date: "2026-06-08", professional: "Carlos Silva",   commissionsCount: 4, totalCents: 22600, status: "PAID" },
  { id: "py3", date: "2026-06-01", professional: "Rafael Lima",    commissionsCount: 3, totalCents:  9300, status: "PAID" },
  { id: "py4", date: "2026-06-01", professional: "Pedro Souza",    commissionsCount: 2, totalCents:  6900, status: "PENDING" },
  { id: "py5", date: "2026-05-25", professional: "Carlos Silva",   commissionsCount: 6, totalCents: 31200, status: "FAILED" },
];

export const mockPaymentAccounts = [
  { id: "acc1", label: "Conta corrente — Itaú" },
  { id: "acc2", label: "Conta PJ — Nubank"     },
];

/* ============ Taxas de maquininha (4.1) ============ */
export type PaymentMethodFee = {
  id: string;
  label: string;
  ratePct: number | null;
  fixedCents: number | null;
  editable: boolean;
};

export const mockPaymentFees: PaymentMethodFee[] = [
  { id: "m1", label: "Dinheiro",            ratePct: 0,    fixedCents: 0,  editable: false },
  { id: "m2", label: "Chave PIX",           ratePct: 0,    fixedCents: 0,  editable: true },
  { id: "m3", label: "PIX maquininha",      ratePct: 0.99, fixedCents: 0,  editable: true },
  { id: "m4", label: "Débito",              ratePct: 1.49, fixedCents: 0,  editable: true },
  { id: "m5", label: "Crédito Visa",        ratePct: 3.19, fixedCents: 39, editable: true },
  { id: "m6", label: "Crédito Master",      ratePct: 3.19, fixedCents: 39, editable: true },
  { id: "m7", label: "Crédito Elo",         ratePct: 3.49, fixedCents: 39, editable: true },
  { id: "m8", label: "Crédito parcelado",   ratePct: null, fixedCents: null, editable: true },
];

/* ============ Registrar pagamento (4.2) ============ */
export const mockNovoPagamentoClientes = [
  { id: "cl1", name: "Bruno Carvalho",  phone: "(11) 98888-1234" },
  { id: "cl2", name: "Eduardo Pinto",   phone: "(11) 97777-5566" },
  { id: "cl3", name: "Felipe Ramos",    phone: "(11) 96666-7788" },
];

export const mockAgendamentosByCliente: Record<string, { id: string; label: string }[]> = {
  cl1: [
    { id: "ap1", label: "Hoje 14:30 — Corte (R$ 45,00)" },
    { id: "ap2", label: "Amanhã 10:00 — Corte + Barba (R$ 75,00)" },
  ],
  cl2: [
    { id: "ap3", label: "Hoje 16:00 — Barba terapia (R$ 55,00)" },
  ],
  cl3: [],
};

export const mockPagamentoMethods = [
  { id: "dinheiro",     label: "Dinheiro",       group: "Dinheiro" as const,    icon: "Banknote" },
  { id: "pix-chave",    label: "PIX (chave)",    group: "PIX" as const,         icon: "QrCode"   },
  { id: "pix-maquina",  label: "PIX maquininha", group: "PIX" as const,         icon: "Smartphone" },
  { id: "debito",       label: "Débito",         group: "Maquininha" as const,  icon: "CreditCard" },
  { id: "credito-visa", label: "Crédito Visa",   group: "Maquininha" as const,  icon: "CreditCard" },
  { id: "credito-mc",   label: "Crédito Master", group: "Maquininha" as const,  icon: "CreditCard" },
];

/* ============ Meu perfil (5.2) ============ */
export const mockMyProfile = {
  name: "Carlos Mendes",
  email: "carlos@barbearia.com",
  roleLabel: "Proprietário",
};

/* ============ helpers ============ */
export const delay = <T,>(value: T, ms = 300) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

/* ============ Operações (/operacoes) ============ */
import type { AppointmentStatus } from "@/components/app/fsm-badge";

export type OperationRow = {
  id: string;
  dateTime: string; // ISO
  customerName: string;
  serviceName: string;
  barberId: string;
  barberName: string;
  status: AppointmentStatus;
  valueCents: number;
};

export const mockOperations: OperationRow[] = [
  { id: "op01", dateTime: "2026-06-16T09:00:00", customerName: "Bruno Carvalho",  serviceName: "Corte",           barberId: "b1", barberName: "João Pereira",   status: "SCHEDULED",   valueCents: 4500 },
  { id: "op02", dateTime: "2026-06-16T09:30:00", customerName: "Eduardo Pinto",   serviceName: "Corte + Barba",   barberId: "b2", barberName: "Carlos Silva",   status: "IN_PROGRESS", valueCents: 7500 },
  { id: "op03", dateTime: "2026-06-16T10:00:00", customerName: "Felipe Ramos",    serviceName: "Barba terapia",   barberId: "b1", barberName: "João Pereira",   status: "COMPLETED",   valueCents: 5500 },
  { id: "op04", dateTime: "2026-06-16T10:30:00", customerName: "Gustavo Martins", serviceName: "Pigmentação",     barberId: "b2", barberName: "Carlos Silva",   status: "SCHEDULED",   valueCents: 9000 },
  { id: "op05", dateTime: "2026-06-16T11:00:00", customerName: "Henrique Costa",  serviceName: "Corte",           barberId: "b3", barberName: "Rafael Lima",    status: "CANCELLED",   valueCents: 4500 },
  { id: "op06", dateTime: "2026-06-16T11:30:00", customerName: "Igor Almeida",    serviceName: "Corte + Barba",   barberId: "b4", barberName: "Pedro Souza",    status: "COMPLETED",   valueCents: 7500 },
  { id: "op07", dateTime: "2026-06-16T13:00:00", customerName: "João Vieira",     serviceName: "Corte",           barberId: "b1", barberName: "João Pereira",   status: "NO_SHOW",     valueCents: 4500 },
  { id: "op08", dateTime: "2026-06-16T13:30:00", customerName: "Lucas Pereira",   serviceName: "Pigmentação",     barberId: "b2", barberName: "Carlos Silva",   status: "SCHEDULED",   valueCents: 9000 },
  { id: "op09", dateTime: "2026-06-16T14:00:00", customerName: "Marcos Tavares",  serviceName: "Corte",           barberId: "b3", barberName: "Rafael Lima",    status: "COMPLETED",   valueCents: 3000 },
  { id: "op10", dateTime: "2026-06-16T14:30:00", customerName: "Nathan Oliveira", serviceName: "Barba terapia",   barberId: "b4", barberName: "Pedro Souza",    status: "IN_PROGRESS", valueCents: 5500 },
  { id: "op11", dateTime: "2026-06-16T15:00:00", customerName: "Otávio Brito",    serviceName: "Corte + Barba",   barberId: "b1", barberName: "João Pereira",   status: "SCHEDULED",   valueCents: 7500 },
  { id: "op12", dateTime: "2026-06-16T15:30:00", customerName: "Paulo Henrique",  serviceName: "Pigmentação",     barberId: "b2", barberName: "Carlos Silva",   status: "COMPLETED",   valueCents: 18000 },
  { id: "op13", dateTime: "2026-06-16T16:00:00", customerName: "Rodrigo Salles",  serviceName: "Corte",           barberId: "b3", barberName: "Rafael Lima",    status: "CANCELLED",   valueCents: 4500 },
  { id: "op14", dateTime: "2026-06-16T16:30:00", customerName: "Samuel Cordeiro", serviceName: "Corte + Barba",   barberId: "b4", barberName: "Pedro Souza",    status: "SCHEDULED",   valueCents: 7500 },
  { id: "op15", dateTime: "2026-06-16T17:00:00", customerName: "Thiago Nunes",    serviceName: "Barba terapia",   barberId: "b1", barberName: "João Pereira",   status: "NO_SHOW",     valueCents: 5500 },
];

export const fetchOperations = () => delay(mockOperations, 500);

/* ============ Caixa (/caixa) ============ */
export type CashAccount = { id: string; label: string };

export const mockCashAccounts: CashAccount[] = [
  { id: "ca1", label: "Caixa principal" },
  { id: "ca2", label: "Cofre" },
  { id: "ca3", label: "PIX maquininha" },
];

export type CashMovementType = "IN" | "OUT";
export type CashMovement = {
  id: string;
  time: string; // HH:MM
  description: string;
  type: CashMovementType;
  valueCents: number;
};

export const mockCashMovements: CashMovement[] = [
  { id: "mv01", time: "09:12", description: "Pagamento — Bruno Carvalho (Corte)",        type: "IN",  valueCents: 4500 },
  { id: "mv02", time: "09:45", description: "Pagamento — Eduardo Pinto (Corte + Barba)", type: "IN",  valueCents: 7500 },
  { id: "mv03", time: "10:20", description: "Pagamento — Felipe Ramos (Barba terapia)",  type: "IN",  valueCents: 5500 },
  { id: "mv04", time: "11:05", description: "Sangria para banco",                         type: "OUT", valueCents: 20000 },
  { id: "mv05", time: "11:40", description: "Pagamento — Igor Almeida (Corte + Barba)",  type: "IN",  valueCents: 7500 },
  { id: "mv06", time: "13:15", description: "Pagamento — Marcos Tavares (Corte)",        type: "IN",  valueCents: 3000 },
  { id: "mv07", time: "13:50", description: "Compra — produtos de limpeza",              type: "OUT", valueCents: 8500 },
  { id: "mv08", time: "15:30", description: "Pagamento — Paulo Henrique (Pigmentação)",  type: "IN",  valueCents: 18000 },
  { id: "mv09", time: "16:10", description: "Pagamento — Otávio Brito (Corte + Barba)",  type: "IN",  valueCents: 7500 },
  { id: "mv10", time: "17:20", description: "Pagamento — Samuel Cordeiro (Corte + Barba)", type: "IN", valueCents: 7500 },
];

export type CashCountResolution = "WITH_ADJUSTMENT" | "WITHOUT_ADJUSTMENT";
export type CashCount = {
  id: string;
  dateTime: string;
  accountId: string;
  accountLabel: string;
  expectedCents: number;
  countedCents: number;
  resolution: CashCountResolution;
  recordedBy: string;
};

export const mockCashCounts: CashCount[] = [
  { id: "cc01", dateTime: "2026-06-15T19:30:00", accountId: "ca1", accountLabel: "Caixa principal", expectedCents: 124000, countedCents: 124000, resolution: "WITHOUT_ADJUSTMENT", recordedBy: "Carlos Mendes" },
  { id: "cc02", dateTime: "2026-06-14T19:25:00", accountId: "ca1", accountLabel: "Caixa principal", expectedCents:  98000, countedCents:  95000, resolution: "WITH_ADJUSTMENT",   recordedBy: "Ana Souza" },
  { id: "cc03", dateTime: "2026-06-13T20:10:00", accountId: "ca2", accountLabel: "Cofre",           expectedCents:  60000, countedCents:  62000, resolution: "WITH_ADJUSTMENT",   recordedBy: "Carlos Mendes" },
];

export const fetchCashMovements = () => delay(mockCashMovements, 400);
export const fetchCashCounts = () => delay(mockCashCounts, 400);