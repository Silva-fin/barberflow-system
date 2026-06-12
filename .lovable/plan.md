## Objetivo

Substituir o bloco `[ícone Sparkles] + texto "NAVALHA"` pela imagem `paladino-wordmark-tight.png` na tela de login e na landing page, garantindo que a logo se adapte bem em mobile, tablet e desktop.

## Mudanças

### 1. `src/routes/login.tsx`
A logo aparece em dois lugares:

- **Painel lateral esquerdo** (visível apenas em `lg:`): hoje é `Sparkles` + "NAVALHA". Trocar por `<img src={paladinoWordmark} />` com altura responsiva `h-10 md:h-12` e `w-auto object-contain brightness-110 contrast-110 drop-shadow-sm`.
- **Formulário (mobile)**: hoje não há logo visível em telas menores que `lg`, ou seja, no celular o usuário não vê nenhuma identidade visual. Adicionar a logo acima do título "Entrar no painel", visível apenas em `<lg` (`lg:hidden`), centralizada, com `h-10 w-auto`.

### 2. `src/routes/index.tsx` (landing)
No `<header>`, trocar `[Sparkles + "NAVALHA"]` por `<img src={paladinoWordmark} />`:

- Altura responsiva: `h-8 sm:h-10` (header compacto).
- `w-auto object-contain brightness-110 contrast-110 drop-shadow-sm`.
- Manter o `<Link to="/">` envolvendo a logo.
- Aplicar padrão responsivo do header: garantir `min-w-0` no container da logo e `shrink-0` nos itens da navegação para que em telas estreitas nada estoure.

### 3. Responsividade do header da landing
O header atual usa `flex items-center justify-between` com nav contendo 3 itens (link demo, theme toggle, botão Entrar). Em viewports muito estreitos (~360px) isso pode quebrar feio. Ajustes:

- Esconder o link "Ver demo de agendamento" em mobile (`hidden sm:inline`), mantendo só `ThemeToggle` + botão "Entrar".
- Reduzir padding do header em mobile (`py-3 sm:py-4`, `px-4 sm:px-6`).

## Arquivos tocados
- `src/routes/login.tsx`
- `src/routes/index.tsx`

Sem mudanças em lógica, dados ou rotas — somente apresentação.
