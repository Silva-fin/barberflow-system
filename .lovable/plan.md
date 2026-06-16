## Sprint Visual Gap — Paladino

Reskin de 9 telas + 1 nova (Relatórios), tudo no padrão visual atual: `PageHeader`, tabelas com moldura `rounded-lg border` + cabeçalho `bg-muted/50`, inputs do kit, `Skeleton`/`ErrorState`/`EmptyState`, toasts sonner, badges via `FsmBadge`, ícones Lucide 16/1.5, cores só por token. Sem novos campos/colunas/ações além dos listados.

---

### 0. Limpeza de rotas legadas (corrige runtime error atual)

Apagar (já têm equivalentes na sidebar):
- `src/routes/_authenticated.app.index.tsx` → equivalente `/dashboard`
- `src/routes/_authenticated.app.barbeiros.tsx` → vira `/profissionais` (2.3)
- `src/routes/_authenticated.app.clientes.tsx` → equivalente `/clientes`
- `src/routes/_authenticated.app.servicos.tsx` → equivalente `/catalogo/servicos`
- `src/routes/_authenticated.app.financeiro.tsx` → equivalente `/financeiro/dre`
- `src/routes/_authenticated.app.configuracoes.tsx` → conteúdo migra p/ `/configuracoes/perfil-empresa` dentro do hub (5.x)

Deixar o plugin do TanStack regerar `routeTree.gen.ts` (fim do erro `Failed to load url _authenticated.app.agenda.tsx`).

---

### 1. Sidebar — ajustes mínimos

Em `src/components/app/app-sidebar.tsx`:
- Grupo **Financeiro** → trocar item `Comissões` leaf por grupo com children: `/comissoes/regras`, `/comissoes/historico`, `/comissoes/pagamentos` (OWNER, ADMIN).
- Mover leaf `Taxas` para dentro de **Configurações** como child `/configuracoes/taxas` (remover do grupo Financeiro).
- Grupo **Administração / Configurações** → adicionar children `Meu Perfil` (`/configuracoes/perfil`), `Segurança` (`/configuracoes/seguranca`), `Taxas` (`/configuracoes/taxas`). Manter `financeiro`, `integracoes`, `modulos`, `branding`.

---

### 2. Operação

**2.1 Agenda** — já feito em `_authenticated.agenda.index.tsx`. Sem alteração.

**2.2 `/agenda/novo` → `_authenticated.agenda.novo.tsx`**
- `PageHeader` "Novo Agendamento" + link "← Voltar".
- `Card` estreito com: `Select` Barbeiro, `Select` Serviço ("Corte — R$ 45 / 30min"), `Input` date, grade de horários (botões 09:00…, selecionado com `border-primary`), `CustomerAutocomplete` + toggle "+ Novo cliente" (sub-form Nome/Tel/E-mail).
- Botões "Voltar" / "Confirmar" (disabled até barbeiro+serviço+cliente+horário).
- Estados: loading inicial `Skeleton`, erro `ErrorState`, sucesso `toast.success("Agendamento criado")`.
- Mocks: 3 barbeiros, 4 serviços, 6 horários, 5 clientes.

**2.3 `/profissionais` → `_authenticated.profissionais.index.tsx`** (titulado "Barbeiros")
- `PageHeader` "Barbeiros" + botão "+ Novo Barbeiro" (`Dialog` com `Input` Nome).
- Grid `sm:grid-cols-2 lg:grid-cols-3` de `Card`: `Avatar` iniciais, nome, horário, chips de especialidades ou "Especialidades em breve", fileira Dom–Sáb (dias ativos `bg-primary/15 text-primary`), comissão "45%" ou "Em breve", botões "Editar"/"Ativar/Desativar", `ActiveBadge` no topo.
- Estados completos (loading/erro/vazio/dados); toasts ao criar/ativar.
- Mocks: 6 barbeiros, alguns com "Em breve".

---

### 3. Comissões (4 telas, novos arquivos)

**3.1 `/comissoes` → `_authenticated.comissoes.index.tsx`** — hub
- `PageHeader` "Comissões" + descrição.
- 3 KPI cards: A pagar `R$ 1.240,00`, Pago 30d `R$ 3.880,00`, Profissionais com pendência `4`.
- 3 cards-link (ícone `bg-primary/15 text-primary` + título display + descrição + chevron): Regras, Histórico, Pagamentos.

**3.2 `/comissoes/regras` → `_authenticated.comissoes.regras.tsx`**
- `PageHeader` "Regras de comissão".
- `Card` Regra geral: `Select` base, `Input` taxa, `Select` quem paga, botão "Salvar" → toast.
- `Card` Regras específicas: botão "+ Nova regra" (abre `Dialog`) + tabela padrão (Profissional/Serviço/Base/Taxa/Quem paga/Ações). Excluir via `AlertDialog` → toast.
- Estados: acesso restrito `EmptyState` cadeado / loading / erro / vazio (linha "Nenhuma regra específica cadastrada").
- Mock: geral 40% + barbearia paga; 3 regras específicas.

**3.3 `/comissoes/historico` → `_authenticated.comissoes.historico.tsx`**
- `PageHeader`. `Card` filtros (Profissional/Status/Data De/Até + botão Filtrar).
- Tabela padrão: Data, Profissional, Tipo, Valor bruto (dir), Comissão (dir), Status via novo `CommissionBadge`.
- Rodapé "Total pendente: R$ 620,00". Estados completos.
- Mock: ~10 linhas mistas.

**3.4 `/comissoes/pagamentos` → `_authenticated.comissoes.pagamentos.tsx`**
- `PageHeader`. `Card` Registrar: `Select` barbeiro → lista compacta de pendências + "Total a pagar" + `Select` conta + botão "Pagar R$ X em comissões" → toast.
- Tabela histórico: Data/Profissional/Comissões pagas/Valor (dir)/Status via novo `PayoutBadge`.
- Estados completos; mock 3 barbeiros, 4 pendências (R$ 380,00), 5 payouts.

---

### 4. Financeiro

**4.1 `/configuracoes/taxas` → `_authenticated.configuracoes.taxas.tsx`**
- `PageHeader` "Taxas de maquininha".
- `Card` tabela editável: Método / Taxa(%) / Fixa(R$) / Ações. `Input` numérico por célula + botão Salvar por linha → toast. "Dinheiro" não-editável ("0% — sem taxa", "—"). Não configurado = hint `text-muted-foreground`.
- Estados: restrito/loading/erro. Mock 8 métodos.

**4.2 `/pagamentos/novo` → `_authenticated.pagamentos.novo.tsx`**
- `PageHeader` "Registrar Pagamento" + link voltar.
- Form em `Card` com 3 fases (estado local `form` | `submitting` | `done`):
  - **form**: `CustomerAutocomplete`, `Select` agendamento (após cliente), `MoneyInput` valor (mostra "R$ 1.234,00"), método em grupos (Dinheiro/PIX/Maquininha) — botões com ícone, selecionado `border-primary`. Botão "Confirmar pagamento".
  - **submitting**: card com spinner "Registrando pagamento…".
  - **done**: card sucesso (ícone check `text-success`), Valor líquido `R$ 96,30`, Taxa `R$ 3,70`, Método "Crédito Visa". Se método sem taxa configurada, banner aviso com ação "Configurar" linkando `/configuracoes/taxas`. Botões "Novo pagamento" / "Ver lista".
- Restrito = `EmptyState`; erro submit = toast.error.

---

### 5. Conta e Configurações

**5.1 `/configuracoes` (hub) → `_authenticated.configuracoes.index.tsx`**
- `PageHeader` "Configurações".
- Grid de cards-link: Meu Perfil, Perfil da empresa (rota `/configuracoes/financeiro` reaproveitada como "perfil empresa" — vou criar `/configuracoes/perfil-empresa` se ainda não existe? **Não**: o protótipo já tem `configuracoes.financeiro/integracoes/modulos/branding`. Apenas adicionar Meu Perfil e Segurança), Segurança, Usuários (`/usuarios`), Integrações, Comunicação (`/comunicacao`), Taxas. Sem estados de carga.

**5.2 `/configuracoes/perfil` → `_authenticated.configuracoes.perfil.tsx`**
- `PageHeader` "Meu Perfil". `Card`: `Input` Nome editável, `Input` E-mail read-only com nota, `Badge` papel, botão "Salvar" (disabled se sem mudança).
- Salvar → `toast.success`; mock "Carlos Mendes", "carlos@barbearia.com", "Proprietário".

**5.3 `/configuracoes/seguranca` → `_authenticated.configuracoes.seguranca.tsx`**
- `PageHeader` "Segurança". `Card`: senha atual, nova (hint), confirmar (validação inline). Botão "Alterar senha" → toast ou box `border-success/40 bg-success/15`.

---

### 6. `/relatorios` → `_authenticated.relatorios.tsx` (tela nova)

- `PageHeader` "Relatórios".
- Grid de 6 cards-link ativos (ícone em `bg-primary/15 text-primary`): DRE (`/financeiro/dre`, BarChart3), Comissões (`/comissoes`, Percent), NPS (`/nps`, Star), Estoque (`/estoque`, Boxes), Auditoria (`/audit`, ShieldCheck), CRM (`/crm`, Users).
- Grid "Em breve" (opacity reduzida, `cursor-default`, badge "Em breve"): Fluxo de caixa, Performance por profissional, Agendamentos por período.

---

### 7. Componentes / utilitários a criar

Em `src/components/app/fsm-badge.tsx`, adicionar:
- `CommissionBadge` (`PENDING` âmbar, `DUE_SOON` sky, `PAID` emerald, `REFUNDED` destructive).
- `PayoutBadge` (`PAID` emerald, `PENDING` âmbar, `FAILED` destructive).

Em `src/lib/mock/`, criar `fase-reskin.ts` exportando mocks tipados (barbeiros, serviços, horários, regras, histórico, pagamentos, taxas, perfil) — todos via `Promise.resolve(...)` para preservar ciclo loading/erro/vazio.

---

### 8. Detalhes técnicos

- Sem mudanças no backend; nenhum schema novo.
- `routeTree.gen.ts` é regerado pelo plugin do TanStack após criar/remover rotas.
- Manter Cormorant/Inter, paleta petrol+brass, sem hex chapados.
- Após mudanças, validar via preview que `/agenda` segue intacto e o erro de import legado some.
