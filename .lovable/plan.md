## Mudanças

### 1) Tornar `PortalSession` acessível no checkout público
- `src/routes/__root.tsx`: envolver os providers atuais com `PortalSessionProvider` (de `@/lib/portal/session`) para que `/b/$slug/checkout` (rota pública) e `/portal/*` compartilhem a mesma sessão de cliente.
- Sem efeitos colaterais: o provider já hidrata de `localStorage` e fica `null` quando deslogado.

### 2) Checkout `/b/$slug/checkout` — step "Seus dados"
Editar `src/routes/b.$slug.checkout.tsx`:

- Ler `usePortalSession()`.
- **Se `session` é `null`** (visitante):
  - No topo do step `customer`, antes do título, adicionar bloco:
    ```
    Já tem conta? [Entrar no Painel do Cliente]
    ── ou continue como visitante ──
    ```
    Botão é um `Link` para `/portal/login?redirect=/b/{slug}/checkout` (variant `outline`, ícone `LogIn`).
  - Manter o formulário atual (nome, telefone, e-mail, observação).
- **Se `session` existe** (logado):
  - Substituir o formulário por um card de confirmação direta:
    ```
    Olá, {session.name}
    {session.phone}
    [Confirmar pedido →]
    ```
  - Pré-preencher `customer` no submit a partir da `session` (nome, telefone, email). Manter campo de "observação" opcional? **Não** — conforme spec, "um botão só, sem formulário".
  - `handleConfirm` usa os dados da sessão.
  - Manter botão "Voltar" para revisão.

### 3) Checkout `/portal/login` — suportar `redirect`
Pequeno ajuste em `src/routes/portal.login.tsx` (e `portal.magic.$token.tsx` se aplicável): após login bem-sucedido, se houver query param `redirect`, navegar para essa URL em vez do dashboard. Permite o ciclo "Entrar" → voltar ao checkout já logado.

### 4) Confirmação `/b/$slug/confirmacao/$id`
Editar `src/routes/b.$slug.confirmacao.$id.tsx`:

- Remover o card "Gerencie seu pedido" (com botão "Abrir gestão" para `order.manage_url`).
- Substituir por um bloco informativo simples (sem botão, sem link):
  ```
  📱 Enviamos o link de gestão para {order.customer.phone}
  ```
  Usar ícone `Smartphone` do lucide, fundo `bg-muted/50`, mesma altura visual do card removido para preservar o grid `sm:grid-cols-2` ao lado de "Crie sua conta no Painel".
- Manter intacto: card "Crie sua conta no Painel", seção "Talvez você goste" (cross-sell pós-checkout), código do pedido, itens, totais, footer.

## Fora de escopo
- Carrinho, drawer, cupom, revisão, Tela 4 cross-sell contextual, atalho "só agendar" e telas `/manage/$token` permanecem inalterados.
- Sem mudanças em `bookingApi.createOrder` nem em `cart.tsx`.

## Validação
- Visitante: `/b/barbearia-do-zeca/checkout` mostra CTA de login + formulário; submit funciona.
- Logado (via `/portal/login`): mesmo checkout mostra "Olá, {nome}" + um botão; submit gera pedido com os dados da sessão.
- Confirmação: card de gestão substituído por linha informativa com o telefone; cross-sell e CTA do painel continuam visíveis.
- `bun run build` limpo.
