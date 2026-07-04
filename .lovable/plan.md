
# Portal do Cliente — Redesign v1

Reescreve o portal (`/portal/*`) como hub multi-empresa mobile-first. Todos os dados são mock (hardcoded). Nada de API real, sem novos endpoints.

## Escopo

- Manter rotas atuais em `src/routes/portal.*.tsx` (nomes preservados para não quebrar links já existentes).
- Reescrever visualmente e reestruturar o shell + home + seções conforme brief.
- Adicionar 3 rotas novas: `portal.agendamento.$id.tsx` (Tela 2), `portal.produtos.tsx` (Tela 5), `portal.cupons.tsx` (Tela 6).
- Ampliar mocks em `src/lib/portal/mock.ts` para suportar multi-empresa + produtos + cupons + pagamentos.

## Design system (já disponível)

- Dark por padrão (respeita `ThemeProvider` existente, toggle no header).
- Wordmark PALADINO texto dourado, `tracking [0.3em]`.
- Cards `bg-card rounded-xl`, dourado como accent (`--brand-accent`).
- Fonte display: Cormorant Garamond (já configurada).

## Estrutura de arquivos

**Novos componentes** (`src/components/portal/`):
- `portal-header.tsx` — wordmark + saudação + avatar + toggle tema (substitui header do shell no mobile).
- `company-chips.tsx` — chips roláveis horizontal (`overflow-x-auto`) com filtro `[Todas] [Empresa A] ...`. Estado global via novo hook `useCompanyFilter` (Context em `src/lib/portal/company-filter.tsx`, sem localStorage — só sessão).
- `company-cta.tsx` — CTA destacado que aparece quando uma empresa está selecionada ("Agendar / Ver catálogo" → toast placeholder).
- `home-block.tsx` — card genérico (ícone + título + resumo + link), clicável.
- `appointment-card.tsx` — card de agendamento (usado em Home e Histórico).
- `quota-card.tsx`, `subscription-card.tsx`, `product-card.tsx`, `coupon-card.tsx`, `payment-row.tsx`.
- `empty-block.tsx` — reutiliza padrão existente para estados vazio/filtrado.

**Refatorar shell** (`src/components/portal/portal-shell.tsx`):
- Remover sidebar desktop e bottom-nav mobile antigos (navegação agora é hub-based: home + seções abertas em tela cheia com botão "Voltar").
- Novo shell: header sticky (wordmark + avatar dropdown com Perfil/Sair + toggle tema) + chips de empresa fixos abaixo + `<main>` scrollável.
- Botão "voltar" (`ChevronLeft`) nas seções != home.

## Rotas / Telas

| Rota | Tela |
|---|---|
| `portal.dashboard.tsx` | **Tela 1** — Home hub (reescrita) |
| `portal.agendamento.$id.tsx` (nova) | **Tela 2** — Detalhe do agendamento + modais Remarcar/Cancelar |
| `portal.cotas.tsx` | **Tela 3** — Lista + drill-down inline (accordion/Sheet) |
| `portal.assinaturas.tsx` | **Tela 4** — Lista + ações Pausar/Retomar/Cancelar |
| `portal.produtos.tsx` (nova) | **Tela 5** — Tabs Histórico/Reservados/Comprados |
| `portal.cupons.tsx` (nova) | **Tela 6** — Lista de cupons |
| `portal.historico.tsx` | **Tela 7** — Histórico com filtro por status |
| `portal.pagamentos.tsx` | **Tela 8** — Reescrita: histórico read-only (remove gestão de cartões) |
| `portal.perfil.tsx` | **Tela 9** — Perfil + consentimentos + logout (consolidada; `portal.consentimentos.tsx` vira redirect) |

## Mock data (expandir `src/lib/portal/mock.ts`)

- Manter tipos existentes (`Appointment`, `Quota`, `Subscription`, `Establishment`).
- Adicionar:
  - `Product` com `status: "reservado" | "comprado" | "retirado"`, `quantity`, `unitPriceBRL`, `establishment`, `date`.
  - `Coupon` com `code`, `description`, `discountLabel`, `validUntil`, `establishment`, `personal: boolean`.
  - `Payment` com `description`, `amountBRL`, `method: "dinheiro" | "pix" | "cartao"`, `status: "pago" | "pendente"`, `date`, `establishment`, `couponCode?`.
- Mocks conforme brief: 2 agendamentos futuros em empresas diferentes, 3 cotas, 1 assinatura ativa, 2 produtos reservados + 1 retirado, 1 cupom pessoal, 4-5 pagamentos, 5-6 agendamentos passados.
- 3 empresas: Barbearia do Zeca, Studio Alpha, Barber King (substituem os 3 estabelecimentos atuais).

## Filtro de empresa

- Context `CompanyFilterProvider` no `portal.tsx` layout.
- Selector: `"all" | establishmentId`.
- Cada tela consome `useCompanyFilter()` e filtra sua lista/resumo.
- Quando != "all", esconde o badge de empresa nos cards (redundante) e mostra `CompanyCta`.
- Quando "all", cada card exibe badge `[Nome da Empresa]`.

## Estados por tela

Cada seção implementa 3 estados:
1. Com dados (mock principal).
2. Vazio geral (empty state amigável).
3. Filtrado por empresa sem dados (mensagem contextual: "Nenhuma X nesta empresa").

## Fluxos transacionais (mock)

- **Remarcar**: modal com date picker + hora → confirma → toast "Agendamento remarcado" + atualiza card local (state).
- **Cancelar agendamento**: modal → confirma → toast + status vira `cancelado`. Um agendamento do mock tem flag `hasDeposit: true` → mostra aviso sobre retenção de sinal.
- **Pausar/Retomar/Cancelar assinatura**: usa `updateSubscriptionStatus` existente (já mock).
- **Salvar perfil**: já existe.
- **Toggle consentimento**: já existe.

## Fora de escopo

- Login/magic link (mantém telas atuais).
- Vitrine da empresa (CTA leva a toast "Em breve" ou navega para `/b/barbearia-do-zeca` se slug conhecido).
- Backend, integrações reais, pagamentos online, gestão de cartões.

## Validação

- `bun run build` limpo.
- Navegação entre home e todas as seções funciona; botão voltar retorna à home.
- Filtro de empresa reflete em todas as seções.
- 3 estados visíveis alternando mocks (para vazio, comentário no código indicando como testar).
- Mobile 375px: chips rolam, blocos empilham em 2 colunas, seções ocupam tela cheia.
