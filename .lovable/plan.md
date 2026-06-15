## Fase 3 — Financeiro profundo (13 telas, mock)

Prototipar conteúdo de 13 rotas dentro do shell já existente. Sem reimplementar sidebar, header, layout, tokens, FsmBadge existente, PageHeader, EmptyState, ErrorState, CustomerAutocomplete, DateTimePicker, format helpers. Zero cálculo financeiro no cliente — todos os valores monetários derivam do mock como string decimal e só passam por `formatBRLFromDecimal`.

### Arquivos novos / editados

**Library / dados / constantes**
- `src/lib/constants.ts` (editar): adicionar `EXPENSE_STATUS`, `PAYABLE_STATUS`, `INSTALLMENT_STATUS`, `RECONCILIATION_STATUS`, `STATEMENT_STATUS`, `TRANSFER_STATUS`, `STOCK_MOVEMENT_TYPE`, `ACCOUNT_TYPE`, `MOVEMENT_TYPE`, `ENTRY_TYPE`, `CLOSING_METHOD`, `CASH_COUNT_RESOLUTION`, `ENTRY_CATEGORY` (mapa categoria→label, incluindo as 14 categorias DESPESA listadas). `EXPENSE_CATEGORIES` deriva de `ENTRY_CATEGORY` filtrando o bucket DESPESA.
- `src/lib/mock/fase3.ts` (novo, isolado): datasets prontos para todas as 13 telas — `expenses`, `stockProducts`, `stockMovements`, `suppliers`, `supplierOrders`, `payables`, `installments`, `accounts`, `accountBalances`, `transfers`, `accountMovements`, `unreconciledMovements`, `reconciliations`, `cashCounts`, `statementBatches`, `statementLines`, `dre` (já com `*_total`, `resultado_bruto`, `resultado_liquido` calculados no mock). Todo valor monetário como string decimal.

**Componentes**
- `src/components/app/fsm-badge.tsx` (editar): adicionar `ExpenseBadge`, `PayableBadge`, `InstallmentBadge`, `ReconciliationBadge`, `StatementBadge`, `TransferBadge`, `ActiveBadge` (genérico true/false). Reusar paletas emerald/amber/destructive/sky/neutral já no arquivo.
- `src/components/app/money-input.tsx` (novo, opcional): wrapper de Input numérico com prefixo "R$" — puramente visual, devolve string. Reaproveitado em todos os Dialogs.

**Rotas (13 — todas leaves sob `_authenticated.*`)**
1. `src/routes/_authenticated.despesas.tsx` — lista + criar/pagar/cancelar.
2. `src/routes/_authenticated.estoque.index.tsx` — produtos + custo médio + alerta mínimo.
3. Receber pedido — Dialog acionado por botão na tela 2 (sem rota própria).
4. `src/routes/_authenticated.estoque.movimentacoes.tsx` — histórico + registrar movimento (sem ENTRADA).
5. `src/routes/_authenticated.fornecedores.tsx` — CRUD + desativação lógica.
6. `src/routes/_authenticated.payables.tsx` — lista + criar + cancelar.
7. Parcelas — Sheet acionado por linha da tela 6 (sem rota própria) + Dialog "Pagar parcela".
8. `src/routes/_authenticated.financeiro.dre.tsx` — seletor período + KPI strip + BarChart Recharts + tabela por bucket.
9. `src/routes/_authenticated.financeiro.contas.tsx` — Tabs `Contas` / `Transferências` / `Movimentos` / `Ajuste manual`.
10. Transferir — Dialog na aba Transferências da tela 9.
11. `src/routes/_authenticated.financeiro.conciliacao.tsx` — Tabs `Bancária` / `Caixa`. Aba bancária com fluxo sequencial abrir → marcar → fechar.
12. Contagem de caixa — Tab `Caixa` da tela 11 (lista + Dialog registrar).
13. `src/routes/_authenticated.financeiro.extrato.tsx` — cards de lotes + upload CSV (preview local + envio multipart simulado) + tabela + Dialog match/dismiss.

**Sidebar**
- `src/components/app/app-sidebar.tsx` (editar): substituir os 5 placeholders "Em breve" do grupo Financeiro pelas rotas reais:
  - Despesas → `/despesas`
  - Estoque → `/estoque` com filhos `Produtos /estoque`, `Movimentações /estoque/movimentacoes`
  - Fornecedores → `/fornecedores` (novo leaf)
  - Payables → `/payables`
  - Gestão Financeira: adicionar `Extrato /financeiro/extrato`
  - Manter Pagamentos, Caixa, Comissões, Taxas como estão (escopo de outras fases).

### Padrões aplicados em todas as telas
- Wrapper `<PageHeader>` com título font-display e ações do canto.
- Filtros client-side (status / datas / ids); paginação client-side (10/pág).
- Quatro estados obrigatórios: Skeleton, ErrorState com retry, EmptyState, dados.
- Ações destrutivas / mudança de estado sempre dentro de `Dialog` com confirmação; texto do motivo `Textarea` exigido onde a API o requer.
- Toast (`sonner`) success/error após cada ação simulada (mensagem fixa por endpoint).
- Ações sem endpoint (editar/excluir conta, reabrir conciliação, editar payable, remover parcela, ENTRADA avulsa de estoque, slot 2–5 de imagem): `disabled` + `Tooltip` "Em breve" — nunca rota.
- RBAC: `useAuth().role`; ocultar botões de escrita fora de OWNER/ADMIN (OPERATOR só lê; exceto registrar contagem de caixa).
- Monetário: `formatBRLFromDecimal(string)` direto do mock. Datas: `formatDateTime`; campos `date` puros = `toLocaleDateString("pt-BR")`.
- Ícones Lucide 16 / 1.5 conforme brief; tokens semânticos (`bg-card`, `text-muted-foreground`, `text-success`, `text-destructive`, `--chart-*`); zero cor hardcoded.

### Detalhes notáveis por tela

- **Despesas**: form recorrência (Switch → Select frequência + dia do mês + DateTimePicker fim opcional); coluna "Pago" só renderiza se `PAGA`; despesa-filha mostra ícone Repeat e ações ocultas.
- **Estoque**: badge "Estoque baixo" comparando `stock ≤ stock_min_alert` (somente leitura visual, valores da API). Botões "Receber pedido" e "Movimentações" no header.
- **Receber pedido** (Dialog): editor de itens com `Plus`/`Trash`, Select `closing_method` controlando bloco INSTALLMENTS (editor de parcelas) ou CASH_AT_CREATION (DateTimePicker). Toast com action button "Ver conta a pagar" navega para `/payables?highlight={payable_id}`. Total exibido = `total_amount` da resposta mockada.
- **Movimentações**: Select `movement_type` exclui `ENTRADA` com nota "ENTRADA só via Receber pedido"; `notes` obrigatório quando tipo=AJUSTE (validação client-side).
- **Fornecedores**: DELETE = Dialog "Desativar?" → atualiza `active=false` no estado, mantém a linha visível com `ActiveBadge` neutro.
- **Payables**: ícone `Truck` quando `source_type === "SUPPLIER_ORDER"`; ações Cancelar escondidas quando `PAID`/`CANCELLED`.
- **Parcelas (Sheet)**: ação Pagar só em `OPEN`; Dialog com Select conta (mock accounts) e payment_id opcional; após pagar, status do payable vem da resposta mockada (PARTIALLY_PAID até a última, depois PAID).
- **DRE**: Tabs `Mês`/`Trimestre`/`Ano`/`Custom`. Custom abre dois `DateTimePicker`. KPI strip (4 cards) + BarChart com séries Receita/Custo+Despesa+Taxa+Comissão+Estorno/Resultado, cores `var(--chart-1..3)`. Tabela detalhada por bucket lendo somente do mock; resultado_líquido pinta `text-success` ou `text-destructive` por sinal da string (sem soma).
- **Contas**: cards com saldo grande (font-display), badge "Padrão" e ActiveBadge; topo mostra `provider` e `accounts_count` do mock de settings. Aba Ajuste manual: Dialog confirmação dupla (Switch "Confirmo que este ajuste é definitivo" obrigatório antes de habilitar Confirmar).
- **Transferir**: validação client-side `origem !== destino` antes de habilitar Confirmar; toast erro simulando 422 quando iguais.
- **Conciliação bancária**: estado derivado do mock — Select conta → se sem `OPEN`, exibe botão `Abrir conciliação`; se com `OPEN`, exibe tabela `unreconciled` com ação Marcar conciliado e botão `Fechar conciliação` ativo (Dialog confirmação). `ReconciliationBadge` no cabeçalho.
- **Contagem de caixa**: cor da divergência derivada do sinal da string (`startsWith("-")` → destructive, `=== "0.00"` → success, senão amber). Validação UI: se `ADJUSTED` e divergência ≠ 0, `notes` obrigatório (mensagem "Justifique a divergência").
- **Extrato**: cards por batch com 4 contadores; upload — `<input type=file accept=.csv hidden>` + dropzone + Select conta + editor column_mapping (4 linhas: date*/amount*/description?/direction?). Preview lê 5 primeiras linhas via `FileReader`. "Importar" mostra `Progress` (animado mock) e toast com `StatementImportResponse` mockada. Tabela `statement` com filtros (status/batch/data) e ações: `Ver sugestões` abre Dialog com lista MovementResponse mockada (RadioGroup) → Confirmar match; `Dispensar` abre Dialog com Textarea motivo obrigatório.

### Out of scope
NPS, comunicação, WhatsApp, usuários, módulos, branding, auditoria (Fase 4); portal, owner, públicas (Fase 5). Pagamentos, Caixa, Comissões, Taxas (outras fases). Catálogo, pacotes, assinaturas, promoções (Fase 2 — não tocar).
