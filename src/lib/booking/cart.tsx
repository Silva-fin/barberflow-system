import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AppliedCoupon, Cart, CartItem } from "./types";

interface CartContextValue {
  cart: Cart;
  slug: string;
  addItem: (item: Omit<CartItem, "id"> & { id?: string }) => CartItem;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  clearCoupon: () => void;
  hasServiceBooking: () => boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  drawerOpen: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function storageKey(slug: string) {
  return `paladino_cart_v1_${slug}`;
}

function randomId() {
  return `ci_${Math.random().toString(36).slice(2, 10)}`;
}

function computeTotals(items: CartItem[], coupon?: AppliedCoupon): Cart {
  const subtotal = items.reduce((acc, i) => acc + i.unit_price_cents * i.qty, 0);
  const discount = coupon ? Math.min(coupon.discount_cents, subtotal) : 0;
  return {
    items,
    subtotal_cents: subtotal,
    discount_cents: discount,
    total_cents: Math.max(0, subtotal - discount),
    coupon,
  };
}

interface PersistedCart {
  items: CartItem[];
  coupon?: AppliedCoupon;
}

function loadPersisted(slug: string): PersistedCart {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as PersistedCart;
    return { items: Array.isArray(parsed.items) ? parsed.items : [], coupon: parsed.coupon };
  } catch {
    return { items: [] };
  }
}

export function CartProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hydrated = useRef(false);

  // Hydrate from localStorage on mount or when slug changes.
  useEffect(() => {
    const persisted = loadPersisted(slug);
    setItems(persisted.items);
    setCoupon(persisted.coupon);
    hydrated.current = true;
  }, [slug]);

  // Persist on change (after hydration).
  useEffect(() => {
    if (!hydrated.current || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify({ items, coupon }));
    } catch { /* ignore */ }
  }, [slug, items, coupon]);

  const addItem = useCallback<CartContextValue["addItem"]>((input) => {
    const item = { ...input, id: input.id ?? randomId() } as CartItem;
    setItems((prev) => [...prev, item]);
    return item;
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
        .filter((i) => i.qty > 0),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setCoupon(undefined);
  }, []);

  const applyCoupon = useCallback((c: AppliedCoupon) => setCoupon(c), []);
  const clearCoupon = useCallback(() => setCoupon(undefined), []);

  const hasServiceBooking = useCallback(
    () => items.some((i) => i.kind === "service"),
    [items],
  );

  const cart = useMemo(() => computeTotals(items, coupon), [items, coupon]);

  const value = useMemo<CartContextValue>(() => ({
    cart,
    slug,
    addItem,
    updateQty,
    removeItem,
    clear,
    applyCoupon,
    clearCoupon,
    hasServiceBooking,
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  }), [cart, slug, addItem, updateQty, removeItem, clear, applyCoupon, clearCoupon, hasServiceBooking, drawerOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}