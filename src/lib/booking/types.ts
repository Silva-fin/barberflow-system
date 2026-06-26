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