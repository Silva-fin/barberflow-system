## Direção

Marca não-literal (sem amarras ao nome "Paladino" nem a barbearia). Conceito: **plataforma confiável que se adapta e evolui**. Tom fintech minimalista — glifo pequeno e preciso + wordmark dominante. Paleta mantida: latão antigo (#C5A059) sobre transparente, pensada para fundo petróleo escuro.

## 3 alternativas (PNG transparente em `/mnt/documents/`)

**1. `paladino-glyph-aperture.png` (1024×1024)**
Glifo abstrato de **abertura/diafragma**: quatro lâminas geométricas idênticas rotacionadas formando um quadrado côncavo no centro. Lê como íris de câmera / módulos que se reconfiguram. Transmite adaptabilidade (mesmo elemento, múltiplos arranjos) e precisão (geometria exata). Estilo Linear/Mercury.

**2. `paladino-glyph-keystone.png` (1024×1024)**
**Pedra-de-fecho** (keystone) abstrata: trapézio sólido coroando duas colunas finas. Símbolo arquitetônico universal de "peça que sustenta o sistema" — confiabilidade pura, com sutil eco heráldico sem ser brasão. Funciona em 16px (favicon) e em 1m (outdoor).

**3. `paladino-lockup.png` (1536×512)**
Lockup horizontal definitivo: glifo escolhido (assumindo keystone como default, ajusto depois) + wordmark **"PALADINO"** em grotesque geométrica moderna (tipo GT America / Inter Display), tracking +120, peso medium. Régua vertical fina de 1px separando. Versão pronta para header, login, assinatura de e-mail.

## QA pós-geração

Inspeção visual de cada PNG: transparência real, contraste em fundo petróleo (#0F2A2E aprox.), legibilidade em escala pequena, ausência de elementos rejeitados (escudo, espada, cruz, coroa, monograma P literal, laurel).

## Pós-aprovação

Apenas geração de imagens. Nenhuma alteração de código. Se aprovar uma, depois faço a integração substituindo o ícone `Crown` em `src/components/app/app-sidebar.tsx`.
