import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, ArrowRight, Check, Loader2, LogIn, ShoppingBag, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import { useCart } from "@/lib/booking/cart";
import { bookingApi } from "@/lib/booking/api";
import { formatBRL } from "@/lib/format";
import type { CartItem, CheckoutCustomer } from "@/lib/booking/types";
import { usePortalSession } from "@/lib/portal/session";
import paladinoWordmark from "@/assets/paladino-wordmark-tight.png";

export const Route = createFileRoute("/b/$slug/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Paladino" }] }),
  component: CheckoutPage,
});

const KIND_LABEL: Record<CartItem["kind"], string> = {
  service: "Serviço",
  package: "Pacote",
  subscription: "Assinatura",
  product: "Produto",
};

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

type SubStep = "review" | "customer";

function CheckoutPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { cart, updateQty, removeItem, applyCoupon, clearCoupon, clear } = useCart();
  const { session } = usePortalSession();
  const [sub, setSub] = useState<SubStep>("review");
  const [code, setCode] = useState(cart.coupon?.code ?? "");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [customer, setCustomer] = useState<CheckoutCustomer>({ name: "", phone: "", email: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  if (cart.items.length === 0) {
    return (
      <Shell>
        <div className="mx-auto max-w-md text-center py-20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ShoppingBag className="h-7 w-7" strokeWidth={1.25} />
          </div>
          <h1 className="mt-6 font-display text-3xl">Seu carrinho está vazio</h1>
          <p className="mt-2 text-sm text-muted-foreground">Volte ao catálogo para escolher itens.</p>
          <Button asChild className="mt-6">
            <Link to="/b/$slug" params={{ slug }}>Voltar ao catálogo</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  async function handleApplyCoupon() {
    setCouponError(null);
    setValidating(true);
    try {
      const res = await bookingApi.validateCoupon(slug, code, { items: cart.items, subtotal_cents: cart.subtotal_cents });
      if (res.valid) {
        applyCoupon({ code: res.code, discount_cents: res.discount_cents });
        toast.success(`Cupom ${res.code} aplicado`);
      } else {
        setCouponError(res.reason ?? "Cupom inválido.");
      }
    } finally {
      setValidating(false);
    }
  }

  function validCustomer() {
    return customer.name.trim().length >= 3 && customer.phone.replace(/\D/g, "").length >= 10;
  }

  async function handleConfirm() {
    const payloadCustomer: CheckoutCustomer = session
      ? { name: session.name, phone: session.phone, email: session.email, notes: "" }
      : customer;
    if (!session && !validCustomer()) return;
    setSubmitting(true);
    try {
      const res = await bookingApi.createOrder(slug, {
        items: cart.items,
        customer: payloadCustomer,
        coupon_code: cart.coupon?.code,
      });
      clear();
      toast.success("Pedido confirmado!");
      navigate({ to: "/b/$slug/confirmacao/$id", params: { slug, id: res.order_id } });
    } catch {
      toast.error("Erro ao confirmar pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Shell slug={slug}>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* MAIN */}
        <main className="space-y-6">
          <SubStepper current={sub} />

          {sub === "review" && (
            <section className="space-y-4">
              <h2 className="font-display text-2xl tracking-wide">Revisão do pedido</h2>
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <ReviewLine key={item.id} item={item}
                    onQty={(qty) => updateQty(item.id, qty)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>

              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground inline-flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Cupom
                </div>
                {cart.coupon ? (
                  <div className="flex items-center justify-between rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
                    <span className="font-mono font-medium text-primary">{cart.coupon.code}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      −{formatBRL(cart.coupon.discount_cents)}
                      <button onClick={() => { clearCoupon(); setCode(""); }} aria-label="Remover cupom"><X className="h-4 w-4" /></button>
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={code}
                      onChange={(e) => { setCode(e.target.value); setCouponError(null); }}
                      placeholder="PALADINO10"
                      className="font-mono uppercase"
                    />
                    <Button onClick={handleApplyCoupon} disabled={!code.trim() || validating} variant="outline">
                      {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
                    </Button>
                  </div>
                )}
                {couponError && <p className="text-xs text-destructive">{couponError}</p>}
              </div>

              <div className="flex justify-between pt-2">
                <Button asChild variant="ghost">
                  <Link to="/b/$slug" params={{ slug }}><ArrowLeft className="mr-1 h-4 w-4" /> Continuar comprando</Link>
                </Button>
                <Button onClick={() => setSub("customer")}>Continuar <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </section>
          )}

          {sub === "customer" && (
            <section className="space-y-4">
              {session ? (
                <>
                  <h2 className="font-display text-2xl tracking-wide">Confirme seu pedido</h2>
                  <div className="rounded-lg border border-border bg-card p-5">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Logado como</p>
                    <p className="mt-2 font-display text-2xl tracking-wide">Olá, {session.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{session.phone}</p>
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" onClick={() => setSub("review")}>
                      <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
                    </Button>
                    <Button onClick={handleConfirm} disabled={submitting}>
                      {submitting ? "Confirmando..." : <>Confirmar pedido <ArrowRight className="ml-1 h-4 w-4" /></>}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm">Já tem conta?</p>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        to="/portal/login"
                        search={{ redirect: `/b/${slug}/checkout` }}
                      >
                        <LogIn className="mr-2 h-4 w-4" /> Entrar no Painel do Cliente
                      </Link>
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    ou continue como visitante
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <h2 className="font-display text-2xl tracking-wide">Seus dados</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input id="name" value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input id="phone" value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: maskPhone(e.target.value) })}
                    placeholder="(11) 90000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail (opcional)</Label>
                  <Input id="email" type="email" value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="seu@email.com" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="notes">Observação (opcional)</Label>
                  <Textarea id="notes" rows={3} value={customer.notes}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    placeholder="Alguma preferência ou alergia?" />
                </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" onClick={() => setSub("review")}><ArrowLeft className="mr-1 h-4 w-4" /> Voltar</Button>
                    <Button onClick={handleConfirm} disabled={!validCustomer() || submitting}>
                      {submitting ? "Confirmando..." : <>Confirmar pedido <Check className="ml-1 h-4 w-4" /></>}
                    </Button>
                  </div>
                </>
              )}
            </section>
          )}
        </main>

        {/* SUMMARY */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Resumo</h3>
            <div className="space-y-2 text-sm">
              {cart.items.map((i) => (
                <div key={i.id} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {i.qty}× {i.name}
                  </span>
                  <span className="font-medium tabular-nums">{formatBRL(i.unit_price_cents * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>{formatBRL(cart.subtotal_cents)}</span>
              </div>
              {cart.discount_cents > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Desconto</span><span>−{formatBRL(cart.discount_cents)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 mt-2 font-semibold">
                <span>Total</span>
                <span className="font-display text-xl text-primary">{formatBRL(cart.total_cents)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function SubStepper({ current }: { current: SubStep }) {
  const items: { key: SubStep; label: string }[] = [
    { key: "review", label: "Revisão" },
    { key: "customer", label: "Seus dados" },
  ];
  const idx = items.findIndex((i) => i.key === current);
  return (
    <div className="flex items-center gap-2">
      {items.map((it, i) => {
        const done = i < idx;
        const isCurrent = i === idx;
        return (
          <div key={it.key} className="flex flex-1 items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium ${done ? "border-primary bg-primary text-primary-foreground" : isCurrent ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
              {done ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span className={`text-xs ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>{it.label}</span>
            {i < items.length - 1 && <div className={`h-px flex-1 ${done ? "bg-primary" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function ReviewLine({ item, onQty, onRemove }: { item: CartItem; onQty: (qty: number) => void; onRemove: () => void }) {
  const isService = item.kind === "service";
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{KIND_LABEL[item.kind]}</Badge>
          <h3 className="mt-1.5 font-semibold leading-tight">{item.name}</h3>
          {isService && (
            <p className="mt-1 text-xs text-muted-foreground">
              {format(new Date(item.slot_iso), "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              {item.barber_name ? ` · ${item.barber_name}` : ""}
            </p>
          )}
          {!isService && "items" in item && (
            <p className="mt-1 text-xs text-muted-foreground">
              {item.items.map((i) => `${i.quantity}× ${i.name}`).join(" · ")}
            </p>
          )}
        </div>
        <button onClick={onRemove} aria-label="Remover" className="text-muted-foreground hover:text-destructive">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        {isService ? (
          <span className="text-xs text-muted-foreground">Qtd. 1</span>
        ) : (
          <div className="inline-flex items-center rounded-md border border-border">
            <button onClick={() => onQty(item.qty - 1)} disabled={item.qty <= 1} className="flex h-7 w-7 items-center justify-center disabled:opacity-30" aria-label="Diminuir">−</button>
            <span className="w-7 text-center text-sm tabular-nums">{item.qty}</span>
            <button onClick={() => onQty(item.qty + 1)} className="flex h-7 w-7 items-center justify-center" aria-label="Aumentar">+</button>
          </div>
        )}
        <span className="font-display text-lg text-primary">{formatBRL(item.unit_price_cents * item.qty)}</span>
      </div>
    </article>
  );
}

function Shell({ slug, children }: { slug?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          {slug ? (
            <Link to="/b/$slug" params={{ slug }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
            </Link>
          ) : <span />}
          <div className="flex items-center gap-3">
            <img src={paladinoWordmark} alt="Paladino" className="h-12 md:h-14 w-auto object-contain brightness-110 contrast-110 drop-shadow-sm" />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}