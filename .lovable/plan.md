## Visão geral

Frontend completo para um SaaS de barbearias com duas grandes áreas:

1. **Painel administrativo** (autenticado) — gestão diária da barbearia
2. **Página pública de agendamento** (`/b/:slug`) — cliente final marca horário

Construído com dados **mockados** primeiro (camada de serviço isolada), pronto para plugar na sua API REST depois trocando apenas a implementação dos serviços, sem mexer em telas.

## Estrutura de rotas

```
/                          → landing simples do produto + CTA login
/login                     → login do dono/admin da barbearia
/_authenticated/
  /app                     → dashboard (KPIs + agenda do dia)
  /app/agenda              → calendário semanal por barbeiro
  /app/clientes            → lista + ficha do cliente
  /app/barbeiros           → equipe, horários, comissões
  /app/servicos            → catálogo de serviços e preços
  /app/financeiro          → receitas, despesas, relatórios
  /app/configuracoes       → dados da barbearia, slug público
/b/:slug                   → página pública de agendamento (4 passos)
/b/:slug/confirmacao/:id   → tela de sucesso pós-agendamento
```

Cada rota terá `head()` próprio (title, description, og) seguindo SEO.

## Direção visual

Tema escuro premium estilo "ferramenta de barbeiro profissional": fundo quase preto, acentos em âmbar/dourado quente, tipografia display com serifa condensada nos títulos (vibe barbearia clássica) e sans-serif geométrica no corpo. Painel denso à la Linear; agendamento público amplo e direto à la Cal.com.

Tokens em `src/styles.css` (oklch), zero cores hardcoded em componentes.

## Painel administrativo

- **Layout**: sidebar colapsável (shadcn `Sidebar`) + topbar com seletor de barbearia, busca rápida e avatar
- **Dashboard**: 4 KPI cards (faturamento hoje, agendamentos hoje, ticket médio, taxa ocupação), gráfico de receita (recharts), agenda compacta do dia, próximos clientes
- **Agenda**: grid semanal com colunas por barbeiro, slots de 30min, drag-to-create, modal de detalhe/edição
- **Clientes**: tabela (TanStack Table) com busca, filtros, ficha lateral com histórico
- **Barbeiros**: cards com foto, especialidades, horário de trabalho, % comissão
- **Serviços**: lista editável com nome, duração, preço, barbeiros que executam
- **Financeiro**: aba receitas/despesas, gráfico mensal, exportação CSV

## Agendamento público (`/b/:slug`)

Wizard de 4 passos com progresso visível:

1. Escolher serviço (cards com duração + preço)
2. Escolher barbeiro (incluindo opção "qualquer disponível")
3. Escolher data (calendário) + horário (chips de slots)
4. Dados do cliente (nome, telefone, email) + confirmação

Confirmação com resumo + botão para adicionar ao calendário (.ics).

## Arquitetura técnica

- **Camada de dados**: `src/lib/api/` com módulos por recurso (`appointments.ts`, `clients.ts`, `barbers.ts`, `services.ts`, `barbershops.ts`, `auth.ts`). Cada função retorna Promise tipada. Inicialmente lê de `src/lib/mock/` (dados estáticos + delay simulado). Trocar para `fetch()` real depois é só editar o corpo das funções.
- **Auth mock**: `AuthProvider` em contexto, JWT fake em localStorage, guarda `_authenticated` via `beforeLoad` redirect.
- **State server**: TanStack Query para todas as leituras/mutações (já incluído no template).
- **Multi-tenant**: barbearia ativa guardada em contexto + URL (`/b/:slug` público lê do param; painel lê do usuário logado).
- **Forms**: react-hook-form + zod.
- **Datas**: date-fns com locale pt-BR.
- **Toasts**: sonner.

## Detalhes técnicos

- Rotas em `src/routes/` seguindo convenção dot-separated do TanStack
- `_authenticated.tsx` como layout route com guard
- Sidebar usa `useRouterState` para active link
- `defaultPreloadStaleTime: 0` já está configurado
- `oklch` tokens: `--background`, `--foreground`, `--primary` (âmbar), `--accent`, `--muted`, `--card`, etc., com variantes light/dark
- Fontes: import via Google Fonts no `__root.tsx` head links
- Imagens (logo, avatares mock) geradas com `imagegen` em `src/assets/`

## O que fica para depois (quando você passar a API)

- Substituir corpo das funções em `src/lib/api/*` por chamadas `fetch` ao seu backend
- Trocar `AuthProvider` mock pelo fluxo real (login endpoint + bearer token nos headers)
- Mapear schemas reais para os tipos em `src/lib/api/types.ts` (já tipados como contrato)

## Entregáveis desta etapa

- Landing + login + 7 telas do painel + wizard público de agendamento, todos navegáveis e funcionais com mocks
- Design system completo em `styles.css`
- Camada de API isolada e tipada, pronta para conexão real