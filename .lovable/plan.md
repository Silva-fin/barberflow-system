# Fase 2 — Comercial (10 telas, mock)

Prototipa o bloco Comercial sobre o shell da Fase 0 e os utilitários da Fase 1. Tudo client-side, sem API real.

## Pré-requisitos a criar (faltantes do contrato Fase 1)

A spec assume `CustomerAutocomplete`, `PAYMENT_METHOD_OPTIONS` e `lib/constants.ts` já existentes — não estão no projeto. Criar como dependências mínimas:

- `src/lib/constants.ts` — `DISCOUNT_TYPE`, `APPLICATION_MODE`, `GENERATION_TYPE`, `COUPON_REOPEN`, `PAYMENT_METHOD_OPTIONS` (agrupado Dinheiro/Pix · Crédito · Débito), `ENTITY_TYPE` (serviço/produto/despesa).
- `src/components/app/customer-autocomplete.tsx` — Combobox shadcn sobre lista mock de clientes; emite `{id, name}`.
- `src/components/app/datetime-picker.tsx` — wrapper `Input type="datetime-local"` (label + value/onChange controlado), usado em assinaturas/promoções/cupons.

## Extensões compartilhadas

- `src/components/app/fsm-badge.tsx` — adicionar `PackagePurchaseBadge`, `SubscriptionBadge`, `PromotionBadge`, `CouponBadge` seguindo a paleta semântica já usada (emerald/amber/destructive/muted). Sem hardcodar `#hex`.
- `src/lib/mock/fase2.ts` — datasets isolados por tela: categories, serviceVariants (por serviceId), professionalPricing (por professionalId), products (com galeria de até 5 slots), packagePlans, packagePurchases, subscriptionPlans, subscriptions, promotions, coupons (por promotionId).
- `src/components/app/app-sidebar.tsx` — ajustar links existentes para apontar às novas rotas: `Catálogo` → `/catalogo/servicos|produtos|categorias`, `Pacotes / Assinaturas` (separar em `/pacotes` + `/assinaturas/planos` + `/assinaturas`), `Promoções / Cupons` → `/promocoes`. Não tocar em estilo/colapso.

## Rotas (TanStack file-based, todas sob `_authenticated`)

```text
_authenticated.catalogo.categorias.tsx            (tela 1)
_authenticated.catalogo.servicos.tsx              (tela 2 — Sheet "Variantes" embutida)
_authenticated.catalogo.produtos.tsx              (tela 4 — galeria no Dialog)
_authenticated.profissionais.$id.tsx              (tela 3 — ficha com tab "Preços por serviço")
_authenticated.pacotes.index.tsx                  (tela 5 — Planos + ação Vender abre Dialog tela 6)
_authenticated.pacotes.compras.tsx                (tela 7)
_authenticated.assinaturas.planos.tsx             (tela 8)
_authenticated.assinaturas.index.tsx              (tela 9)
_authenticated.promocoes.index.tsx                (tela 10a)
_authenticated.promocoes.$id.cupons.tsx           (tela 10b)
```

Tela 6 (Venda de pacote) é um Dialog stepper hospedado dentro de `pacotes.index.tsx` (não vira rota).

## Padrão por tela

Toda página usa `PageHeader` (font-display, tracking-wide), wrappers `Card`, shadcn `Table` + paginação client-side (10/pg), 4 estados (Skeleton/erro com retry/empty guiado/dados), `sonner` toast em toda ação, `Dialog` para destrutivas. Ações sem endpoint → não renderizar OU `disabled` + Tooltip "Em breve". RBAC via `useAuth().role`.

## Detalhes por tela

1. **Categorias** — agrupar por `entity_type`, ordenar por `sort_order`. Form Dialog (nome, entity_type, sort_order, Switch is_active). Switch is_active inline na linha. `is_default=true` → excluir e nome/tipo/ordem disabled + Tooltip; só `is_active` editável. OPERATOR vê em read-only.

2. **Serviços + Variantes (Sheet)** — manter lista de serviços existente; cada linha ganha ação "Variantes" → `Sheet` lateral com nome do serviço + Table (Nome · Preço via `formatBRLFromDecimal` · Duração `${n} min` · Ordem · Status · ações) + form inline (Input nome, preço, duration_min, sort_order). Sem rota nova.

3. **Profissional [id]** — ficha existente (mock) com Tabs: Horários · Serviços · Bloqueios · **Preços por serviço (novo, OWNER/ADMIN)**. Table: Serviço · Preço base · Preço override · Duração override (ou EmptyField "—") · Status · ações. Form criar: Select service_id · preço · duração (opc). Editar restrito a price/duration/is_active. PROFESSIONAL não vê a tab.

4. **Produtos + galeria** — Dialog de criar/editar produto com grid de 5 slots. SLOT 1 = primária (persiste em `image_url`), upload real simulado (POST `/uploads/` mockado, spinner, toast). SLOTS 2–5 visuais, `disabled` + Badge "Em breve". Drag-and-drop opcional (ordenar slots 1↔n só visual). Remover por slot.

5. **Pacotes (planos)** — Table: Nome · Serviço (`mock.lookupServiceName(service_id)` ou "Genérico" se null) · `total_cotas` · Preço · Validade (`${validity_days} dias` ou "Sem validade") · Status · ações Editar/Excluir/**Vender**. Form Dialog: nome · cotas (int>0) · preço · Select serviço (com opção "Genérico") · validade dias (opc) · Switch is_active (só editar). Modelo: 1 `service_id` nullable.

6. **Vender pacote (Dialog stepper)** — 4 steps: Cliente (`CustomerAutocomplete`) → Plano (resumo) → Pagamento (`PAYMENT_METHOD_OPTIONS` em RadioGroup agrupado) → Confirmar. Submit cria localmente `PackagePurchase{status:'PENDING_PAYMENT'}` + Payment PENDING; toast "Pacote vendido — pagamento pendente de confirmação" + link opcional para `/pagamentos/$id`. **Não confirma sozinha, nem CASH.** OPERATOR pode usar.

7. **Pacotes / Compras (read-only)** — Table: Data · Cliente · Pacote · Valor (`total_price`) · Status (`PackagePurchaseBadge`) · Pagamento (Link `/pagamentos/$id`) · "Ver cotas" (Link `/clientes/$id`#cotas). Filtros client-side: status, cliente. Linha → Dialog detalhe. Sem cancelar/estornar.

8. **Assinaturas / Planos** — Table: Nome · Serviço (ou "Genérico") · Cotas/ciclo · Preço · `${cycle_days} dias` · Rollover (badge sim/não) · Status · ações. Form Dialog: nome · cotas_per_cycle · preço · ciclo (default 30) · Switch rollover_enabled · Select serviço (opc) · Switch is_active. Sem DELETE: ação "Desativar" = PATCH is_active=false.

9. **Assinaturas / Instâncias** — Table: Cliente · Plano · Status (`SubscriptionBadge`) · Próx. cobrança (`formatDateTime`) · Em atraso desde · ações. Filtros client-side (status/cliente). "Nova assinatura" Dialog: CustomerAutocomplete + Select plano + DateTimePicker `first_billing_at` (opc). Ações por status (esconder inválidas): Pausar (ACTIVE) · Retomar (PAUSED) · Cancelar (ACTIVE/PAUSED/OVERDUE) via Dialog. **Sem reason.**

10a. **Promoções (lista)** — Table: Nome · Tipo (`discount_type`) · Valor (% se PERCENTAGE; `formatBRLFromDecimal` se FIXED_AMOUNT; "—" caso contrário) · Modo · Status (`PromotionBadge`) · Vigência (`valid_from`–`valid_until`) · Usos (`uses_count/max_uses`) · ações. Form criar Dialog: nome · Textarea descrição · Select discount_type · discount_value (condicional; PERCENTAGE ≤100) · Select application_mode · Switch cumulative · priority · DateTimePicker valid_from/until · max_uses · max_uses_per_customer. `conditions` read-only (mostra JSON). Ações por status: Ativar (DRAFT/PAUSED) · Pausar (ACTIVE) · Cancelar (DRAFT/ACTIVE/PAUSED, Dialog) · **Cupons** → 10b. **Sem editar/excluir.**

10b. **Cupons da promoção** — Header com nome/status da promoção + botão "Gerar cupons" + Table: Código (+ botão copiar com `navigator.clipboard`) · Tipo (`generation_type`) · Usos (`uses_count/max_uses`) · Cliente (se PER_CUSTOMER) · Validade (`expires_at`) · Reabertura (`coupon_reopen_policy`) · Status (`CouponBadge`). Form Dialog "Gerar cupons" — Select `generation_type` com campos condicionais:
- BULK: quantity · prefix (opc) · max_uses
- SINGLE_USE: code (opc)/prefix · max_uses fixo 1 (disabled)
- PER_CUSTOMER: CustomerAutocomplete obrigatório · max_uses
- comuns: DateTimePicker expires_at · Select coupon_reopen_policy
Gera N linhas localmente e exibe toast "N cupons gerados".

## Arquivos criados

```text
src/lib/constants.ts
src/lib/mock/fase2.ts
src/components/app/customer-autocomplete.tsx
src/components/app/datetime-picker.tsx
src/routes/_authenticated.catalogo.categorias.tsx
src/routes/_authenticated.catalogo.servicos.tsx
src/routes/_authenticated.catalogo.produtos.tsx
src/routes/_authenticated.profissionais.$id.tsx
src/routes/_authenticated.pacotes.index.tsx
src/routes/_authenticated.pacotes.compras.tsx
src/routes/_authenticated.assinaturas.planos.tsx
src/routes/_authenticated.assinaturas.index.tsx
src/routes/_authenticated.promocoes.index.tsx
src/routes/_authenticated.promocoes.$id.cupons.tsx
```

## Arquivos editados

```text
src/components/app/fsm-badge.tsx        # +4 badges (PackagePurchase, Subscription, Promotion, Coupon)
src/components/app/app-sidebar.tsx      # rearranja links Comercial p/ novas rotas
```

## Fora do escopo (não tocar)

Financeiro, Estoque, Fornecedores, Payables, Despesas, NPS, Comunicação, Inbox, Owner, Portal. Editor de `conditions` de promoção, cancelar compra de pacote, slots 2–5 de imagem, DELETE de plano de assinatura, editar/excluir promoção — todos disabled + Tooltip "Em breve" ou não renderizados.
