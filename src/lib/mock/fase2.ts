import type { EntityType } from "@/lib/constants";

/* ============ helpers ============ */
function iso(daysFromNow: number, h = 12, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

/* ============ CATEGORIES ============ */
export type Category = {
  id: string;
  name: string;
  entity_type: EntityType;
  sort_order: number;
  is_active: boolean;
  is_default: boolean;
};

export const mockCategories: Category[] = [
  { id: "cat-1", name: "Cortes",       entity_type: "SERVICE", sort_order: 1, is_active: true,  is_default: true },
  { id: "cat-2", name: "Barba",        entity_type: "SERVICE", sort_order: 2, is_active: true,  is_default: false },
  { id: "cat-3", name: "Coloração",    entity_type: "SERVICE", sort_order: 3, is_active: true,  is_default: false },
  { id: "cat-4", name: "Tratamentos",  entity_type: "SERVICE", sort_order: 4, is_active: false, is_default: false },
  { id: "cat-5", name: "Pomadas",      entity_type: "PRODUCT", sort_order: 1, is_active: true,  is_default: true },
  { id: "cat-6", name: "Shampoo",      entity_type: "PRODUCT", sort_order: 2, is_active: true,  is_default: false },
  { id: "cat-7", name: "Aluguel",      entity_type: "EXPENSE", sort_order: 1, is_active: true,  is_default: true },
  { id: "cat-8", name: "Insumos",      entity_type: "EXPENSE", sort_order: 2, is_active: true,  is_default: false },
];

/* ============ SERVICES + VARIANTS ============ */
export type Service = { id: string; name: string; base_price: string; base_duration_min: number; is_active: boolean };
export const mockServices: Service[] = [
  { id: "svc-1", name: "Corte masculino", base_price: "50.00", base_duration_min: 30, is_active: true },
  { id: "svc-2", name: "Corte degradê", base_price: "65.00", base_duration_min: 45, is_active: true },
  { id: "svc-3", name: "Barba terapia", base_price: "35.00", base_duration_min: 30, is_active: true },
  { id: "svc-4", name: "Coloração", base_price: "180.00", base_duration_min: 60, is_active: true },
  { id: "svc-5", name: "Combo corte+barba", base_price: "85.00", base_duration_min: 60, is_active: true },
];

export type ServiceVariant = {
  id: string;
  service_id: string;
  name: string;
  price: string;
  duration_min: number;
  sort_order: number;
  is_active: boolean;
};

export const mockServiceVariants: ServiceVariant[] = [
  { id: "var-1", service_id: "svc-1", name: "Express", price: "40.00", duration_min: 20, sort_order: 1, is_active: true },
  { id: "var-2", service_id: "svc-1", name: "Premium", price: "70.00", duration_min: 45, sort_order: 2, is_active: true },
  { id: "var-3", service_id: "svc-4", name: "Coloração + hidratação", price: "240.00", duration_min: 90, sort_order: 1, is_active: true },
];

export function lookupServiceName(id: string | null | undefined): string {
  if (!id) return "Genérico";
  return mockServices.find((s) => s.id === id)?.name ?? "—";
}

/* ============ PROFESSIONALS ============ */
export type Professional = { id: string; name: string; role_title: string };
export const mockProfessionals: Professional[] = [
  { id: "pro-1", name: "Rafa Mendes", role_title: "Cabeleireiro" },
  { id: "pro-2", name: "Zeca Almeida", role_title: "Cabeleireiro" },
  { id: "pro-3", name: "Caio Souza", role_title: "Barbeiro" },
  { id: "pro-4", name: "Bruno Lima", role_title: "Barbeiro" },
];

export type ProfessionalPricing = {
  id: string;
  professional_id: string;
  service_id: string;
  price_override: string | null;
  duration_override_min: number | null;
  is_active: boolean;
};

export const mockProfessionalPricing: ProfessionalPricing[] = [
  { id: "pp-1", professional_id: "pro-1", service_id: "svc-1", price_override: "70.00", duration_override_min: null, is_active: true },
  { id: "pp-2", professional_id: "pro-1", service_id: "svc-2", price_override: "85.00", duration_override_min: 40, is_active: true },
  { id: "pp-3", professional_id: "pro-2", service_id: "svc-4", price_override: "210.00", duration_override_min: 75, is_active: true },
];

/* ============ PRODUCTS ============ */
export type Product = {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  is_active: boolean;
  image_url: string | null;
};

export const mockProducts: Product[] = [
  { id: "prd-1", name: "Pomada Premium",  sku: "PM-001", price: "65.00",  stock: 12, is_active: true,  image_url: null },
  { id: "prd-2", name: "Shampoo Tônico",  sku: "SH-014", price: "42.00",  stock: 8,  is_active: true,  image_url: null },
  { id: "prd-3", name: "Óleo de barba",   sku: "OB-007", price: "55.00",  stock: 0,  is_active: false, image_url: null },
];

/* ============ PACKAGE PLANS / PURCHASES ============ */
export type PackagePlan = {
  id: string;
  name: string;
  service_id: string | null;
  total_cotas: number;
  price: string;
  validity_days: number | null;
  is_active: boolean;
};

export const mockPackagePlans: PackagePlan[] = [
  { id: "pkg-1", name: "5 cortes mensais",       service_id: "svc-1", total_cotas: 5, price: "220.00", validity_days: 60,  is_active: true },
  { id: "pkg-2", name: "Pacote trimestral barba", service_id: "svc-3", total_cotas: 6, price: "180.00", validity_days: 90, is_active: true },
  { id: "pkg-3", name: "Cartão fidelidade",       service_id: null,    total_cotas: 10, price: "400.00", validity_days: null, is_active: true },
  { id: "pkg-4", name: "Plano coloração",         service_id: "svc-4", total_cotas: 3, price: "490.00", validity_days: 120, is_active: false },
];

export type PackagePurchaseStatus = "PENDING_PAYMENT" | "ACTIVE" | "REVOKED";
export type PackagePurchase = {
  id: string;
  created_at: string;
  customer_id: string;
  customer_name: string;
  plan_id: string;
  plan_name: string;
  total_price: string;
  status: PackagePurchaseStatus;
  payment_id: string | null;
};

export const mockPackagePurchases: PackagePurchase[] = [
  { id: "pp-001", created_at: iso(-2, 14), customer_id: "c-001", customer_name: "Henrique Costa", plan_id: "pkg-1", plan_name: "5 cortes mensais", total_price: "220.00", status: "ACTIVE", payment_id: "pay-001" },
  { id: "pp-002", created_at: iso(-1, 10), customer_id: "c-005", customer_name: "Ana Beatriz Rocha", plan_id: "pkg-3", plan_name: "Cartão fidelidade", total_price: "400.00", status: "PENDING_PAYMENT", payment_id: "pay-002" },
  { id: "pp-003", created_at: iso(-30, 16), customer_id: "c-007", customer_name: "Diego Andrade", plan_id: "pkg-2", plan_name: "Pacote trimestral barba", total_price: "180.00", status: "REVOKED", payment_id: "pay-003" },
];

/* ============ SUBSCRIPTIONS ============ */
export type SubscriptionPlan = {
  id: string;
  name: string;
  service_id: string | null;
  cotas_per_cycle: number;
  price: string;
  cycle_days: number;
  rollover_enabled: boolean;
  is_active: boolean;
};

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  { id: "sp-1", name: "Mensal essencial", service_id: "svc-1", cotas_per_cycle: 2, price: "120.00", cycle_days: 30, rollover_enabled: false, is_active: true },
  { id: "sp-2", name: "Mensal premium",   service_id: null,    cotas_per_cycle: 4, price: "260.00", cycle_days: 30, rollover_enabled: true,  is_active: true },
  { id: "sp-3", name: "Quinzenal barba",  service_id: "svc-3", cotas_per_cycle: 1, price: "60.00",  cycle_days: 15, rollover_enabled: false, is_active: false },
];

export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "OVERDUE" | "SUSPENDED" | "CANCELLED";
export type Subscription = {
  id: string;
  customer_id: string;
  customer_name: string;
  plan_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  next_billing_at: string | null;
  overdue_since: string | null;
};

export const mockSubscriptions: Subscription[] = [
  { id: "sub-1", customer_id: "c-001", customer_name: "Henrique Costa",   plan_id: "sp-1", plan_name: "Mensal essencial", status: "ACTIVE",   next_billing_at: iso(8, 10),  overdue_since: null },
  { id: "sub-2", customer_id: "c-005", customer_name: "Ana Beatriz Rocha", plan_id: "sp-2", plan_name: "Mensal premium",   status: "PAUSED",   next_billing_at: null,        overdue_since: null },
  { id: "sub-3", customer_id: "c-009", customer_name: "Felipe Tavares",    plan_id: "sp-1", plan_name: "Mensal essencial", status: "OVERDUE",  next_billing_at: iso(-3, 10), overdue_since: iso(-3, 10) },
  { id: "sub-4", customer_id: "c-011", customer_name: "Helena Prado",      plan_id: "sp-3", plan_name: "Quinzenal barba",  status: "CANCELLED", next_billing_at: null,       overdue_since: null },
  { id: "sub-5", customer_id: "c-012", customer_name: "Isabela Ramos",     plan_id: "sp-2", plan_name: "Mensal premium",   status: "SUSPENDED", next_billing_at: null,       overdue_since: iso(-30, 10) },
];

/* ============ PROMOTIONS / COUPONS ============ */
import type { DiscountType, ApplicationMode, GenerationType, CouponReopenPolicy } from "@/lib/constants";

export type PromotionStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "CANCELLED";
export type Promotion = {
  id: string;
  name: string;
  description: string;
  discount_type: DiscountType;
  discount_value: string | null;
  application_mode: ApplicationMode;
  cumulative: boolean;
  priority: number;
  valid_from: string;
  valid_until: string;
  max_uses: number | null;
  max_uses_per_customer: number | null;
  uses_count: number;
  status: PromotionStatus;
  conditions: Record<string, unknown>;
};

export const mockPromotions: Promotion[] = [
  {
    id: "promo-1", name: "Bem-vindo 10%", description: "Primeira visita",
    discount_type: "PERCENTAGE", discount_value: "10",
    application_mode: "AUTOMATIC", cumulative: false, priority: 1,
    valid_from: iso(-30, 0), valid_until: iso(60, 23, 59),
    max_uses: 500, max_uses_per_customer: 1, uses_count: 87, status: "ACTIVE",
    conditions: { first_visit_only: true },
  },
  {
    id: "promo-2", name: "Aniversário R$ 30", description: "Desconto fixo no mês do aniversário",
    discount_type: "FIXED_AMOUNT", discount_value: "30.00",
    application_mode: "COUPON_REQUIRED", cumulative: false, priority: 2,
    valid_from: iso(-10, 0), valid_until: iso(355, 23, 59),
    max_uses: null, max_uses_per_customer: 1, uses_count: 14, status: "ACTIVE",
    conditions: { trigger: "birthday_month" },
  },
  {
    id: "promo-3", name: "Coloração premium", description: "Promo para serviço premium",
    discount_type: "OVERRIDE_PRICE", discount_value: null,
    application_mode: "COUPON_REQUIRED", cumulative: false, priority: 3,
    valid_from: iso(-5, 0), valid_until: iso(20, 23, 59),
    max_uses: 50, max_uses_per_customer: 1, uses_count: 0, status: "DRAFT",
    conditions: { service_ids: ["svc-4"] },
  },
  {
    id: "promo-4", name: "Brinde shampoo", description: "Item grátis na compra",
    discount_type: "FREE_ITEM", discount_value: null,
    application_mode: "AUTOMATIC", cumulative: true, priority: 5,
    valid_from: iso(-60, 0), valid_until: iso(-1, 23, 59),
    max_uses: 100, max_uses_per_customer: 1, uses_count: 100, status: "EXPIRED",
    conditions: { gift_product_id: "prd-2" },
  },
];

export type CouponStatus = "ACTIVE" | "EXHAUSTED" | "CANCELLED";
export type Coupon = {
  id: string;
  promotion_id: string;
  code: string;
  generation_type: GenerationType;
  uses_count: number;
  max_uses: number;
  customer_id: string | null;
  customer_name: string | null;
  expires_at: string | null;
  coupon_reopen_policy: CouponReopenPolicy;
  status: CouponStatus;
};

export const mockCoupons: Coupon[] = [
  { id: "cp-1", promotion_id: "promo-2", code: "ANIV-7H3K", generation_type: "BULK", uses_count: 3, max_uses: 100, customer_id: null, customer_name: null, expires_at: iso(60, 23, 59), coupon_reopen_policy: "NEVER_REOPEN", status: "ACTIVE" },
  { id: "cp-2", promotion_id: "promo-2", code: "ANIV-9PQX", generation_type: "BULK", uses_count: 100, max_uses: 100, customer_id: null, customer_name: null, expires_at: iso(30, 23, 59), coupon_reopen_policy: "REOPEN_ON_REFUND", status: "EXHAUSTED" },
  { id: "cp-3", promotion_id: "promo-2", code: "MARINA-VIP", generation_type: "PER_CUSTOMER", uses_count: 0, max_uses: 3, customer_id: "c-002", customer_name: "Marina Souza", expires_at: iso(15, 23, 59), coupon_reopen_policy: "REOPEN_ON_REFUND", status: "ACTIVE" },
  { id: "cp-4", promotion_id: "promo-3", code: "COLOR50", generation_type: "SINGLE_USE", uses_count: 0, max_uses: 1, customer_id: null, customer_name: null, expires_at: iso(20, 23, 59), coupon_reopen_policy: "NEVER_REOPEN", status: "ACTIVE" },
];