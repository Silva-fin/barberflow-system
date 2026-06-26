import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCart } from "@/lib/booking/cart";
import { bookingApi } from "@/lib/booking/api";
import { formatBRL } from "@/lib/format";
import type { CartItem } from "@/lib/booking/types";

const KIND_LABEL: Record<CartItem["kind"], string> = {
  service: "Serviço",
  package: "Pacote",
  subscription: "Assinatura",
  product: "Produto",
};

export function CartDrawer() {
  const navigate = useNavigate();
  const { cart, slug, drawerOpen, closeDrawer, updateQty, removeItem, applyCoupon, clearCoupon } = useCart();
  const [code, setCode] = useState(cart.coupon?.code ?? "");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApplyCoupon() {
    setError(null);
    setValidating(true);
    try {
      const res = await bookingApi.validateCoupon(slug, code, {
        items: cart.items, subtotal_cents: cart.subtotal_cents,
      });
      if (res.valid) {
        applyCoupon({ code: res.code, discount_cents: res.discount_cents });
        toast.success(`Cupom ${res.code} aplicado — ${formatBRL(res.discount_cents)} off`);
      } else {
        setError(res.reason ?? "Cupom inválido.");
      }
    } finally {
      setValidating(false);
    }
  }

  function handleRemoveCoupon() {
    clearCoupon();
    setCode("");
    setError(null);
  }

  function goToCheckout() {
    closeDrawer();
    navigate({ to: "/b/$slug/checkout", params: { slug } });
  }

  return (
    <Sheet open={drawerOpen} onOpenChange={(o) => (o ? null : closeDrawer())}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-display text-xl">
            <ShoppingBag className="h-5 w-5" /> Seu carrinho
          </SheetTitle>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10" strokeWidth={1.25} />
            <p>Seu carrinho está vazio.</p>
            <Button variant="outline" onClick={closeDrawer}>Continuar comprando</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {cart.items.map((item) => (
                <CartLine
                  key={item.id}
                  item={item}
                  onQty={(qty) => updateQty(item.id, qty)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>

            <div className="border-t border-border px-5 py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground inline-flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Cupom
                </label>
                {cart.coupon ? (
                  <div className="flex items-center justify-between rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
                    <span className="font-mono font-medium text-primary">{cart.coupon.code}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        −{formatBRL(cart.coupon.discount_cents)}
                      </span>
                      <button onClick={handleRemoveCoupon} aria-label="Remover cupom" className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={code}
                      onChange={(e) => { setCode(e.target.value); setError(null); }}
                      placeholder="PALADINO10"
                      className="font-mono uppercase"
                    />
                    <Button onClick={handleApplyCoupon} disabled={!code.trim() || validating} variant="outline">
                      {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
                    </Button>
                  </div>
                )}
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>

              <div className="space-y-1.5 text-sm">
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

              <Button onClick={goToCheckout} size="lg" className="w-full">
                Ir para checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartLine({
  item, onQty, onRemove,
}: {
  item: CartItem;
  onQty: (qty: number) => void;
  onRemove: () => void;
}) {
  const isService = item.kind === "service";
  return (
    <article className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {KIND_LABEL[item.kind]}
            </Badge>
          </div>
          <h3 className="mt-1.5 font-semibold leading-tight">{item.name}</h3>
          {isService && (
            <p className="mt-1 text-xs text-muted-foreground">
              {format(new Date(item.slot_iso), "EEEE, d MMM 'às' HH:mm", { locale: ptBR })}
              {item.barber_name ? ` · ${item.barber_name}` : ""}
            </p>
          )}
        </div>
        <button onClick={onRemove} aria-label="Remover item" className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between">
        {isService ? (
          <span className="text-xs text-muted-foreground">Qtd. 1</span>
        ) : (
          <div className="inline-flex items-center rounded-md border border-border">
            <button
              onClick={() => onQty(item.qty - 1)}
              disabled={item.qty <= 1}
              className="flex h-7 w-7 items-center justify-center disabled:opacity-30"
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-7 text-center text-sm tabular-nums">{item.qty}</span>
            <button
              onClick={() => onQty(item.qty + 1)}
              className="flex h-7 w-7 items-center justify-center"
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        )}
        <span className="font-display text-base text-primary">
          {formatBRL(item.unit_price_cents * item.qty)}
        </span>
      </div>
    </article>
  );
}