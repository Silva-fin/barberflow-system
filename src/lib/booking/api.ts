// Public storefront API — Phase 1 uses deterministic mocks.
//
// Phase 2 will swap the body of each function for `fetch` calls against:
//   BASE_URL = "https://labs-production-86f9.up.railway.app"
//
// 1:1 endpoint mapping:
//   getProfile(slug)         -> GET  {BASE_URL}/booking/{slug}/profile
//   listServices(slug)       -> GET  {BASE_URL}/booking/{slug}/services
//   listPackages(slug)       -> GET  {BASE_URL}/booking/{slug}/packages
//   listSubscriptions(slug)  -> GET  {BASE_URL}/booking/{slug}/subscription-plans
//   listProducts(slug)       -> GET  {BASE_URL}/booking/{slug}/products
//   listPromotions(slug)     -> GET  {BASE_URL}/booking/{slug}/promotions
//
// Keep the signatures and return types stable — UI components must not change
// when the data source flips from mock to Railway.

import { bookingMock } from "./mock";
import type {
  Cart, CartItem, CheckoutPayload, CheckoutResult, CouponValidationResult,
  CrossSellSuggestion, Package, Promotion, PublicProduct, PublicProfile,
  PublicService, SubscriptionPlan,
} from "./types";

const DELAY_MS = 250;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), DELAY_MS));
}

function ensureSlug(slug: string) {
  if (!bookingMock.isKnownSlug(slug)) {
    throw new Error(`Barbearia não encontrada: ${slug}`);
  }
}

export const bookingApi = {
  async getProfile(slug: string): Promise<PublicProfile> {
    ensureSlug(slug);
    return delay(bookingMock.profile);
  },
  async listServices(slug: string): Promise<PublicService[]> {
    ensureSlug(slug);
    return delay(bookingMock.services);
  },
  async listPackages(slug: string): Promise<Package[]> {
    ensureSlug(slug);
    return delay(bookingMock.packages);
  },
  async listSubscriptions(slug: string): Promise<SubscriptionPlan[]> {
    ensureSlug(slug);
    return delay(bookingMock.subscriptions);
  },
  async listProducts(slug: string): Promise<PublicProduct[]> {
    ensureSlug(slug);
    return delay(bookingMock.products);
  },
  async listPromotions(slug: string): Promise<Promotion[]> {
    ensureSlug(slug);
    return delay(bookingMock.promotions);
  },

  async validateCoupon(
    slug: string,
    code: string,
    cart: Pick<Cart, "items" | "subtotal_cents">,
  ): Promise<CouponValidationResult> {
    ensureSlug(slug);
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      return delay({ valid: false, code: normalized, discount_cents: 0, reason: "Informe um cupom." });
    }
    if (normalized === "PALADINO10") {
      const discount = Math.round(cart.subtotal_cents * 0.1);
      return delay({ valid: true, code: normalized, discount_cents: discount });
    }
    if (normalized === "BEMVINDO") {
      const eligible = cart.items.some((i) => i.kind === "package" || i.kind === "subscription");
      if (!eligible) {
        return delay({
          valid: false, code: normalized, discount_cents: 0,
          reason: "Cupom válido apenas com pacote ou assinatura no carrinho.",
        });
      }
      return delay({ valid: true, code: normalized, discount_cents: 1500 });
    }
    return delay({ valid: false, code: normalized, discount_cents: 0, reason: "Cupom inválido ou expirado." });
  },

  async listContextualCrossSell(slug: string, serviceId: string): Promise<CrossSellSuggestion[]> {
    ensureSlug(slug);
    const svc = bookingMock.services.find((s) => s.id === serviceId);
    if (!svc) return delay([]);
    const packageMatches = bookingMock.packages
      .filter((p) => p.items.some((i) => i.type === "service" && i.name === svc.name))
      .map<CrossSellSuggestion>((item) => ({ kind: "package", item }));
    const subMatches = bookingMock.subscriptions
      .filter((p) => p.items.some((i) => i.type === "service" && i.name === svc.name))
      .map<CrossSellSuggestion>((item) => ({ kind: "subscription", item }));
    return delay([...packageMatches, ...subMatches]);
  },

  async listPostCheckoutCrossSell(slug: string, _items: CartItem[]): Promise<CrossSellSuggestion[]> {
    ensureSlug(slug);
    const pkg = bookingMock.packages[0];
    const sub = bookingMock.subscriptions[0];
    const out: CrossSellSuggestion[] = [];
    if (pkg) out.push({ kind: "package", item: pkg });
    if (sub) out.push({ kind: "subscription", item: sub });
    return delay(out);
  },

  async createOrder(slug: string, payload: CheckoutPayload): Promise<CheckoutResult> {
    ensureSlug(slug);
    const subtotal = payload.items.reduce((acc, i) => acc + i.unit_price_cents * i.qty, 0);
    let discount = 0;
    let coupon: CheckoutResult["coupon"];
    if (payload.coupon_code) {
      const v = await bookingApi.validateCoupon(slug, payload.coupon_code, {
        items: payload.items, subtotal_cents: subtotal,
      });
      if (v.valid) {
        discount = v.discount_cents;
        coupon = { code: v.code, discount_cents: v.discount_cents };
      }
    }
    const total = Math.max(0, subtotal - discount);
    const order_id = `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const token = `${order_id.slice(-8)}`;
    const result: CheckoutResult = {
      order_id,
      manage_url: `/manage/${token}`,
      portal_signup_hint: true,
      items: payload.items,
      subtotal_cents: subtotal,
      discount_cents: discount,
      total_cents: total,
      customer: payload.customer,
      coupon,
    };
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(`paladino_order_${order_id}`, JSON.stringify(result));
      } catch { /* ignore */ }
    }
    return delay(result);
  },

  getStoredOrder(orderId: string): CheckoutResult | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem(`paladino_order_${orderId}`);
      return raw ? (JSON.parse(raw) as CheckoutResult) : null;
    } catch {
      return null;
    }
  },
};