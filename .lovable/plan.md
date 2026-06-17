## Fase 5A — Páginas públicas do cliente

Três páginas públicas (sem login), mobile-first, fora da área administrativa. Tudo com dados mockados, tokens semânticos, Lucide 16/1.5 e tipografia já existente (`font-display` Cormorant + Inter).

### 1) Shell público compartilhado (novo)

Criar um **layout pathless** em `src/routes/_public.tsx`:

- `Outlet` envolvido por:
  - Header mínimo, centralizado: `<Wordmark accent />` (sem nav, sem theme toggle, sem avatar).
  - `main` com `mx-auto max-w-xl px-4 py-8` (mobile-first).
  - Footer discreto: `© PALADINO` em texto pequeno/esmaecido.
- `bg-background text-foreground`.
- **Não** redireciona para `/login` em hipótese alguma.

A rota `/b/$slug` (P1) **não** entra nesse layout — ela mantém seu próprio chrome.

### 2) P1 — Aba "Produtos" na vitrine `/b/$slug`

Em `src/routes/b.$slug.index.tsx`:

- Acrescentar um quarto `<TabsTrigger value="produtos">Produtos</TabsTrigger>` ao `TabsList` existente (na ordem: Serviços · Profissionais · Produtos · Avaliações).
- Adicionar `<TabsContent value="produtos">` com um grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3`.
- Card de produto: ícone `Package` (Lucide) em placeholder quadrado quando `image` é null, nome (`font-semibold`), descrição em `line-clamp-1 text-xs text-muted-foreground`, preço em `font-display text-primary` via `formatBRL`, e `Badge variant="secondary"` "Esgotado" quando `!available` (com card em `opacity-60`).
- Link discreto "Falar no WhatsApp" (`MessageCircle` 16/1.5) por card.
- Estado vazio: bloco `border-dashed` com "Nenhum produto disponível".
- Mock dos 6 produtos definido inline (centavos → `formatBRL`).
- Não alterar demais abas, hero, sidebar ou rotas existentes.

### 3) P2 — `/manage/$token` (nova)

Arquivo `src/routes/_public.manage.$token.tsx` → URL `/manage/:token`.

Componente client-side com estados controlados por `useState`:

- **loading** (~500ms simulado) → skeleton do card.
- **invalid** (token termina em `x`): ícone `AlertCircle`, título "Link inválido ou expirado", parágrafo explicativo. Sem botões de login.
- **active**: card único com `Serviço`, `Profissional`, data/hora formatadas em pt-BR (`Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "short" })`), `Badge` "Agendado", e dois botões: **Cancelar** (variant outline) e **Remarcar**.

Ações:

- **Cancelar** → `Dialog` (shadcn `Dialog`, não `AlertDialog`) com "Voltar" / "Sim, cancelar" → estado `submitting` (spinner via `Loader2`) → tela de resultado:
  - Se `token` termina em `d` → `deposit_retained=true`: card de atenção (`border-amber-500/40 bg-amber-500/5`, ícone `AlertTriangle`) com a mensagem completa de retenção do sinal.
  - Caso contrário → card de sucesso simples "Agendamento cancelado com sucesso."
- **Remarcar** → `Dialog` com `<input type="date">` + `<input type="time">` nativos (alvos ≥ 44px, confortáveis em mobile), botão "Confirmar remarcação" → `submitting`:
  - Se `token` termina em `r` → mensagem inline "Esse horário não está disponível. Escolha outro." e mantém dialog aberto.
  - Caso contrário → fecha dialog e mostra tela de resultado com nova data/hora + aviso "Enviamos uma nova confirmação com o link atualizado".
- Após resultado final (cancelado ou remarcado), não volta ao formulário.
- Banner "Muitas tentativas, tente novamente em instantes." disparado quando o contador local de cliques no botão de submit em <3s ultrapassar 5 (simulação visual).

Mock determinístico baseado nos sufixos do `token` exatamente como especificado.

### 4) P3 — `/nps/respond/$surveyId` — encaixar no shell público

- Renomear `src/routes/nps.respond.$surveyId.tsx` → `src/routes/_public.nps.respond.$surveyId.tsx` e ajustar `createFileRoute("/_public/nps/respond/$surveyId")`.
- Remover o wrapper local de `<Wordmark />` e o `min-h-screen` (passam a vir do layout); manter card, seletor 0–10 com faixas vermelho/âmbar/verde, textarea e os estados `idle/sending/success/error` já existentes.
- Comportamento e mock determinístico (`x` → indisponível) preservados.

### Detalhes técnicos

- `routeTree.gen.ts` é regenerado pelo plugin; não editar manualmente.
- Pathless layout: arquivo `_public.tsx` com `component: () => (<PublicShell><Outlet/></PublicShell>)`; filhos via prefixo `_public.<rota>.tsx`. O segmento `_public` **não** aparece na URL.
- Sem chamadas autenticadas: páginas públicas usam apenas mocks locais.
- Ícones Lucide 16px (`h-4 w-4`) com `strokeWidth={1.5}` quando aplicável; sem emojis.
- Cores somente via tokens (`bg-card`, `border-border`, `text-primary`, `text-destructive`, `text-amber-*` apenas onde já é usado nas faixas NPS).
- Datas em `pt-BR`; valores em `formatBRL` (já existe em `@/lib/format`).

### Arquivos

- **Novo:** `src/routes/_public.tsx` (layout)
- **Novo:** `src/routes/_public.manage.$token.tsx`
- **Renomeado:** `src/routes/nps.respond.$surveyId.tsx` → `src/routes/_public.nps.respond.$surveyId.tsx`
- **Editado:** `src/routes/b.$slug.index.tsx` (apenas adição da aba Produtos)
