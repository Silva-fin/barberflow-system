import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarDays, Users, UserCog, Scissors, DollarSign,
  Settings, LogOut, Moon, Sun, ChevronDown,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import paladinoWordmark from "@/assets/paladino-wordmark.png";

type NavItem = { title: string; url: string; icon: typeof LayoutDashboard; exact?: boolean };
const items: NavItem[] = [
  { title: "Painel", url: "/app", icon: LayoutDashboard, exact: true },
  { title: "Agenda", url: "/app/agenda", icon: CalendarDays },
  { title: "Clientes", url: "/app/clientes", icon: Users },
  { title: "Barbeiros", url: "/app/barbeiros", icon: UserCog },
  { title: "Serviços", url: "/app/servicos", icon: Scissors },
  { title: "Financeiro", url: "/app/financeiro", icon: DollarSign },
  { title: "Configurações", url: "/app/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const isActive = (url: string, exact?: boolean) =>
    exact ? path === url : path === url || path.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="pt-6 pb-4">
        <Link to="/app" className="flex items-center justify-center px-2 py-1">
          {collapsed ? (
            <span className="font-display text-2xl text-primary leading-none">P</span>
          ) : (
            <img
              src={paladinoWordmark}
              alt="Paladino"
              className="h-14 w-auto max-w-full object-contain"
            />
          )}
        </Link>
        {!collapsed && <div className="mx-3 mt-4 h-px bg-sidebar-border" />}
      </SidebarHeader>

      <SidebarContent className="px-1">
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] tracking-[0.25em] text-muted-foreground">
              Unidade
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <button
                type="button"
                className="mx-2 mt-1 flex w-[calc(100%-1rem)] items-center justify-between rounded-md border border-sidebar-border bg-sidebar-accent/40 px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent"
              >
                <div className="flex flex-col leading-tight">
                  <span className="font-display text-base">Barbearia do Zeca</span>
                  <span className="text-[11px] text-muted-foreground">São Paulo · SP</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.25em] text-muted-foreground">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items.map((item) => {
                const active = isActive(item.url, item.exact);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="h-10 rounded-md data-[active=true]:bg-sidebar-accent/60"
                    >
                      <Link to={item.url} className="flex items-center justify-between">
                        <span className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 opacity-70" strokeWidth={1.5} />
                          {!collapsed && (
                            <span
                              className={`font-display text-lg ${active ? "italic text-foreground" : "text-sidebar-foreground/85"}`}
                            >
                              {item.title}
                            </span>
                          )}
                        </span>
                        {!collapsed && active && (
                          <span className="mr-1 inline-block h-1.5 w-1.5 rotate-45 bg-primary" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggle} tooltip={theme === "dark" ? "Tema claro" : "Tema escuro"}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {!collapsed && (
                <span className="text-xs text-muted-foreground">
                  {theme === "dark" ? "Tema claro" : "Tema escuro"}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => { logout(); navigate({ to: "/login" }); }}
              tooltip="Sair"
              className="h-12"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent/40 font-display text-sm">
                {user?.name?.split(" ").map(n => n[0]).slice(0,2).join("") || "U"}
              </span>
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <div className="flex flex-col leading-tight text-left">
                    <span className="font-display text-sm">{user?.name}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Mestre · Admin
                    </span>
                  </div>
                  <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
