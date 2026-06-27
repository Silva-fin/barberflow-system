import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Smartphone, Sparkles, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bookingApi } from "@/lib/booking/api";
import { formatBRL } from "@/lib/format";
import { CrossSellCard } from "@/components/booking/cross-sell-card";
import type { CartItem } from "@/lib/booking/types";
import { useCart } from "@/lib/booking/cart";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/b/$slug/confirmacao/$id")({
  head: () => ({ meta: [{ title: "Pedido confirmado" }] }),
  component: ConfirmationPage,
});

const KIND_LABEL: Record<CartItem["kind"], string> = {
  service: "Serviço",
  package: "Pacote",
  subscription: "Assinatura",
  product: "Produto",
};

function ConfirmationPage() {
  const { slug, id } = Route.useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [added, setAdded] = useState<Set<string>>(new Set());
  const order = bookingApi.getStoredOrder(id);

  const crossSellQ = useQuery({
    queryKey: ["booking", slug, "post-checkout"],
    queryFn: () => bookingApi.listPostCheckoutCrossSell(slug, order?.items ?? []),
  });

  // Legacy path: no order in session → simple appointment confirmation.
  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-display text-4xl tracking-wide">Agendamento confirmado!</h1>
          <p className="mt-3 text-muted-foreground">
            Você receberá uma confirmação por SMS/e-mail. Não se atrase!
          </p>
          <p className="mt-2 text-xs text-muted-foreground font-mono">Código: {id}</p>
          <div className="mt-8 flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link to="/b/$slug" params={{ slug }}>Fazer novo agendamento</Link>
            </Button>
          </div>
          <div className="mt-12 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" /> Powered by Paladino
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-display text-4xl tracking-wide">Pedido confirmado!</h1>
          <p className="mt-3 text-muted-foreground">
            Enviamos os detalhes para {order.customer.email || order.customer.phone}.
          </p>
          <p className="mt-2 text-xs text-muted-foreground font-mono">Código: {order.order_id}</p>
        </div>

        {/* Itens do pedido */}
        <section className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h2 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Itens</h2>
          <ul className="space-y-3">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{KIND_LABEL[i.kind]}</Badge>
                    {i.qty > 1 && <span className="text-xs text-muted-foreground">{i.qty}×</span>}
                  </div>
                  <p className="mt-1 font-semibold leading-tight">{i.name}</p>
                  {i.kind === "service" && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(i.slot_iso), "EEEE, d MMM 'às' HH:mm", { locale: ptBR })}
                      {i.barber_name ? ` · ${i.barber_name}` : ""}
                    </p>
                  )}
                </div>
                <span className="font-mono text-sm tabular-nums">{formatBRL(i.unit_price_cents * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 pt-3 text-sm border-t border-border">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatBRL(order.subtotal_cents)}</span></div>
            {order.discount_cents > 0 && (
              <div className="flex justify-between text-primary">
                <span>Desconto {order.coupon ? `(${order.coupon.code})` : ""}</span>
                <span>−{formatBRL(order.discount_cents)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 mt-2 font-semibold">
              <span>Total</span>
              <span className="font-display text-xl text-primary">{formatBRL(order.total_cents)}</span>
            </div>
          </div>
        </section>

        {/* Gerencie + Portal */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/40 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-semibold">Link de gestão no WhatsApp</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enviamos o link para gerenciar, remarcar ou cancelar seu pedido para{" "}
              <span className="font-medium text-foreground">{order.customer.phone}</span>.
            </p>
          </div>

          {order.portal_signup_hint && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                <UserPlus className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-semibold">Crie sua conta no Painel</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Acompanhe cotas, assinaturas e histórico em um só lugar.
              </p>
              <Button asChild className="mt-4 w-full">
                <Link to="/portal/login">Acessar Painel do Cliente</Link>
              </Button>
            </div>
          )}
        </section>

        {/* Cross-sell */}
        {(crossSellQ.data ?? []).length > 0 && (
          <section className="space-y-4">
            <h2 className="font-display text-2xl tracking-wide">Talvez você goste</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {(crossSellQ.data ?? []).map((s) => (
                <CrossSellCard
                  key={s.item.id}
                  suggestion={s}
                  added={added.has(s.item.id)}
                  onAdd={() => {
                    if (s.kind === "package") {
                      addItem({
                        kind: "package",
                        package_id: s.item.id,
                        name: s.item.name,
                        description: s.item.description,
                        qty: 1,
                        unit_price_cents: s.item.price_cents,
                        items: s.item.items,
                        total_cotas: s.item.total_cotas,
                        validity_days: s.item.validity_days,
                      });
                    } else {
                      addItem({
                        kind: "subscription",
                        plan_id: s.item.id,
                        name: s.item.name,
                        description: s.item.description,
                        qty: 1,
                        unit_price_cents: s.item.price_cents,
                        items: s.item.items,
                        total_cotas: s.item.total_cotas,
                        cycle: s.item.cycle,
                      });
                    }
                    setAdded((p) => new Set(p).add(s.item.id));
                    toast.success(`${s.item.name} adicionado ao carrinho`);
                    setTimeout(() => navigate({ to: "/b/$slug/checkout", params: { slug } }), 400);
                  }}
                />
              ))}
            </div>
            <div className="text-center">
              <Button asChild variant="ghost">
                <Link to="/b/$slug" params={{ slug }}>Voltar ao catálogo</Link>
              </Button>
            </div>
          </section>
        )}

        <div className="text-center text-xs text-muted-foreground inline-flex items-center justify-center gap-1 w-full">
          <Sparkles className="h-3 w-3" /> Powered by Paladino
        </div>
      </div>
    </div>
  );
}
