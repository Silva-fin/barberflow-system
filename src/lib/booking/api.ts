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
  Package, Promotion, PublicProduct, PublicProfile, PublicService, SubscriptionPlan,
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
};