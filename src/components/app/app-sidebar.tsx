import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, Users, UserCog, Scissors, DollarSign, Settings, LogOut, Sparkles } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

const items = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard, exact: true },
  { title: "Agenda", url: "/app/agenda", icon: CalendarDays },
  { title: "Clientes", url: "/app/clientes", icon: Users },
  { title: "Barbeiros", url: "/app/barbeiros", icon: UserCog },
  { title: "Serviços", url: "/app/servicos", icon: Scissors },
  { title: "Financeiro", url: "/app/financeiro", icon: DollarSign },
  { title: "Configurações", url: "/app/configuracoes", icon: Settings },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const isActive = (url: string, exact?: boolean) =>
    exact ? path === url : path === url || path.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/app" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg tracking-wide">NAVALHA</span>
              <span className="text-[10px] text-muted-foreground uppercase">Gestão</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => { logout(); navigate({ to: "/login" }); }}
              tooltip="Sair"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && (
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-xs">{user?.name}</span>
                  <span className="text-[10px] text-muted-foreground">Sair</span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
