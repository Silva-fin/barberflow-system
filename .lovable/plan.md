## Fase 1 — 9 telas operacionais (mock)

Conteúdo de páginas apenas (shell, sidebar, header, branding e tokens da Fase 0 ficam intactos). Tudo em React + TanStack Router (template Lovable já está em TanStack, equivalente ao App Router do Next).

### Mapa de rotas (alinhado ao sidebar PT já existente)

A spec usa caminhos `/appointments/[id]`, `/customers`, `/financeiro/pagamentos`, `/settings/financial` etc. O sidebar da Fase 0 já aponta para `/clientes`, `/fila`, `/inbox`, `/pagamentos`, `/configuracoes`. Para não reimplementar nem quebrar o sidebar, as rotas serão criadas em PT, mapeando 1:1 ao conteúdo da spec:

| Spec                              | Arquivo TanStack                                              | URL                       |
|-----------------------------------|---------------------------------------------------------------|---------------------------|
| /appointments/[id]                | `_authenticated.operacoes.$id.tsx`                            | /operacoes/:id            |
| /customers                        | `_authenticated.clientes.index.tsx`                           | /clientes                 |
| /customers/[id]                   | `_authenticated.clientes.$id.tsx`                             | /clientes/:id             |
| /crm                              | `_authenticated.crm.tsx` (+ entrada no sidebar group CRM)     | /crm                      |
| /inbox                            | `_authenticated.inbox.tsx`                                    | /inbox                    |
| /fila                             | `_authenticated.fila.tsx`                                     | /fila                     |
| /financeiro/pagamentos            | `_authenticated.pagamentos.index.tsx`                         | /pagamentos               |
| /financeiro/pagamentos/[id]       | `_authenticated.pagamentos.$id.tsx`                           | /pagamentos/:id           |
| /settings/financial (DepositPol.) | `_authenticated.configuracoes.financeiro.tsx`                 | /configuracoes/financeiro |

Única edição no sidebar: adicionar item "CRM" no grupo Relacionamento (OWNER/ADMIN) apontando para `/crm`. Nenhum outro item é tocado.

### Mocks e utilitários compartilhados

`src/lib/mock/fase1.ts` — datasets isolados (sem mexer em `mock/data.ts` da Fase 0):
- `mockAppointments` (10) com FSM, sinal/depósito opcional, histórico de transições
- `mockCustomers` (24) com classificação, cotas, consentimentos, histórico
- `mockConversations` (8) com mensagens por sender_type, escaladas/resolvidas
- `mockQueueEntries` (12) + `mockQueueConfig`
- `mockPayments` (30) PENDING/CONFIRMED/REFUNDED com método/submétodo
- `mockDepositPolicies` (4)
- `mockCrmInsights`

`src/lib/format.ts` — estender com:
- `formatBRLFromDecimal(s: string)` (API devolve "38.50")
- `formatDateTime(d, { timeZone: "America/Sao_Paulo" })`
- `Empty` componente `<span class="text-xs text-muted-foreground opacity-50">Em breve</span>`

`src/components/app/fsm-badge.tsx` — `<AppointmentBadge status>`, `<PaymentBadge status>`, `<CrmBadge classification>` com mapeamento de cor via tokens (`bg-primary`, `bg-destructive`, `text-sidebar-primary` para VIP brass, `bg-muted` para neutro, âmbar via classe utilitária `bg-amber-500/15 text-amber-700`).

`src/components/app/page-header.tsx` — título `font-display text-3xl tracking-wide` + descrição + ações.

`src/components/app/empty-state.tsx`, `error-state.tsx` (com retry), skeletons reutilizáveis para tabela.

### Padrões aplicados em todas as telas

- Cabeçalho `<PageHeader>` + container `space-y-6`.
- 4 estados: loading (Skeleton), erro (retry), vazio (texto guiado), dados.
- Toast (`sonner`) em toda ação; Dialog de confirmação em destrutivas.
- Reason obrigatório nos forms: manual-discount, grant-cota, refund.
- Ação sem endpoint → Button `disabled` + Tooltip "Em breve".
- RBAC via `useAuth().role`: OWNER-only oculta para ADMIN/OPERATOR; PROFESSIONAL em rotas de pagamento → cards somente leitura (sem botões de ação).
- Tabelas: shadcn `Table` + `Pagination` cliente (10/pg). Detalhe de operação simula paginação server-side só estado visual.

### Conteúdo por tela

**1. /operacoes/:id (Detalhe de operação)**
Grid `lg:grid-cols-3`. Coluna principal (2): `<AppointmentBadge>` + cliente + horário; Card "Serviço(s)" Table; Card "Profissional"; Card "Valores" (subtotal/desconto/total). Aside: Card Sinal/Depósito condicional (`deposit?` → "Sinal pago R$X" + saldo pendente; senão oculto) + Card "Histórico de transições" (timeline simples).
Ações: `Concluir`, `Cancelar` (Dialog com Textarea reason opcional), `Remarcar` (Dialog com DatePicker + Select horário). `Iniciar` e `NO_SHOW` disabled + Tooltip "Em breve". PROFESSIONAL: vê tudo; sem botões financeiros.

**2. /clientes (Lista CRM)**
Filtros: Select classificação · Input "sem visita há ≥ N dias". Table colunas conforme spec; "Última visita" e "Ticket médio" como `<Empty>`. Cotas ativas = Badge contador. Linha clicável → `/clientes/:id`. Pagination cliente.

**3. /clientes/:id (Ficha)**
Header: Avatar (iniciais via fallback), nome `font-display text-2xl`, telefone, `<CrmBadge>`. Tabs (`Resumo | Histórico | Cotas | Consentimentos`).
- Resumo: cards de dados + classificação + insights (cada insight em Card; oculto se ausente).
- Histórico: Table appointments passados com `<AppointmentBadge>`, paginada.
- Cotas: grid de Cards (tipo, remaining/total, validade ou "sem validade", status). Botão "Conceder cota" (Dialog: Input total>0, DatePicker opcional, Textarea reason obrigatório). Botão "Revogar" por cota (Dialog confirm).
- Consentimentos: Lista (COMMUNICATION/MARKETING/DATA_PROCESSING) com Badge GRANTED/REVOKED e botão grant/revoke.

**4. /crm (Dashboard CRM, OWNER/ADMIN)**
Guard: outras roles → Empty "Sem acesso". 4 Cards KPI (Em risco/Novos no mês/VIP/Recuperados na semana). Section: Lista Top 10 em risco (Table: nome · dias sem visita · ação Abrir ficha). Section: Sugestões de ação (Cards "Remarcar X" / "Enviar pacote Y"). Vazio → "Tudo em dia".

**5. /inbox (Master-detail)**
Layout `grid lg:grid-cols-[320px_1fr]`. Coluna esquerda: Tabs `Escaladas | Resolvidas` + lista (cliente, msg truncada, "esperando há Xm" desde `escalated_at`, Badge "Em atendimento"). Coluna direita: thread de bolhas (CLIENT esquerda muted; BOT/AGENT direita com rótulo small) em `ScrollArea`; Textarea reply + botão Enviar (toast). Botão "Resolver conversa" (Dialog → toast "Bot reassumiu o atendimento", move p/ Resolvidas). Enviar em conversa resolvida → toast erro "Conversa não está em atendimento humano". Vazio → "Nenhuma conversa em atendimento".

**6. /fila (Tabs Entradas | Configuração)**
Entradas: Filtros Select status/escopo. Table: cliente · Badge escopo (SERVICE/PROFESSIONAL/PRODUCT + alvo) · prioridade · "na fila há Xm" · status · ações. Remover (Dialog → toast). "Notificar manualmente" disabled + Tooltip "Em breve". Vazio → "Fila vazia".
Configuração (OWNER/ADMIN): Switch enabled · Select priority_mode (FIFO/PRIORITY) · Input number notification_window_hours · Botão Salvar (toast).

**7. /pagamentos (Lista)**
Filtros client-side: Select status, Select método, DateRange período. Table: Data · Cliente · Valor (`formatBRLFromDecimal(net)`) · Método (label glossário map) · `<PaymentBadge>` · ação. Linha → `/pagamentos/:id`. Ação rápida "Confirmar" (só PENDING) → Dialog → toast. Se mock flag `tenant.feeNotConfigured` → Alert banner no topo.

**8. /pagamentos/:id (Detalhe)**
Cards: Valores (bruto/desconto/líquido/taxa), Origem (método/submétodo, provider, link appointment, cupom), Datas. Ações (OWNER/ADMIN):
- Confirmar (Dialog) se PENDING.
- Estornar (Dialog: Select RefundReason obrigatório + Checkbox `force_local` só OWNER) se CONFIRMED.
- Aplicar desconto manual (Dialog: Input valor>0 + Textarea reason obrigatório) se PENDING.
OPERATOR: view-only (Cards sem botões).

**9. /configuracoes/financeiro (aba Deposit Policies)**
Tabs no topo da página (única aba implementada: "Políticas de sinal"; outras tabs como stubs disabled). Table: Serviço (nome ou "Global") · Tipo · Valor (R$ ou %) · Janela cancelamento (h) · Retain NO_SHOW Badge sim/não · ações. Botão "Nova política" (Dialog form: Select serviço/Global, Select tipo, Input valor, Input h, Switch refund_on_tenant_fault, Switch retain_on_no_show, Switch commission_on_retained_deposit). Editar reaproveita o Dialog. Excluir (Dialog confirm) → toast. Vazio → "Nenhuma política".

### Fora de escopo (confirmado)
Catálogo, Pacotes, Promoções, NPS, Estoque, Despesas, Owner, Portal, Comissões, Caixa, DRE — nada criado nesta sessão. Botões/itens já existentes no sidebar permanecem como estão (rotas inexistentes → 404 default do TanStack; não é tarefa desta fase resolver).

### Entregáveis
- 9 arquivos de rota novos em `src/routes/`
- `src/lib/mock/fase1.ts`
- `src/lib/format.ts` estendido
- `src/components/app/{fsm-badge,page-header,empty-state,error-state,empty-field}.tsx`
- Patch mínimo no `app-sidebar.tsx` adicionando item "CRM" no grupo Relacionamento (OWNER/ADMIN)
