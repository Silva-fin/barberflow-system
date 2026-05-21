## 1. Logo Paladino na sidebar

- Copiar `/mnt/documents/paladino-wordmark-allcaps.png` para `src/assets/paladino-wordmark.png`.
- Em `src/components/app/app-sidebar.tsx`, substituir o bloco `<Crown />` + "Navalha" + "Painel · Est. 2018" por `<img src={paladinoWordmark} alt="Paladino" className="h-6 w-auto" />` (latão antigo já embutido na arte, fundo transparente). Manter o comportamento de colapso: no estado `collapsed`, mostrar só um glifo textual `P` em latão (sem o wordmark completo).
- Não trocar nenhum outro texto "Navalha" do app neste passo (header público, rodapé etc.) — fica para uma decisão de rename à parte.

## 2. Refatorar `/b/$slug` no estilo AppBarber

Hoje a página `b.$slug.tsx` já entra direto no stepper de 4 passos. O AppBarber abre primeiro um **perfil da barbearia** e só depois leva ao agendamento. Vamos adotar essa estrutura, mantendo nosso tom fintech minimalista (petróleo + latão, sem cores neon do AppBarber).

### Nova estrutura da rota `/b/$slug` (perfil)

Layout em 2 colunas no desktop, empilhado no mobile:

```text
+--------------------------------------------------+--------------------+
| HERO                                             | INFO LATERAL       |
| [logo 56px] PALADINO (wordmark pequeno topo)     | Localização        |
|                                                  | endereço + mapa    |
| [logo shop 80px]  Nome da Barbearia              |                    |
|                   ★ 5.0 · 128 avaliações         | Horário de         |
|                   [ Agendar agora ]              | atendimento        |
|                                                  | seg-sex / sáb / dom|
| Galeria (1 grande + 3 thumbs, +N imagens)        |                    |
|                                                  | Pagamentos         |
| Tabs: Serviços | Profissionais | Avaliações      | chips             |
|                                                  |                    |
| === Serviços ===                                 | Contato            |
| Lista de cards (1 por linha):                    | telefone + whatsapp|
|   Nome · descrição curta                         |                    |
|   ⏱ 45 min        R$ 50,00      [Agendar]        | Redes sociais      |
|                                                  | ícones             |
+--------------------------------------------------+--------------------+
```

Componentes/decisões:
- Header reaproveita o atual (com `ThemeToggle`), mas troca o ícone `Sparkles` por uma marca textual pequena "PALADINO" (usando o mesmo wordmark) e remove o subtítulo de endereço/telefone do header (vai para a coluna lateral).
- Hero: avatar/logo da barbearia (`shop.logoUrl`, fallback monograma latão), nome em `font-display`, rating em badge dourado, CTA primário "Agendar agora" rolando a página até a seção de serviços.
- Galeria: usar `shop.logoUrl`/imagens mockadas — adicionar campo opcional `photos?: string[]` em `Barbershop` (`src/lib/api/types.ts`) e popular no mock (`src/lib/mock/data.ts`) com 4–8 URLs placeholder; layout 1 grande à esquerda + 3 thumbs à direita + chip "+N imagens".
- Tabs (`@/components/ui/tabs` do shadcn): Serviços (default), Profissionais, Avaliações. Profissionais reaproveita os cards atuais do step 2; Avaliações mostra placeholder ("Em breve") por enquanto.
- Cards de serviço com botão "Agendar" individual que abre o fluxo de agendamento já com `serviceId` pré-selecionado.
- Coluna lateral (sticky no desktop): endereço (com link `maps:`), horários (derivar de `Barber.workStart/workEnd/workingDays` — usar o primeiro barbeiro como referência da barbearia OU adicionar `hours` no tipo `Barbershop`; vamos pelo caminho simples e adicionar `hours: { weekday: number; open: string; close: string }[]` opcional em `Barbershop`), formas de pagamento (chips fixos: Dinheiro, Pix, Crédito, Débito), telefone clicável (`tel:`), redes sociais (placeholders).

### Novo fluxo de agendamento

Mover o stepper atual para uma nova rota dedicada **`/b/$slug/agendar`** (arquivo `src/routes/b.$slug.agendar.tsx`), aceitando query params opcionais `?service=<id>&barber=<id>`. Conteúdo: o stepper atual de 4 passos, sem mudanças funcionais, só com:
- Step 1 (Serviço) pulado automaticamente quando `?service=` vier preenchido.
- Step 2 (Barbeiro) pulado quando `?barber=` vier preenchido.
- Botão "Voltar para a barbearia" no topo voltando a `/b/$slug`.

Botões "Agendar" na página de perfil navegam para `/b/$slug/agendar?service=<id>`; CTA hero "Agendar agora" navega para `/b/$slug/agendar` sem params.

Rota de confirmação `/b/$slug/confirmacao/$id` permanece como está.

### Não muda

- Tipos/mocks de `Service`, `Barber`, `Appointment` continuam iguais (só extensão opcional em `Barbershop`).
- `api.createAppointment` e geração de slots continuam iguais.
- Painel interno (`/app/*`) não é alterado.

## 3. Detalhes técnicos

- Novos arquivos: `src/routes/b.$slug.index.tsx` (perfil — substitui o conteúdo do atual `b.$slug.tsx`) e `src/routes/b.$slug.agendar.tsx` (stepper). O atual `b.$slug.tsx` vira um layout pathless com `<Outlet />` para compartilhar o header — ou, mais simples: deletar `b.$slug.tsx`, transformar `b.$slug.index.tsx` em página standalone e `b.$slug.agendar.tsx` em página standalone, cada uma renderizando o próprio header.
- Vou pelo caminho standalone (sem layout compartilhado) para evitar lidar com regeneração de `routeTree.gen.ts` para layout pathless agora.
- Adicionar shadcn `Tabs` (já existe em `components/ui/tabs.tsx` provavelmente — confirmar antes de instalar).
- Estender `Barbershop` com `rating?: number; reviewsCount?: number; photos?: string[]; hours?: { weekday: number; open: string; close: string }[]` e preencher 1–2 entradas no mock.

## 4. Fora de escopo

- Renomear o produto para "Paladino" em todos os lugares (header público, footer "Powered by Navalha", título da página `/app/agenda`, etc.).
- Login/perfil de cliente, favoritos, pacotes, fidelidade, cookies banner — só o que existe no AppBarber e não temos hoje.
- Avaliações reais (vai ficar placeholder).
