# Suplemento Sprint Visual Gap — 2 telas

Sidebar já tem **Operações** (`/operacoes`) e **Caixa** (`/caixa`). Falta apenas criar os arquivos de rota — sem mudanças no sidebar e sem backend.

## 1. `src/routes/_authenticated.operacoes.index.tsx` (NOVA)

Lista de atendimentos do tenant.

**Layout**
- `PageHeader` "Operações" + botão `+ Novo Agendamento` → `Link to="/agenda/novo"`.
- Barra de filtros (card): `Select` Barbeiro · `Select` Status · `DatePicker` De · `DatePicker` Até · `Input` busca por cliente (ícone Search).
- Tabela padrão (`rounded-lg border`, header `bg-muted/50`):
  Data/Hora · Cliente · Serviço · Barbeiro · Status (`AppointmentBadge`) · Valor (text-right, `formatBRL`) · ações (chevron).
- Linha inteira clicável → `navigate({ to: "/operacoes/$id", params: { id } })`.

**Estados**
- `Skeleton` (linhas) · `ErrorState` com botão retry · `EmptyState` "Nenhum atendimento encontrado" · dados.
- Padrão fase 1→loading 600ms→dados via `Promise.resolve` em `useQuery`.

**Mock** (adicionar em `src/lib/mock/fase-reskin.ts`)
- `mockOperations`: 15 itens com `id`, `dateTime`, `customerName`, `serviceName`, `barberId`, `barberName`, `status` (variando Agendado/EmAndamento/Concluido/Cancelado/NaoCompareceu), `valor` (R$ 30–180).
- Helper `fetchOperations(): Promise<Operation[]>`.

## 2. `src/routes/_authenticated.caixa.tsx` (NOVA)

`PageHeader` "Caixa" + descrição "Movimentações e contagem do dia".

`Tabs` do shadcn com 2 abas:

### Tab "Movimentações do dia"
- KPI strip — 3 `Card`s: Entradas (R$), Saídas (R$), Saldo (R$). `formatBRL`, ícones Lucide 16/1.5.
- Tabela: Hora · Descrição · Tipo (Badge Entrada/Saída usando `FsmBadge` ou variantes existentes) · Valor (text-right, `text-emerald-600` entrada / `text-destructive` saída — via classes semânticas; conferir tokens existentes).
- `EmptyState` "Nenhuma movimentação hoje".

### Tab "Contagem de caixa"
- Card "Registrar contagem":
  - `Select` Conta · `Input` "Valor contado (R$)" (number) · `RadioGroup` Resolução (Com ajuste / Sem ajuste) · `Textarea` Observações · `Button` "Registrar" → `toast.success("Contagem registrada")` + reset.
- Tabela histórico: Data/Hora · Conta · Esperado · Contado · Divergência (verde 0 / vermelho <0 / âmbar >0 via classes utilitárias semânticas) · Resolução (badge) · Registrado por.
- `EmptyState` "Nenhuma contagem registrada".

**Estados (ambas as tabs):** `Skeleton` · `ErrorState` retry · dados.

**Mock** (em `fase-reskin.ts`)
- `mockCashMovements`: 8 entradas + 2 saídas; saldo computado R$ 1.240,00.
- `mockCashCounts`: 3 registros com divergências (0, negativa, positiva).
- `mockAccounts`: 2-3 contas (Caixa principal, Cofre, etc.).
- Helpers: `fetchCashMovements()`, `fetchCashCounts()`, `fetchAccounts()`.

## Padrões de implementação
- Importar `PageHeader`, `Skeleton`, `ErrorState`, `EmptyState`, `FsmBadge`/`AppointmentBadge` dos componentes existentes.
- Filtros em estado local (sem URL params nesta fase).
- Lucide 16/1.5, sem hex chapado, sem emojis.
- `createFileRoute` correto: `/_authenticated/operacoes/` e `/_authenticated/caixa`.
- `routeTree.gen.ts` é regenerado pelo plugin — não editar à mão.

## Fora de escopo
- Sidebar (já contém ambas as entradas).
- Backend, persistência, paginação real.
- Tela `/operacoes/$id` (já existe).
