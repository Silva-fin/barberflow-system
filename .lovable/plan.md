## Objetivo
Tornar a logo Paladino (paladino-wordmark-allcaps) mais visível e adaptável tanto no painel administrativo quanto nas páginas públicas de agendamento.

## Mudanças

### 1. Sidebar do painel (`src/components/app/app-sidebar.tsx`)
- Aumentar a altura da logo de `h-14` para `h-20` (responsivo: `h-16 md:h-20`).
- Remover `max-w-full` que estava limitando o crescimento e usar `w-full object-contain` para preencher o espaço disponível do sidebar.
- Aumentar o padding do `SidebarHeader` para dar respiro (`pt-8 pb-5`).
- Aplicar filtro/brilho leve para destacar em fundos escuros (ex.: `drop-shadow` sutil ou aumentar contraste via `brightness-110`).
- No estado colapsado, manter o "P" mas aumentar para `text-3xl`.

### 2. Header da página pública de agendamento (`src/routes/b.$slug.index.tsx`)
- Aumentar a logo do topo de `h-8` para `h-12` (e `h-14` em telas `md:`).
- Aplicar `object-contain` e `drop-shadow-sm` para destaque.

### 3. Outros pontos de exibição da logo
- Verificar e ajustar nas demais telas (`b.$slug.agendar.tsx`, `b.$slug.confirmacao.$id.tsx`, `login.tsx`, `index.tsx`) para manter consistência visual com tamanho proporcional ao contexto.

### 4. (Opcional) Melhorar contraste
- Se a logo continuar "apagada" por ser PNG com fundo transparente sobre fundo escuro, adicionar uma classe utilitária no `styles.css` (`.logo-bright`) com `filter: brightness(1.15) contrast(1.1)` para realçar.

## Resultado esperado
Logo visivelmente maior e mais nítida no sidebar (ocupando praticamente toda a largura disponível) e no header da página de agendamento, com bom contraste tanto em tema claro quanto escuro.
