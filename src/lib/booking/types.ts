// Public storefront types — mirror Railway endpoints under
// https://labs-production-86f9.up.railway.app/booking/{slug}/*
// Kept stable so Phase 2 only swaps the api.ts implementation.

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface PublicHours {
  weekday: Weekday;
  open: string;
  close: string;
}

export interface PublicSocials {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
}

export interface PublicProfile {
  slug: string;
  name: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  photos?: string[];
  address: string;
  phone: string;
  whatsapp?: string;
  hours: PublicHours[];
  socials?: PublicSocials;
  rating?: number;
  reviews_count?: number;
}

export interface PublicService {
  id: string;
  name: string;
  description?: string;
  duration_min: number;
  price_cents: number;
}

export type PackageItemType = "service" | "product";

export interface PackageItem {
  type: PackageItemType;
  name: string;
  quantity: number;
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  items: PackageItem[];
  total_cotas: number;
  validity_days: number;
  price_cents: number;
}

export type SubscriptionCycle = "monthly" | "quarterly" | "yearly";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  items: PackageItem[];
  total_cotas: number;
  cycle: SubscriptionCycle;
  price_cents: number;
}

export interface PublicProduct {
  id: string;
  name: string;
  description?: string;
  price_cents: number;
  stock: number;
  image_url?: string;
}

export type PromotionKind = "auto" | "coupon";

export interface Promotion {
  id: string;
  name: string;
  description: string;
  kind: PromotionKind;
  coupon_code?: string;
  valid_until?: string;
}

// ---------- Cart & checkout ----------

export type CartItemKind = "service" | "package" | "subscription" | "product";

interface CartItemBase {
  /** Unique line id (random per add). */
  id: string;
  kind: CartItemKind;
  name: string;
  description?: string;
  qty: number;
  unit_price_cents: number;
}

export interface CartItemService extends CartItemBase {
  kind: "service";
  service_id: string;
  duration_min: number;
  slot_iso: string;
  barber_id?: string;
  barber_name?: string;
}

export interface CartItemPackage extends CartItemBase {
  kind: "package";
  package_id: string;
  items: PackageItem[];
  total_cotas: number;
  validity_days: number;
}

export interface CartItemSubscription extends CartItemBase {
  kind: "subscription";
  plan_id: string;
  items: PackageItem[];
  total_cotas: number;
  cycle: SubscriptionCycle;
}

export interface CartItemProduct extends CartItemBase {
  kind: "product";
  product_id: string;
  image_url?: string;
}

export type CartItem =
  | CartItemService
  | CartItemPackage
  | CartItemSubscription
  | CartItemProduct;

export interface AppliedCoupon {
  code: string;
  discount_cents: number;
}

export interface Cart {
  items: CartItem[];
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  coupon?: AppliedCoupon;
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discount_cents: number;
  reason?: string;
}

export type CrossSellSuggestion =
  | { kind: "package"; item: Package }
  | { kind: "subscription"; item: SubscriptionPlan };

export interface CheckoutCustomer {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface CheckoutPayload {
  items: CartItem[];
  customer: CheckoutCustomer;
  coupon_code?: string;
}

export interface CheckoutResult {
  order_id: string;
  manage_url: string;
  portal_signup_hint: boolean;
  items: CartItem[];
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  customer: CheckoutCustomer;
  coupon?: AppliedCoupon;
}