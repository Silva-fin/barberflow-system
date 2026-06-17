## Atalhos de preview na landing

Adicionar atalhos para as 3 páginas públicas em `src/routes/index.tsx`, logo abaixo do botão "Acessar painel" no hero.

### UI

Dentro de `<div className="mt-8 flex flex-wrap gap-3">` (linha 50), manter o botão "Acessar painel" e adicionar 3 botões secundários ao lado, com `target="_blank"` e ícone `ExternalLink`:

- `Store` — Vitrine → `/b/barbearia-paladino`
- `CalendarCheck` — Gerenciar agendamento → `/manage/abc123`
- `Star` — Pesquisa NPS → `/nps/respond/survey-1`

Estilo secundário coerente com o existente: `rounded-md border border-border bg-card px-4 py-3 text-sm hover:bg-muted` (tokens, sem hex hardcoded).

Abaixo dos botões, uma linha pequena `text-xs text-muted-foreground` listando os sufixos determinísticos de mock como dica:
- `manage`: `abc123` ativo · `abc123x` inválido · `abc123d` depósito retido · `abc123r` erro remarcação
- `nps`: `survey-1` normal · `survey-x` indisponível

### Implementação

- Usar `<a href target="_blank" rel="noreferrer">`, não `<Link>`, para abrir em nova aba (essas rotas existem mas o link sair do contexto é desejado).
- Importar ícones extras de `lucide-react`: `Store, CalendarCheck, Star, ExternalLink`.
- Nenhuma outra alteração na landing.

### Arquivos

- `src/routes/index.tsx` — adicionar bloco de atalhos no hero.
