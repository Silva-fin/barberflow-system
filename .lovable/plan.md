# Plano — Fase 1: Catálogo público completo em `/b/$slug` (revisado)

**Escopo**: Estender a vitrine pública com **5 tabs de catálogo + Avaliações (placeholder)**, somente leitura, sem carrinho/checkout/agendamento novo. Toda a leitura de dados públicos (profile + catálogo) passa a vir da nova camada `bookingApi`, deixando a Fase 2 (conectar Railway) como troca cirúrgica do corpo das funções.

Fluxo de agendamento (`/b/$slug/agendar` → `/b/$slug/confirmacao/$id`) fica intocado nesta fase.

## Mudanças aplicadas vs revisão

- **Avaliações** entra como 6ª tab, sempre visível, com `EmptyState` "Em breve" (sem dados, sem chamada de API). Mantém consistência com o `/b/$slug` atual e evita regressão visual.
- **Profile unificado**: hero + sidebar passam a consumir `bookingApi.getProfile(slug)` — fim do paralelismo entre `api.getBarbershopBySlug` e `bookingApi.*`. Na Fase 2, todo o `/b/$slug` aponta para o Railway trocando só o corpo do `bookingApi`.

## O que muda

### Novos arquivos
- `src/lib/booking/types.ts` — `PublicProfile` (nome, slug, descrição, logo_url, cover_url, endereço, telefone/WhatsApp, horários, redes), `PublicService`, `Package` (`items[]`, `total_cotas`, `validity_days`, `price`), `SubscriptionPlan` (`items[]`, `total_cotas`, `cycle`, `price`), `PublicProduct` (`price`, `stock`, `image_url`), `Promotion` (`auto` vs `coupon`, `valid_until`).
- `src/lib/booking/mock.ts` — dataset determinístico do slug `barbearia-do-zeca` (mantém slug atual pra não quebrar links existentes): profile completo + 6 serviços + 3 pacotes + 2 assinaturas + 6 produtos (2 esgotados) + 3 promoções (2 auto, 1 cupom).
- `src/lib/booking/api.ts` — `bookingApi.getProfile/listServices/listPackages/listSubscriptions/listProducts/listPromotions(slug)`. Implementação atual = mock + `setTimeout(250)`. Header comenta `BASE_URL = https://labs-production-86f9.up.railway.app` e mapeia 1:1 cada função ao endpoint real, para a Fase 2 trocar apenas o corpo.
- `src/components/booking/catalog-tabs.tsx` — wrapper das 6 tabs (Serviços | Pacotes | Assinaturas | Produtos | Promoções | Avaliações), estado via search param `?tab=`.
- `src/components/booking/service-card.tsx` — nome, duração, preço, botão "Agendar" navega para `/b/$slug/agendar` (comportamento atual).
- `src/components/booking/package-card.tsx` — chips dos `items[]` (cor por tipo), total de cotas, preço, validade, botão "Adicionar ao carrinho" desabilitado com tooltip "Em breve".
- `src/components/booking/subscription-card.tsx` — igual ao pacote, preço `R$ X / ciclo`, "Assinar" desabilitado.
- `src/components/booking/product-card.tsx` — imagem/placeholder, preço, badge "Esgotado", botão "Adicionar" desabilitado.
- `src/components/booking/promotion-card.tsx` — informativo: nome, descrição, validade, badge "Automático" ou "Use o cupom: CÓDIGO".
- `src/components/booking/item-chip.tsx` — chip `Nx Nome` com variantes serviço/produto.

### Arquivos editados
- `src/routes/b.$slug.index.tsx`:
  - Substituir leitura atual (`api.getBarbershopBySlug` + `api.listServices` + `api.listBarbers` + `ProductsTab` inline) por consumo único do `bookingApi`.
  - Hero/sidebar leem `bookingApi.getProfile(slug)`; catálogo lê os 5 `list*`.
  - Renderizar `<CatalogTabs>` com as 6 tabs. Avaliações = `EmptyState` "Em breve".
  - Estados: skeleton por tab, empty ("Nenhum pacote disponível"), erro inline com retry.
  - Remover `ProductsTab` antiga (mocks inline + WhatsApp) — substituída por `ProductCard` padronizado.
- Nenhuma alteração em `/b/$slug/agendar`, `/b/$slug/confirmacao/$id`, `src/lib/api/index.ts`, ou qualquer outro shell. O `api.getBarbershopBySlug` continua disponível para quem o usa fora desta tela.

## Design
- Tokens existentes (petrol/dourado, `font-display` Cormorant em preços e títulos de card, `rounded-2xl` em cards grandes / `rounded-lg` em chips).
- Mobile-first: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` para pacotes/assinaturas/produtos/promoções; serviços em lista larga (mantém padrão atual).
- Botões "Em breve" usam `disabled` + tooltip — sinalizam Fase 2 sem quebrar nada.

## Fora desta fase (Fase 2)
Carrinho drawer, `/b/$slug/checkout`, step de dados do cliente, `POST /coupon/validate`, confirmação unificada com cross-sell + manage URL + CTA portal, troca dos mocks por `fetch` real apontando para o Railway, dados reais de avaliações.

## Validação
- `bun run build` limpo.
- `/b/barbearia-do-zeca`: 6 tabs renderizam, "Agendar" segue funcionando, botões "Em breve" desabilitados, tab Avaliações mostra placeholder.
