## Distinção de roles (ponto-chave)

O sistema tem DOIS universos de "owner" que NÃO se confundem:

- **Tenant** (painel da barbearia): roles `OWNER`, `ADMIN`, `OPERATOR`, `PROFESSIONAL`. Vivem no shell do tenant (sidebar petrol + header), operam UMA barbearia.
- **Plataforma** (este painel): role único `PLATFORM_OWNER`. Opera a plataforma Paladino acima de TODOS os tenants. Shell completamente separado — sidebar própria "Plataforma", sem branding do tenant, sem `useBranding`, sem `AppSidebar`/`AppHeader` do tenant.

O role `PLATFORM_OWNER` já existe em `src/lib/auth.tsx`. O guard atual em `src/routes/owner.tsx` redireciona qualquer outro role. Esse isolamento é mantido e reforçado: nenhum componente do shell do tenant (ou do portal do cliente) é importado em `src/components/owner/`.

## Escopo

7 telas (O1, O2, P1, P2, Q1, Q2, R1) + sidebar própria + banner global de impersonation, todas com mocks determinísticos cobrindo carregando/vazio/erro/dados. Sem chamadas reais. Sem novas dependências.

## Arquitetura de rotas

```text
src/routes/
  owner.tsx                          (guard PLATFORM_OWNER + OwnerShell + Provider)
  owner.index.tsx                    (redirect → /owner/tenants)
  owner.tenants.index.tsx            O1 — Tenants (lista)
  owner.tenants.$id.index.tsx        O2 — Tenant detalhe + saúde
  owner.tenants.$id.flags.tsx        P1 — Feature flags
  owner.impersonation.tsx            P2 — Impersonation
  owner.sistema.tsx                  Q1 — Reenvio + dead-letter (mock)
  owner.settings.tsx                 Q2 — Configurações globais
  owner.audit.tsx                    R1 — Auditoria cross-tenant
```

## Camada de dados (mock determinístico, isolada)

`src/lib/owner/` — pasta nova, NÃO toca `lib/portal/`, `lib/mock/` ou `lib/api/`:

- `types.ts` — espelha contratos `/platform/*` (TenantStatus, TenantSummary, TenantHealth, ImpersonationGrant, AuditItem, FlagsDict, SettingsDict, DeadLetterItem).
- `constants.ts` — `TENANT_STATUS_LABELS`, `IMPERSONATION_MODE_LABELS`, `FINANCIAL_MODULES = ['PaymentsEngine','CommissionEngine','FinancialCore']`.
- `mock.ts` — dataset determinístico in-memory:
  - ~10 tenants cobrindo os 4 status (TRIAL/ACTIVE/SUSPENDED/CHURNED).
  - Health por tenant (um saudável, um em risco, um sem integrações).
  - Flags por tenant misturando boolean, número, objeto.
  - 2 grants ativos + grants revogados.
  - ~30 entradas de audit com `before/after_snapshot`; alguns `action=impersonated_request`.
  - Settings globais (3 chaves de tipos mistos).
  - ~5 itens de dead-letter (cobrindo módulos financeiros e não-financeiros).
- `api.ts` — funções async `setTimeout(300ms)`. Estado in-memory (module-level) para que suspender/reativar, criar/encerrar grant, toggle de flag, edit de setting reflitam inline entre telas. Cada função aceita opção `{ simulate?: 'empty'|'error' }` (controlada por toggle interno na tela; não exposto na UI).
- `session.tsx` — `OwnerImpersonationProvider` (React context): grant ativo (`null | { grantId, tenantName, mode, expiresAt }`), `startGrant`, `endGrant`. Persiste em `localStorage` (`paladino_owner_impersonation`). Tick de 1s para countdown; auto-encerra quando expira.

## Shell (`src/components/owner/`)

- `owner-shell.tsx` — layout 2 colunas (sidebar fixa ~240px + main). Em mobile vira `Sheet`. Renderiza `<ImpersonationBanner />` no topo do main, sempre que houver grant ativo (em TODAS as 7 telas).
- `owner-sidebar.tsx` — nav própria: Tenants · Impersonation · Sistema · Configurações · Auditoria. Topo com label "Plataforma" em `font-display`. Footer com wordmark Paladino + Sair (`auth.logout` + redirect `/login`). Item ativo via `useRouterState`.
- `impersonation-banner.tsx` — faixa fixa `bg-destructive text-destructive-foreground`. Texto: `Acessando como PLATFORM_OWNER em [tenant] · {modo} · Expira em mm:ss · [Encerrar]`. Countdown live. Botão "Encerrar" → Dialog de confirmação → `endGrant()`. **Nunca dismissável (sem botão X)**.
- `tenant-status-badge.tsx` — mapeia status → Badge variant via tokens semânticos (secondary/default/destructive/muted). Nenhuma cor hardcoded.
- `json-editor-dialog.tsx` — Dialog reutilizável: Textarea JSON + parse + erro inline. Usado em flags (não-boolean) e settings.
- `reason-dialog.tsx` — Dialog reutilizável: Textarea de motivo obrigatório, com `minLength` opcional (20 para ELEVATED). Usado em Suspender, Reenviar comunicação, Replay.

Reaproveita `PageHeader`, `EmptyState`, `ErrorState`, `Skeleton` já existentes em `src/components/app/`. Reaproveita primitivos shadcn: Card, Table, Badge, Dialog, Select, Switch, Tabs, Tooltip, Input, Label, Textarea, Button. **Não usa** AlertDialog, RadioGroup, Progress.

## Telas (resumo funcional)

**O1 — Tenants list**
PageHeader + Select status + Input busca. Table densa: Nome · Slug · Status · Criado em · Ativo. Linha → O2. Ações: Suspender (`reason-dialog`) e Reativar (Dialog confirmação). Mutação inline. 4 estados.

**O2 — Tenant detalhe**
PageHeader com nome + Badge + ações Suspender/Reativar. Seção Dados (card). Seção Saúde (grid KPI cards) carrega independente — erro só na saúde mostra ErrorState no card sem derrubar dados. Integrações exibidas SÓ como Badge "Conectado/Não conectado" (sem segredos). Link "Feature flags →" para P1.

**P1 — Feature flags**
Itera dicionário livre: boolean → Switch (toggle otimista; erro reverte + mensagem inline). Não-boolean → linha com valor (code/Badge) + Editar → `json-editor-dialog`. Empty "Nenhuma flag configurada"; error 404 "Config não encontrada".

**P2 — Impersonation**
Card "Criar acesso": Select tenant · Textarea motivo · Select modo (READ_ONLY default / ELEVATED) · Input number duração (1–480, default 30). Validação inline: ELEVATED exige motivo ≥ 20 chars. Submit → `startGrant()` → banner aparece em todas as telas.
Table "Grants ativos": tenant · modo · motivo · expira em · criado em · Encerrar (Dialog).

**Q1 — Sistema**
Card "Reenviar comunicação" (real-shape): Input log_id (UUID) + Textarea motivo + botão. Resultado inline (`new_log_id` + status).
Card "Dead-letter / workers" marcado visualmente como "Em breve · mock". Table: módulo · evento · erro · Replay. Replay DESABILITADO com Tooltip para `PaymentsEngine|CommissionEngine|FinancialCore`. Demais → `reason-dialog`.

**Q2 — Configurações globais**
Table chave/valor genérica. Editar → `json-editor-dialog`. Mutação inline. 4 estados.

**R1 — Auditoria**
PageHeader + Tabs "Tudo" / "Impersonation" (preset `action=impersonated_request`). Filtros: company_id · actor_id · action · período. Table: company_id (sempre visível) · ator · action · resource_type · resource_id · motivo · ocorrido em. Linha → Dialog expandindo `before/after_snapshot` (JSON). Paginação com envelope `{total, page, limit, items}` + Select limit (25/50/100). Sem editar/criar/excluir/export. Sem coluna IP.

## Regras de ouro — mapeamento

1. PLATFORM_OWNER único → guard em `owner.tsx` (já existente, mantido). Shell sem qualquer import de `components/app/app-sidebar` ou `components/portal/*`.
2. Banner persistente → `OwnerImpersonationProvider` + `ImpersonationBanner` no shell, sem botão X.
3. Credenciais mascaradas → O2 só renderiza booleano.
4. Replay com motivo + financeiros desabilitados → `reason-dialog` + `FINANCIAL_MODULES`.
5. Audit append-only → R1 sem mutações nem export.
6. Mocks determinísticos cobrindo 4 estados.
7. Confirmações via `Dialog` (não AlertDialog). Sem RadioGroup/Progress.

## Tokens e visual

Apenas tokens semânticos (`bg-card`, `border-border`, `text-muted-foreground`, `bg-primary`, `bg-destructive`, `text-destructive-foreground`). `font-display` (Cormorant) em PageHeaders, label "Plataforma" e wordmark. Ícones Lucide 16px stroke 1.5. Tabelas densas.

## Arquivos a criar

- `src/lib/owner/{types.ts, constants.ts, mock.ts, api.ts, session.tsx}`
- `src/components/owner/{owner-shell.tsx, owner-sidebar.tsx, impersonation-banner.tsx, tenant-status-badge.tsx, json-editor-dialog.tsx, reason-dialog.tsx}`
- 7 arquivos de rota listados acima

## Arquivos a editar

- `src/routes/owner.tsx` — envolver com `OwnerImpersonationProvider` + `OwnerShell` (guard PLATFORM_OWNER mantido).
- `src/routes/owner.index.tsx` — redirect para `/owner/tenants`.

## Fora de escopo

Não tocar: `routes/portal.*`, `routes/_authenticated.*`, `routes/_public.*`, `routes/b.$slug.*`, `routes/index.tsx`, `routes/login.tsx`. Não importar nada do shell do tenant nem do portal. Sem novas dependências. Sem chamadas reais.
