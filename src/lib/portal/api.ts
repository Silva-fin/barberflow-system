import {
  ALL_APPOINTMENTS,
  CONSENT_GROUPS,
  PAYMENT_CARDS,
  QUOTAS,
  QUOTA_USAGE,
  SUBSCRIPTIONS,
  UPCOMING_APPOINTMENTS,
  type Appointment,
  type AppointmentStatus,
  type ConsentGroup,
  type PaymentCard,
  type Quota,
  type QuotaUsage,
  type Subscription,
  type SubscriptionStatus,
} from "./mock";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchUpcomingAppointments(): Promise<Appointment[]> {
  await sleep(500);
  return UPCOMING_APPOINTMENTS;
}

export async function fetchActiveQuotas(): Promise<Quota[]> {
  await sleep(550);
  return QUOTAS.filter((q) => q.status === "ativa").slice(0, 3);
}

export interface HistoryQuery {
  status?: AppointmentStatus | "all";
  establishmentId?: string | "all";
  page: number;
  pageSize: number;
}
export interface HistoryResult {
  items: Appointment[];
  total: number;
}

export async function fetchHistory(q: HistoryQuery): Promise<HistoryResult> {
  await sleep(450);
  let items = ALL_APPOINTMENTS.filter(
    (a) => a.status !== "agendado",
  );
  if (q.status && q.status !== "all") items = items.filter((a) => a.status === q.status);
  if (q.establishmentId && q.establishmentId !== "all")
    items = items.filter((a) => a.establishment.id === q.establishmentId);
  items = items.slice().sort((a, b) => (a.when < b.when ? 1 : -1));
  const total = items.length;
  const start = (q.page - 1) * q.pageSize;
  return { items: items.slice(start, start + q.pageSize), total };
}

export async function fetchAllQuotas(): Promise<Quota[]> {
  await sleep(500);
  return QUOTAS;
}

export async function fetchQuotaUsage(quotaId: string): Promise<QuotaUsage[]> {
  await sleep(600);
  return QUOTA_USAGE[quotaId] ?? [];
}

const subsState = SUBSCRIPTIONS.map((s) => ({ ...s }));

export async function fetchSubscriptions(): Promise<Subscription[]> {
  await sleep(450);
  return subsState.map((s) => ({ ...s }));
}

export async function updateSubscriptionStatus(
  id: string,
  status: SubscriptionStatus,
): Promise<Subscription> {
  await sleep(550);
  const s = subsState.find((x) => x.id === id);
  if (!s) throw new Error("Assinatura não encontrada");
  s.status = status;
  return { ...s };
}

const cardsState = PAYMENT_CARDS.map((c) => ({ ...c }));

export async function fetchPaymentCards(): Promise<PaymentCard[]> {
  await sleep(400);
  return cardsState.map((c) => ({ ...c }));
}

export async function removePaymentCard(id: string): Promise<void> {
  await sleep(400);
  const idx = cardsState.findIndex((c) => c.id === id);
  if (idx >= 0) cardsState.splice(idx, 1);
}

const consentsState: ConsentGroup[] = CONSENT_GROUPS.map((g) => ({
  ...g,
  items: g.items.map((i) => ({
    ...i,
    channels: i.channels?.map((c) => ({ ...c })),
  })),
}));

let mktFailOnce = true;

export async function fetchConsents(): Promise<ConsentGroup[]> {
  await sleep(450);
  return consentsState.map((g) => ({
    ...g,
    items: g.items.map((i) => ({
      ...i,
      channels: i.channels?.map((c) => ({ ...c })),
    })),
  }));
}

export async function setConsent(
  groupId: string,
  itemId: string,
  enabled: boolean,
  channel?: string,
): Promise<void> {
  await sleep(500);
  // Falha simulada: primeira tentativa de ligar promos por marketing falha.
  if (groupId === "mkt" && itemId === "mkt-promos" && enabled && mktFailOnce) {
    mktFailOnce = false;
    throw new Error("Falha ao salvar consentimento");
  }
  const g = consentsState.find((x) => x.id === groupId);
  if (!g) return;
  const it = g.items.find((x) => x.id === itemId);
  if (!it) return;
  if (channel && it.channels) {
    const ch = it.channels.find((c) => c.channel === channel);
    if (ch) ch.enabled = enabled;
  } else {
    it.enabled = enabled;
  }
}