## Auditoria — Painel Owner

O shell e as 7 telas estão conformes ao spec. Foram encontradas 3 divergências pequenas:

| # | Arquivo | Problema |
|---|---------|----------|
| 1 | `src/components/owner/impersonation-banner.tsx` (17-20) | Countdown em `MM:SS`. Spec pede `HH:MM` (formato relógio: horas:minutos do `expires_at`). |
| 2 | `src/routes/owner.sistema.tsx` (95-96) | Botão "Reenviar" não valida `log_id`/`reason` no cliente — permanece clicável vazio. |
| 3 | `src/routes/owner.impersonation.tsx` (59-64) | `catch { /* ignore */ }` ao carregar tenants do Select — falha silenciosa, sem feedback. |

### Correções

**1. Banner — formato de countdown**
Reler o spec: `"Expira em HH:MM"`. Trocar `formatRemaining` para mostrar o horário de expiração no padrão `HH:MM` (24h, hora:minuto de `expires_at`), mantendo a atualização por segundo só para esconder o banner ao chegar a 0. Texto passa a ser, p.ex., `"Expira em 14:35"`.

**2. /owner/sistema — validação do Reenviar**
Adicionar `const canSubmit = logId.trim().length > 0 && reason.trim().length > 0;` e usar `disabled={redispatching || !canSubmit}`. Mostrar `aria-invalid` nos campos quando o usuário tentar submeter vazio (alinhar com padrão de P2).

**3. /owner/impersonation — erro na lista de tenants**
Substituir o `catch` silencioso por um estado `tenantsError`. Quando setado, mostrar mensagem inline curta abaixo do Select ("Falha ao carregar tenants. Tentar novamente.") com botão de retry que rechama `listTenants()`.

### Não escopo
Nenhuma alteração nos outros 3 shells, nos contratos de mock, em rotas ou em estilos. Sem novos componentes.