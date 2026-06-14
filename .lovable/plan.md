
# Fase 0 — Shell do Paladino

Implementar apenas o **shell visual e estrutural** da plataforma multi-tenant. Sem CRUDs, sem formulários, sem chamadas reais de API. Stack: TanStack Start (equivalente ao App Router do brief) + shadcn/ui + Tailwind + Lucide + Cormorant/Inter.

## Mapeamento Next.js → TanStack

```text
(dashboard)/layout.tsx     →  src/routes/_authenticated.tsx
(dashboard)/dashboard/page →  src/routes/_authenticated.dashboard.tsx
(owner)/layout.tsx         →  src/routes/_owner.tsx
(owner)/index              →  src/routes/_owner.index.tsx (placeholder)
(portal)/layout.tsx        →  src/routes/_portal.tsx
(auth) login               →  src/routes/login.tsx (já existe, rebrand)
NEXT_PUBLIC_DEV_MODE       →  import.meta.env.DEV
```

As rotas existentes do app de barbearia (`_authenticated.app.*`) ficam temporariamente acessíveis até a Fase 1 redesenhar as telas — não são removidas agora.

## 1. Rebrand Navalha → Paladino

- `src/routes/__root.tsx`: title, meta description, OG.
- `src/lib/theme.tsx`: storage key `paladino-theme`.
- `src/lib/auth.tsx`: storage key `paladino_auth`.
- Wordmark Cormorant Garamond renderizado em CSS puro (texto "PALADINO" tracking largo, brass), substituindo `paladino-wordmark-tight.png` no sidebar e no header. Sem nova imagem nesta fase.
- Login: copy + wordmark.

## 2. Tokens & tipografia

`src/styles.css` já tem petrol + brass + Cormorant + Inter. Ajustes:
- Confirmar `--font-display: "Cormorant Garamond"` aplicado em `h1/h2/h3` via `@layer base`.
- Confirmar `--background: #faf9f5`, `--primary: #16242c`, `--sidebar-primary: #c79a5a` (mapear se nomes divergirem).
- Adicionar utilitário `.nav-active-marker` se preciso (sufixo ◆ accent).

## 3. Auth + Role (sem backend)

`src/lib/auth.tsx` ganha:
- `role: "OWNER" | "ADMIN" | "OPERATOR" | "PROFESSIONAL" | "PLATFORM_OWNER"`
- `setRole(role)` para o seletor dev
- `ROLE_LABELS` exportado
- Estado inicial: `OWNER`, persistido em `localStorage("dev_role")` quando em dev
- `useAuth()` continua expondo `user`, `login`, `logout`

Tipos centralizados em `src/lib/auth.tsx` (sem nova camada de API — explícito no brief: "Não implemente chamadas de API").

## 4. Branding via CSS vars

`src/lib/branding.tsx` — provider client-only que:
- Lê branding mock hardcoded: `{ primary: "#16242c", accent: "#c79a5a", logoText: "PALADINO", fontDisplay: "Cormorant Garamond" }`
- Injeta como CSS vars em `:root` via `useEffect` (não bloqueia render)
- Exposto para a Fase 1 trocar pela leitura real de `/tenant/branding`

Montado dentro de `_authenticated.tsx`.

## 5. Sidebar role-aware

Reescrever `src/components/app/app-sidebar.tsx`:

**Estrutura**:
- Mantém `collapsible="icon"` (w-60 ↔ w-16, transição, persistido) e drawer no mobile (já existe via `SidebarProvider`).
- Wordmark "PALADINO" em Cormorant brass quando expandido, "P" quando colapsado.
- Grupos com header `text-[10px] uppercase tracking-[0.25em] text-muted-foreground` (some no collapsed).
- Item ativo: `italic` + sufixo `◆` em `text-sidebar-primary`.
- Ícones Lucide `size={16}` `strokeWidth={1.5}`.

**Filtro por role** — definição declarativa:

```ts
type NavItem = { title: string; url: string; icon: Icon; roles: Role[] };
type NavGroup = { label: string; items: NavItem[] };
const NAV: NavGroup[] = [
  { label: "Operação", items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ALL },
      { title: "Agenda", url: "/agenda", icon: Calendar, roles: ALL },
      { title: "Operações", url: "/operacoes", icon: ClipboardList, roles: ALL },
      { title: "Fila", url: "/fila", icon: ListOrdered, roles: ["OWNER","ADMIN","OPERATOR"] },
      { title: "Atendimento humano", url: "/inbox", icon: MessageSquare, roles: ["OWNER","ADMIN","OPERATOR"] },
  ]},
  { label: "Relacionamento", items: [...] },
  { label: "Comercial", items: [...] },
  { label: "Financeiro", items: [...] },
  { label: "Administração", items: [...] },
];
```

Aplicado: OWNER/ADMIN veem tudo; OPERATOR vê Operação + Clientes + Catálogo (view) + Pagamentos + Caixa; PROFESSIONAL vê Dashboard + Agenda + Operações + Clientes (view) + Extrato comissões. Grupos vazios após o filtro não renderizam.

Submenus (Catálogo, Gestão Financeira) renderizados via `Collapsible` do shadcn dentro do `SidebarMenuItem`.

## 6. Header

`src/components/app/app-header.tsx` (novo), montado em `_authenticated.tsx`:

```text
[hamburguer mobile · SidebarTrigger desktop]  [Wordmark Paladino]  [Tenant: "Barbearia do Zeca"]   ········   [tema] [avatar+role] [sair]
                                                                                                              [RoleDevSelector — só em dev, abaixo do avatar]
```

- Tenant: hardcoded `"Barbearia do Zeca"` por enquanto.
- Avatar = iniciais do `user.name` em pill petrol + brass; label role via `ROLE_LABELS[role]`.
- Tema: usa `ThemeToggle` existente.
- Sair: `useAuth().logout()` → `navigate({ to: "/login" })`.
- Breadcrumbs derivados do `pathname` (mapa estático título-por-segmento) numa linha abaixo do header.

## 7. RoleDevSelector

`src/components/app/role-dev-selector.tsx`:
- Renderizado apenas quando `import.meta.env.DEV === true`.
- Select shadcn minimalista (`text-xs`), label "Role:" em `text-muted-foreground`.
- Opções: OWNER · ADMIN · OPERATOR · PROFESSIONAL.
- `onValueChange` → `setRole()` → persiste em `localStorage("dev_role")` → sidebar e dashboard reagem via context (sem reload).

## 8. Guards

`_authenticated.tsx` (já existe, ajustar):
- Aguarda `hydrated` antes de checar `isAuthenticated` (evita loop login↔dashboard).
- Não autenticado → `redirect({ to: "/login" })`.
- `beforeLoad` para PROFESSIONAL em `/financeiro/*` → redirect `/dashboard`.

`_owner.tsx` (novo):
- `beforeLoad` exige `role === "PLATFORM_OWNER"`; senão redirect `/dashboard`.
- Shell vazio com `<Outlet />`.

`_portal.tsx` (novo):
- Shell sem sidebar tenant, só `<Outlet />` + header mínimo.

## 9. Dashboard role-aware (mockado)

`src/routes/_authenticated.dashboard.tsx`:

Renderiza variantes condicionadas a `role`. Dados **hardcoded inline** no componente (sem camada mock).

**OWNER/ADMIN**:
- KPI strip: 3 cards (Agendamentos hoje · Faturamento mês · Ocupação %).
- Gráfico Receita × Despesa × Margem: barras CSS estáticas (sem lib de chart nesta fase).
- Alertas (lista): "3 pagamentos a confirmar", "2 itens com estoque baixo", "Promoção XPTO expira em 2 dias".
- Pendências: "2 payables vencendo", "Conciliação de caixa pendente".
- CRM clientes em risco: 3 nomes mockados.

**OPERATOR**:
- Agenda do dia (lista mock), Fila (mock), Atendimento humano (badge), Cobranças pendentes, Caixa do dia.

**PROFESSIONAL**:
- Próximos atendimentos próprios, ações rápidas (Iniciar atendimento, Marcar pausa), Extrato de comissões próprias.

Todos os blocos usam `Card`, `formatBRL`, `formatDateTime` (já existem em `src/lib/format.ts`), ícones Lucide.

## 10. Login

Atualizar `src/routes/login.tsx`:
- Wordmark Paladino + copy nova.
- Mantém o fluxo mock atual (`auth.login(email, password)` → `/dashboard`).
- Em dev, atalhos para entrar como cada role (botões discretos abaixo do form).

## Detalhes técnicos

- **Sem nova lib**. Tudo com pacotes já instalados (shadcn, lucide-react, tailwind).
- Brand colors injetados via `useEffect` (não SSR) para evitar mismatch.
- `import.meta.env.DEV` no lugar de `process.env.NODE_ENV === "development"`.
- Storage keys padronizadas (`paladino_*`, `dev_role`).
- Nenhum arquivo gerado (`routeTree.gen.ts`) é editado manualmente — o plugin regenera.
- Rotas legadas `_authenticated.app.*` ficam intocadas; o brief é só Fase 0.

## Arquivos

**Novos**: `_authenticated.dashboard.tsx`, `_owner.tsx`, `_owner.index.tsx`, `_portal.tsx`, `app-header.tsx`, `role-dev-selector.tsx`, `branding.tsx`.

**Editados**: `__root.tsx` (meta), `_authenticated.tsx` (header + branding + guards), `app-sidebar.tsx` (rebrand + grupos + roles + submenus), `auth.tsx` (role + setRole + ROLE_LABELS), `theme.tsx` (storage key), `login.tsx` (rebrand + atalhos de role em dev), `styles.css` (verificar tokens).

## O que NÃO entra nesta fase

- Camada `src/lib/api/*` ou mocks tipados (explícito no brief).
- CRUDs, formulários, telas internas de Agenda, Clientes, Catálogo, Financeiro.
- Wordmark como imagem nova (texto Cormorant resolve).
- Integração real com `/tenant/branding` ou `/companies/me`.
- Mudanças nas rotas públicas `b.$slug.*`.

## Próximos passos após aprovar

1. Confirmo plano → entro em build.
2. Implemento arquivos em paralelo.
3. Valido visualmente as 4 roles via seletor dev.
4. Reporto e aguardo Fase 1 (camada de API tipada quando OpenAPI chegar).
