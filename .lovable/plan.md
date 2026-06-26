# Plano — Fase 2: Carrinho + Checkout Unificado (revisado)

**Escopo**: Compra unificada de qualquer item do catálogo, com carrinho persistido, cupom, dados do cliente e confirmação com manage URL + CTA portal. Inclui **cross-sell contextual na Tela 4** do fluxo de agendamento e **atalho "só agendar"** para preservar o caminho rápido.

## Ajustes vs revisão

1. **Cross-sell contextual (Tela 4)** entra antes da confirmação do agendamento, sugerindo apenas **pacotes** que contêm o serviço escolhido e **assinaturas** relacionadas (match por `items[]`). Sem produtos, sem promoções.
2. **Atalho "só agendar"** preservado: se o cliente não adicionar nada na Tela 4, segue pelo fluxo curto atual (`createAppointment` direto). Se adicionar pacote/assinatura, o serviço entra no carrinho como `kind:"service"` (com snapshot de barbeiro/slot) junto com o item extra, e o fluxo migra para `/b/$slug/checkout`.
3. Cross-sell **pós-checkout** continua na confirmação como upsell secundário (1 pacote + 1 assinatura).

## Camada de dados

- `src/lib/booking/types.ts` — `CartItem` (discriminated union por `kind: "service" | "package" | "subscription" | "product"`); `kind:"service"` carrega `barber_id?`, `slot_iso`, `duration_min`, `service_id`. `Cart` (`items`, `subtotal_cents`, `discount_cents`, `total_cents`, `coupon?`). `CouponValidationResult`. `CrossSellSuggestion` (`kind:"package"|"subscription"`, item completo). `CheckoutPayload`, `CheckoutResult` (`order_id`, `manage_url`, `portal_signup_hint`).
- `src/lib/booking/api.ts` — `validateCoupon(slug, code, cart)`: `PALADINO10` = 10% off geral, `BEMVINDO` = R$15 off em itens de pacote/assinatura, outros = `{valid:false, reason}`. `listContextualCrossSell(slug, serviceId)`: filtra pacotes/assinaturas cujo `items[]` contém o `serviceId` (match por nome no mock). `listPostCheckoutCrossSell(slug, cart)`: 1 pacote + 1 assinatura mais vendidos. `createOrder(slug, payload)`: gera `order_id` determinístico + `manage_url = /manage/{token}`.
- `src/lib/booking/cart.tsx` — `CartProvider` com `localStorage` (`paladino_cart_v1_{slug}`). API: `addItem`, `updateQty`, `removeItem`, `applyCoupon`, `clearCoupon`, `clear`, `hasServiceBooking()`. Cálculos puros derivados.

## Componentes

- `src/components/booking/cart-drawer.tsx` — `Sheet` lateral; lista de itens com chip de tipo, stepper de qty (exceto `service`, que é 1), remover; campo cupom inline; totais; CTA "Ir para checkout".
- `src/components/booking/cart-button.tsx` — botão flutuante no shell de `/b/$slug` com badge de qty (visível em todas as tabs).
- `src/components/booking/cross-sell-card.tsx` — card compacto (pacote/assinatura) com chips de `items[]`, preço, CTA "Adicionar".
- `src/components/booking/contextual-crosssell.tsx` — wrapper da Tela 4 com header "Aproveite e leve mais por menos" + grid de `CrossSellCard` + 2 CTAs: **"Confirmar só o agendamento"** e **"Continuar para checkout"** (este aparece se algo foi adicionado).
- Cards do catálogo (`PackageCard`, `SubscriptionCard`, `ProductCard`): botões habilitados, chamam `cart.addItem` com toast e abrem o drawer.

## Rotas

- `src/routes/b.$slug.tsx` — envolve Outlet com `CartProvider` e renderiza `CartButton`.
- `src/routes/b.$slug.agendar.tsx` — **insere Tela 4 (cross-sell contextual)** entre o atual step 3 (horário) e o step 4 (dados do cliente). Renumera para 5 steps:
  1. Serviço · 2. Barbeiro · 3. Horário · **4. Cross-sell contextual** · 5. Dados/Confirmação.
  Step 4 chama `listContextualCrossSell(slug, serviceId)`; se vazio, pula direto para step 5. Botões:
  - "Confirmar só o agendamento" → fluxo atual (`createAppointment` no step 5, sem carrinho).
  - "Continuar para checkout" (só aparece se o usuário adicionou algo) → faz `cart.addItem` do serviço (snapshot de slot/barbeiro) + redireciona para `/b/$slug/checkout`.
- `src/routes/b.$slug.checkout.tsx` *(nova)* — 2 sub-steps:
  1. **Revisão**: itens (com slot/barbeiro nos itens `kind:"service"`), qty, cupom, totais.
  2. **Dados do cliente**: nome, telefone (máscara BR), email, observação. Zod inline.
  CTA "Confirmar pedido" → `createOrder`, `cart.clear`, navega para `/b/$slug/confirmacao/$id`. Carrinho vazio → empty state com CTA "Voltar ao catálogo".
- `src/routes/b.$slug.confirmacao.$id.tsx` — refator:
  - Resumo do pedido derivado de mock determinístico por `id` (ou de `useNavigate({ state })`).
  - Bloco "Gerencie seu pedido" com `manage_url` (rota pública existente `/manage/$token`).
  - Bloco "Crie sua conta no Painel do Cliente" → `/portal/login`.
  - `CrossSellList` pós-checkout (`listPostCheckoutCrossSell`).
  - Mantém compat com fluxo legado de agendamento simples (sem cart).

## Fora desta fase

Conexão real com Railway, pagamento real, avaliações reais, persistência de pedido após reload (confirmação usa mock determinístico).

## Design

Tokens existentes; Sheet/Drawer do shadcn; mobile-first; checkout em coluna única no mobile, 2 colunas (itens / resumo sticky) em ≥`lg`.

## Validação

- `bun run build` limpo.
- **Atalho**: `/b/barbearia-do-zeca/agendar` → serviço → barbeiro → horário → Tela 4 → "Confirmar só o agendamento" → confirmação direta (fluxo legado).
- **Unificado**: mesmo fluxo, mas adiciona pacote na Tela 4 → checkout com 2 itens (serviço + pacote) → cupom `PALADINO10` → confirmação com manage link + CTA portal + cross-sell.
- **Catálogo direto**: `/b/barbearia-do-zeca` → adiciona produto via card → drawer → checkout sem agendamento.
- Cupom inválido mostra erro inline; carrinho vazio bloqueia checkout.
