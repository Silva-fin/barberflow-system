Adicionar um atalho **"Painel da plataforma"** na landing (`src/routes/index.tsx`), no mesmo grupo dos outros (Vitrine, Gerenciar agendamento, NPS, Painel do cliente), apontando para `/owner` (que já redireciona para `/owner/tenants`).

Detalhes:

- Ícone Lucide `ShieldCheck` (coerente com a natureza "plataforma/admin"), 16px stroke 1.5.
- Mesmo estilo dos outros cards-de-atalho: `border border-border bg-card`, `ExternalLink` em `text-muted-foreground`, `target="_blank"`.
- Texto: "Painel da plataforma".
- Adicionar uma linha no bloco de dicas (`mt-4 space-y-1`):
  `platform:` requer login com role `PLATFORM_OWNER` (seletor de role no /login).

Sem outras alterações. Não toca nenhum arquivo do shell do owner.
