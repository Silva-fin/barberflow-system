import { useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { LogOut, ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { RoleDevSelector } from "@/components/app/role-dev-selector";
import { useAuth, ROLE_LABELS } from "@/lib/auth";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  agenda: "Agenda",
  operacoes: "Operações",
  fila: "Fila",
  inbox: "Atendimento humano",
  clientes: "Clientes",
  comunicacao: "Comunicação",
  catalogo: "Catálogo",
  servicos: "Serviços",
  produtos: "Produtos",
  categorias: "Categorias",
  pacotes: "Pacotes / Assinaturas",
  promocoes: "Promoções",
  pagamentos: "Pagamentos",
  financeiro: "Gestão Financeira",
  despesas: "Despesas",
  estoque: "Estoque",
  payables: "Payables",
  comissoes: "Comissões",
  extrato: "Extrato",
  taxas: "Taxas",
  caixa: "Caixa",
  profissionais: "Profissionais",
  usuarios: "Usuários e acessos",
  configuracoes: "Configurações",
  relatorios: "Relatórios",
  audit: "Auditoria",
  app: "Operação",
  barbeiros: "Barbeiros",
};

function initials(name?: string) {
  if (!name) return "U";
  return name.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function AppHeader({ tenantName = "Barbearia do Zeca" }: { tenantName?: string }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, idx) => ({
    label: SEGMENT_LABELS[seg] ?? seg.replace(/-/g, " "),
    href: "/" + segments.slice(0, idx + 1).join("/"),
    last: idx === segments.length - 1,
  }));

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 md:px-6">
        <SidebarTrigger className="h-8 w-8" />
        <div className="hidden h-6 w-px bg-border md:block" />
        <div className="hidden flex-col leading-tight md:flex">
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Tenant
          </span>
          <span className="font-display text-sm">{tenantName}</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden lg:block">
            <RoleDevSelector />
          </div>
          <ThemeToggle />
          <div className="hidden h-6 w-px bg-border sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex flex-col items-end leading-tight">
              <span className="text-sm font-medium">{user?.name ?? "Convidado"}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {ROLE_LABELS[role]}
              </span>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-sidebar text-sidebar-primary font-display text-sm">
              {initials(user?.name)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sair"
            onClick={() => { logout(); navigate({ to: "/" }); }}
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* Mobile role selector row */}
      <div className="flex items-center justify-end gap-2 px-4 pb-2 lg:hidden">
        <RoleDevSelector />
      </div>

      {crumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 text-xs text-muted-foreground md:px-6"
        >
          <Link to="/dashboard" className="hover:text-foreground">Início</Link>
          {crumbs.map((c) => (
            <span key={c.href} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
              {c.last ? (
                <span className="text-foreground">{c.label}</span>
              ) : (
                <span>{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
    </header>
  );
}