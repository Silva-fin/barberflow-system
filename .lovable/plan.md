## Diagnóstico

A imagem `src/assets/paladino-wordmark.png` já tem resolução grande (1536×1024). O motivo de parecer pequena e apagada é que o PNG tem muito espaço transparente em volta do letreiro — então, ao aplicar `object-contain`, o wordmark encolhe dentro da caixa, deixando margens vazias.

Aumentar o arquivo em pixels não resolve. O caminho certo é **recortar as bordas transparentes** (trim) e/ou **regenerar a arte com mais peso visual**, para que ocupe toda a caixa do sidebar e do header.

## Plano

### 1. Trim das margens transparentes (rápido, sem perder qualidade)
- Gerar `src/assets/paladino-wordmark-tight.png` a partir do PNG atual, removendo todo o padding transparente ao redor do letreiro (ImageMagick `-trim`).
- Trocar o import em:
  - `src/components/app/app-sidebar.tsx`
  - `src/routes/b.$slug.index.tsx`
  - `src/routes/b.$slug.agendar.tsx`
- Resultado: o wordmark passa a ocupar 100% da caixa, ficando visivelmente maior sem alterar nenhum tamanho CSS.

### 2. Reverter os ajustes de CSS exagerados do painel
- No `app-sidebar.tsx`, voltar a logo para uma altura mais sóbria (ex.: `h-12 md:h-14`) já que, depois do trim, ela ocupará todo o espaço.
- Manter `brightness-110 contrast-110 drop-shadow-sm` para destaque em fundos escuros.

### 3. (Opcional) Versão regenerada com mais presença
- Caso o trim ainda não dê o peso visual desejado, gerar uma nova arte do wordmark "PALADINO" em alta resolução, com traços mais grossos e contraste maior, salvando como `src/assets/paladino-wordmark.png` (sobrescreve). Faria isso apenas se você confirmar que prefere essa rota.

## Resultado esperado
Logo nitidamente maior e mais presente no sidebar e no header público, sem precisar inflar as caixas do layout — o ganho vem do recorte do espaço vazio do PNG.
