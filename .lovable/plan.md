
# Usar o backend como base do design

## Resposta direta

Sim, é totalmente viável — e é, na verdade, o melhor caminho. Como você tem OpenAPI/Swagger, conseguimos extrair entidades, campos, enums, roles e fluxos direto da spec e usar isso como contrato para desenhar todas as telas. Como você prefere esperar o backend ficar pronto para plugar de verdade, o trabalho de design fica em cima de **mocks tipados que espelham 1:1 o contrato da API**. Quando a API subir, a troca é mecânica: substituir a camada de fetch, sem mexer em telas.

## Como vai funcionar

```text
OpenAPI (sua spec)
        │
        ▼
Tipos TS + camada de API (gerados / espelhados)
        │
        ▼
Mocks fiéis ao contrato  ──►  Telas, rotas, permissões
                                       │
                  (quando o backend subir)
                                       ▼
                         Camada de fetch real (sem mudar telas)
```

## O que eu preciso de você

1. **OpenAPI/Swagger** (arquivo `.json`/`.yaml` ou URL pública). Sem isso o design vira chute.
2. **Mapa de roles por painel**, mesmo que provisório:
   - Plataforma: admin, dono, suporte
   - Barbearia: dono, admin, barbeiro, operador/recepcionista
   - Cliente final: cliente
3. **Matriz de permissões** (o que cada role vê/faz). Posso propor uma matriz inicial a partir da spec e você corrige.

## Escopo de design

### 1. Painel da Plataforma (`/admin/*`)
Gestão de barbearias, planos, financeiro da plataforma, suporte, métricas globais, gestão de usuários internos. Sub-roles: admin, dono, suporte.

### 2. Painel da Barbearia (`/app/*` — já existe, será refeito)
Agenda, barbeiros, serviços, clientes, financeiro, configurações. Sub-roles: dono, admin, barbeiro, operador/recepcionista — com navegação e ações condicionadas à role.

### 3. Painel do Cliente Final (`/me/*`)
Meus agendamentos, histórico, barbearias favoritas, perfil, métodos de pagamento.

### 4. Páginas públicas da barbearia (`/b/:slug/*` — já existe)
Vitrine, agendamento, confirmação. Refinar consistência com o novo sistema visual.

### 5. Landing + Auth
Landing institucional (a criar) e telas de login/cadastro por público (barbearia, cliente, plataforma).

## Plano de execução (em etapas)

**Etapa 0 — Spec e tipos** (faço ao receber o OpenAPI)
- Salvar a spec em `docs/openapi.yaml`.
- Gerar/espelhar tipos em `src/lib/api/types.ts` a partir da spec.
- Refatorar `src/lib/api/index.ts` para um cliente fetch tipado com:
  - implementação atual = mocks (mantém preview funcionando)
  - flag/env para futura troca pelo cliente HTTP real
- Definir enums de roles e helper `can(role, action)`.

**Etapa 1 — IA / arquitetura de rotas e roles**
- Nova estrutura de rotas no TanStack Router:
  - `/_authenticated/admin/*` (Plataforma)
  - `/_authenticated/app/*` (Barbearia)
  - `/_authenticated/me/*` (Cliente)
  - `/b/$slug/*` (público)
  - `/`, `/login`, `/cadastro`
- Guards por role em `beforeLoad`.
- Layouts/sidebars dedicadas por painel.

**Etapa 2 — Sistema visual**
- Consolidar tokens em `src/styles.css` (já temos petrol + brass).
- Componentes base: AppShell, PageHeader, DataTable, EmptyState, StatCard, FilterBar, RoleBadge.
- Padronizar densidade, tipografia e estados (loading/empty/error) em todas as telas.

**Etapa 3 — Telas por painel**
- Barbearia: redesenho das telas existentes + variações por role.
- Plataforma: telas novas (barbearias, planos, suporte, métricas).
- Cliente: telas novas (meus agendamentos, perfil).
- Públicas: refino visual.
- Landing: hero, features, planos, depoimentos, CTA.

**Etapa 4 — Plug do backend real** (quando você liberar)
- Trocar a implementação de `src/lib/api/index.ts` por chamadas HTTP reais.
- Configurar `VITE_API_BASE_URL` e auth (JWT/cookie — depende da sua spec).
- Tratar CORS, refresh de token e erros padronizados.
- Manter mocks como fallback de dev (`VITE_USE_MOCKS=true`).

## Riscos / pontos de atenção

- **Sem OpenAPI, tudo vira suposição** — telas terão que ser refeitas quando o contrato real chegar.
- **Roles ainda em definição**: vou propor uma matriz inicial; mudanças depois custam pouco se a camada `can()` estiver centralizada.
- **Auth**: precisamos saber se o backend usa JWT, cookie de sessão, OAuth, etc. — afeta login e guards.
- **Multi-tenant**: como a API identifica a barbearia atual (subdomínio, header, path)? Isso muda rotas e cliente HTTP.

## Detalhes técnicos

- Tipos gerados via `openapi-typescript` (preferido) ou escritos à mão a partir da spec.
- Cliente HTTP em `src/lib/api/http.ts` com `fetch` tipado + interceptors para auth e erros.
- Mocks vivem em `src/lib/mock/*` e implementam a mesma interface do cliente real, permitindo troca via flag.
- Roles num enum `AppRole` + helper `can()`; nunca checar role espalhado pelas telas.
- Rotas protegidas via `beforeLoad` lendo contexto de auth (já é o padrão do template).

## Próximos passos

1. Você me manda o OpenAPI (cola aqui ou anexa o arquivo).
2. Eu confirmo a matriz de roles/permissões inicial.
3. Implemento a Etapa 0 + Etapa 1 e te mostro a nova arquitetura antes de começar o redesign das telas.
