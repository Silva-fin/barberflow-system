# Portal do Cliente — Plano

Constrói uma área autenticada do cliente final, totalmente separada do painel do operador e das páginas públicas. Tudo mockado, determinístico, mobile-first, com paleta petrol + dourado já existente.

## Arquitetura de rotas

`src/routes/portal.tsx` deixa de ser um shell trivial. Vira o **shell autenticado do portal** com guard próprio (sessão de cliente em `localStorage`, chave `paladino_portal_session`, separada do auth do operador). Sem sessão → redireciona para `/portal/login`.

Novas rotas:

```
src/routes/
  portal-auth.tsx                 layout sem nav (login/magic)
  portal-auth.login.tsx           /portal/login
  portal-auth.magic.$token.tsx    /portal/magic/$token
  portal.tsx                      shell autenticado (guard + nav)
  portal.index.tsx                redireciona /portal → /portal/dashboard
  portal.dashboard.tsx
  portal.historico.tsx
  portal.cotas.tsx
  portal.assinaturas.tsx
  portal.pagamentos.tsx
  portal.consentimentos.tsx
  portal.perfil.tsx
```

Usa rota irmã `portal-auth.*` (não filha de `portal`) para que o guard do `portal.tsx` não bloqueie o login. `/portal/login` e `/portal/magic/...` continuam acessíveis via redireciono no `portal-auth` que mapeia URLs `/portal/login` e `/portal/magic/$token` — alternativa mais simples adotada: usar `portal.login.tsx` e `portal.magic.$token.tsx` como filhos, mas o guard fica em `portal.index` + páginas internas (não no layout). Vou adotar a forma **explícita**: o guard vive dentro de cada página autenticada via um helper `<RequirePortalAuth>` que envolve o conteúdo — assim login/magic ficam livres mesmo sob `/portal/*`.

Arquivos finais:
```
portal.tsx                       (shell mínimo, só <Outlet/>)
portal.login.tsx
portal.magic.$token.tsx
portal.index.tsx                 (redirect → /portal/dashboard)
portal.dashboard.tsx
portal.historico.tsx
portal.cotas.tsx
portal.assinaturas.tsx
portal.pagamentos.tsx
portal.consentimentos.tsx
portal.perfil.tsx
```

## Camada de dados (mock)

`src/lib/portal/` (novo):
- `session.tsx` — `PortalSessionProvider`, `usePortalSession()`, `loginPassword`, `requestMagicLink`, `consumeMagicToken`, `logout`. Storage `paladino_portal_session`. Regras determinísticas:
  - magic link com e-mail terminando em `x@...` → estado "enviado" mas o link gerado é inválido (token termina em `x`).
  - magic token terminando em `x` → erro na landing.
  - senha igual a `errada` → 401 inline.
  - qualquer outro → sucesso, cria sessão `{ id, name, email, phone }`.
- `mock.ts` — agendamentos (próximos + histórico longo para filtros/paginação), cotas (uma ativa cheia, uma quase no fim ~20%, uma expirada, uma zerada), assinaturas (ativa, pausada, uma que não permite pausa), consentimentos agrupados, pagamentos (2 cartões), perfil. Inclui múltiplos estabelecimentos.
- `api.ts` — funções assíncronas com `setTimeout` simulando latência; uma função opcional `simulate401()` para o guard demonstrar expiração (botão "Simular sessão expirada" no menu do usuário, opcional/discreto).

## Shell autenticado

`PortalShell` componente em `src/components/portal/portal-shell.tsx`:
- Sidebar fixa em `md+` (largura ~260px, marca, navegação, rodapé com nome + Sair).
- Bottom nav fixa no mobile com 5 itens principais (Início, Histórico, Cotas, Assinaturas, Perfil) + "Mais" abrindo sheet com Consentimentos e Pagamentos.
- Header mobile com título da seção atual.
- Guard: se `!session`, `<Navigate to="/portal/login" />`.

## Telas (resumo)

- **Login** — card central, tabs "Magic link" / "E-mail e senha". Estados explícitos. Mensagem genérica no sucesso do magic link.
- **Magic landing** — consome token automático, verifica → sucesso (redirect dashboard) ou erro com "Pedir novo link".
- **Dashboard** — duas seções (Próximos agendamentos, Cotas ativas) com skeleton/vazio/erro independentes. Banner opcional de completar perfil.
- **Histórico** — tabela em md+, cards no mobile. Filtros por status e estabelecimento (Select). Paginação 10/página.
- **Cotas** — cards expansíveis com barra colorida (>50% primary, 25–50% neutro, <25% âmbar, 0/expirada vermelha). Histórico de consumo carregado on-expand (skeleton dentro).
- **Assinaturas** — cards com selo, ações Pausar/Cancelar via `Dialog` de confirmação; estado muda inline; assinatura "fidelidade-12m" tem Pausar desabilitado com tooltip.
- **Pagamentos** — aviso "em breve", 1–2 cartões mock, "Remover" inline, "Adicionar" abre Dialog com radios de autorização ("Apenas esta vez" / "Permitir sempre" / "Cancelar").
- **Consentimentos** — Switches agrupados; toggle otimista com revert em "falha" simulada (e-mail marketing falha 1x e reverte). Desligar "Tratamento de dados" mostra card de aviso inline.
- **Perfil** — form (nome, e-mail, telefone com máscara BR). Estado salvar inline sob o botão.

## Componentes UI

Reaproveita shadcn já no projeto: `Card`, `Button`, `Input`, `Label`, `Tabs`, `Dialog`, `Select`, `Switch`, `Progress`, `Badge`, `Skeleton`, `Tooltip`, `Separator`, `RadioGroup`. Selos de status via `Badge` com variantes por tokens (sucesso/atenção/erro/neutro) já definidos em `styles.css`.

## Atalhos na landing

Atualiza `src/routes/index.tsx` (atalho "Painel do cliente") para apontar para `/portal/login` (em vez de `/portal`) e adiciona uma dica curta com os mocks: senha `errada` = 401, e-mail `*x@...` = magic inválido, token `...x` = expirado.

## Detalhes técnicos

- Sessão separada: chave `paladino_portal_session`, contexto `PortalSessionProvider` montado **apenas** sob rotas `/portal/*` (via `portal.tsx`).
- Não toca em `src/lib/auth.tsx` (operador).
- Toda cor por token (`bg-primary`, `text-foreground`, `bg-destructive`, `bg-amber-*` evitado → usa token `--warning` se existir, senão cria em `styles.css`).
- Datas com `Intl.DateTimeFormat('pt-BR')`; valores com `format.ts` existente (ou `Intl.NumberFormat`).
- Sem chamadas reais, sem novas dependências.
