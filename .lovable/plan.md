
# Landing Paladino — inspirada em odoo.com/pt_BR

Nova landing pública em `/` (substitui o hero atual, preserva atalhos de preview em uma seção secundária) com narrativa "todo o seu negócio numa plataforma" + configurador "Monte seu Paladino".

## Referência (Odoo)

- Hero curto e direto com CTA duplo (Comece / Agende demo).
- Grid gigante de "apps" com ícones + nome, cada um linkando para uma página de detalhe.
- Preço único enfatizado ("todos os apps por X").
- Sequências longas com prints/mockups por módulo.
- Prova social (números, logos, eventos, depoimentos).
- CTA final de trial.

Aplicaremos a mesma estrutura à identidade Paladino (dark, dourado, Cormorant), sem copiar visual da Odoo.

## Escopo

### 1. Estrutura de rotas
- `src/routes/index.tsx` — reescrita: nova landing.
- `src/routes/_public.modulos.tsx` — grid completo dos módulos + link para detalhe.
- `src/routes/_public.modulos.$slug.tsx` — página de detalhe por módulo (dinâmica, dados do catálogo).
- `src/routes/_public.montar.tsx` — configurador "Monte seu Paladino" (state em `useState`, sem persistência).
- `src/routes/_public.precos.tsx` — página simples de planos/pricing.
- Atalhos de preview atuais (Vitrine, Manage, NPS, Portal, Painel plataforma) migram para uma seção "Para explorar o protótipo" no rodapé da landing e/ou em `/_public/preview` — mantidos, apenas fora do hero.

Todas as rotas públicas usam o `_public.tsx` (header/footer minimalistas). O `_public` atual usa `max-w-xl`; será relaxado para `max-w-7xl` para acomodar landing/marketing sem quebrar as telas atuais (magic/nps que hoje ficam centralizadas — passamos a controlar largura por rota).

### 2. Catálogo de módulos (fonte única)

Novo arquivo `src/lib/marketing/catalog.ts` com todos os módulos/funções do Paladino já existentes no app, agrupados por categoria. Baseado no que já existe: `MODULE_LABELS` (Estoque, Comissões, Pacotes, Assinaturas, Promoções, CRM, NPS, Fila, Bot WhatsApp, Link público) + capacidades nativas do produto (Agenda, Clientes, Caixa, Financeiro/DRE, Pagamentos, Relatórios, Comunicação, Vitrine, Portal do cliente, Multi-empresa, Painel owner).

Estrutura:
```ts
type ModuleCategory = "core" | "operacao" | "financeiro" | "clientes" | "crescimento" | "plataforma";
type CatalogModule = {
  slug: string; name: string; tagline: string; description: string;
  icon: LucideIcon; category: ModuleCategory;
  core: boolean;              // incluso sempre, não desmarcável no configurador
  features: string[];         // bullets
  screens?: string[];         // rotas do próprio app usadas como "prints" ao vivo (iframe/screenshot)
  dependsOn?: string[];       // slugs
};
```

~20 módulos, todos com dados textuais mock/hardcoded.

### 3. Landing (`/`)

Seções na ordem:
1. **Header sticky** — Wordmark + nav (Módulos · Monte seu Paladino · Preços · Entrar) + ThemeToggle + CTA "Testar grátis".
2. **Hero** — headline em duas linhas ("Sua barbearia inteira / em uma plataforma"), subhead, dois CTAs (Testar grátis → `/login`; Monte seu sistema → `/montar`). Mockup à direita (composição de screenshots existentes ou ilustração ASCII/SVG placeholder — sem geração de imagem AI nesta iteração).
3. **Faixa de números** — 4 stats mock ("+X barbearias", "+Y atendimentos/mês", etc.).
4. **Grid de módulos** — todos os ~20 módulos como cards clicáveis (ícone + nome + tagline). Filtro por categoria via chips. Cada card leva a `/modulos/$slug`.
5. **"Monte seu Paladino"** — teaser: lista compacta com checkbox de 6-8 módulos + CTA "Abrir configurador completo" → `/montar`.
6. **Blocos ilustrados por pilar** (3-4 blocos alternando lado): Agenda + Vitrine, Financeiro completo, CRM + Comunicação, Multi-empresa/Owner. Cada bloco: título grande Cormorant, parágrafo, lista de 3 bullets, botão "Ver módulo".
7. **Prova social** — grid de "depoimentos" mock + logos placeholder.
8. **Preço** — card grande único destacando modelo simples ("Todos os módulos inclusos por R$ X/mês por unidade") + link para `/precos`.
9. **CTA final** — banner escuro com "Comece em minutos" + botão.
10. **Rodapé** — links (Módulos, Preços, Vitrine demo, Portal, Painel plataforma, Painel owner) + copyright. Atalhos de preview vivem aqui.

Layout mobile-first, 12-col em desktop, uso de tokens (`bg-card`, `text-sidebar-primary`, `border-border`).

### 4. Configurador "Monte seu Paladino" (`/montar`)

- Duas colunas em desktop (empilhado no mobile):
  - **Esquerda:** lista de módulos agrupada por categoria. Cada módulo tem checkbox, ícone, nome, tagline, tooltip com descrição. Núcleos vêm marcados e desabilitados. Dependências: ao marcar um módulo com `dependsOn`, os requeridos são marcados automaticamente com badge "adicionado por dependência"; ao desmarcar um requisito, alerta inline lista dependentes que serão desmarcados (confirmação inline, não modal).
  - **Direita (sticky):** resumo — contagem de módulos, lista compacta selecionada, preço estimado calculado (fórmula mock: `base + selecionados * incremento`, tudo hardcoded), CTA "Solicitar essa configuração" → toast + navega para `/login` (ou modal simples "Recebemos sua configuração" com resumo).
- Filtro no topo (busca por texto + chips de categoria).
- Botões "Selecionar recomendado (barbearia solo)" / "(rede)" que aplicam presets.
- Persistência: apenas em memória (por decisão de escopo — nada de localStorage nesta iteração).

### 5. Página de módulo (`/modulos/$slug`)

- Header com ícone + nome + tagline + categoria + botão "Adicionar ao meu Paladino" (leva a `/montar?add=slug` — configurador lê `useSearch` e pré-marca).
- Descrição longa (2-3 parágrafos mock).
- Lista de features (bullets do catálogo).
- Seção "Como fica no produto" — 2-3 links de preview para telas reais do app (`/agenda`, `/caixa`, etc.).
- "Combina com" — outros módulos relacionados (via `dependsOn` reverso).
- CTA duplo (Testar grátis / Monte seu Paladino).
- `head()` por rota: title/description dinâmicos com o nome do módulo.

### 6. Página `/modulos`

Grid completo de todos os módulos com filtro/busca (mesmo componente do teaser da landing).

### 7. Página `/precos`

Uma faixa com plano único (destaque) + FAQ mock + CTA. Simples.

## Detalhes técnicos

- Componentes novos em `src/components/marketing/`:
  - `landing-header.tsx`, `landing-footer.tsx`
  - `hero.tsx`
  - `module-card.tsx`, `module-grid.tsx`, `category-chips.tsx`
  - `pillar-block.tsx` (bloco com título/lista/CTA e slot para mockup)
  - `stat-row.tsx`
  - `testimonial-card.tsx`
  - `configurator/module-checklist.tsx`, `configurator/summary.tsx`, `configurator/preset-buttons.tsx`
- Ícones: `lucide-react` (todos já disponíveis).
- Tipografia: Cormorant Garamond em headings, tokens semânticos existentes.
- Sem imagens novas nesta iteração: mockups do hero e pilares usam composições CSS/SVG inline + capturas de UI simuladas com divs estilizadas (evita dependência de assets). Podemos gerar imagens em iteração futura.
- Cada rota nova define `head()` com title/description específicos.
- `_public.tsx`: substituir `max-w-xl` fixo por container variável — cada página define sua largura; header/footer full-width com container interno.
- Nada muda em rotas autenticadas, portal, owner, storefront ou checkout.

## Validação

- `bun run build` limpo.
- Navegação: landing → módulos → detalhe → configurador com preset via `?add=slug`.
- Preview mobile 375px: grid empilha, hero legível, configurador colapsa em uma coluna com resumo no topo.
- Atalhos de preview (Vitrine, Manage, NPS, Portal, Painel plataforma) continuam acessíveis no rodapé.

## Fora de escopo

- Backend, formulário real de contato, checkout do plano.
- Geração de imagens/mockups por IA.
- i18n (mantém pt-BR).
- Animações complexas — usar transitions Tailwind padrão.
- Persistência da configuração escolhida.
