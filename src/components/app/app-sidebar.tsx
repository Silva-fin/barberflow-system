import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Calendar, ClipboardList, ListOrdered, MessageSquare,
  Users, MessageCircle, HeartHandshake, Scissors, Package, Tags, Boxes,
  Wallet, Landmark, Receipt, Warehouse, HandCoins, FileSpreadsheet, Percent,
  UserCircle, ShieldCheck, Settings, BarChart3, ScrollText,
  ChevronRight, type LucideIcon,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth, type Role } from "@/lib/auth";
import { Wordmark } from "@/components/app/wordmark";

const ALL: Role[] = ["OWNER", "ADMIN", "OPERATOR", "PROFESSIONAL"];

type SubItem = { title: string; url: string; roles: Role[] };
type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: Role[];
  children?: SubItem[];
};
type NavGroup = { label: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    label: "Operação",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ALL },
      { title: "Agenda", url: "/agenda", icon: Calendar, roles: ALL },
      { title: "Operações", url: "/operacoes", icon: ClipboardList, roles: ALL },
      { title: "Fila", url: "/fila", icon: ListOrdered, roles: ["OWNER", "ADMIN", "OPERATOR"] },
      { title: "Atendimento humano", url: "/inbox", icon: MessageSquare, roles: ["OWNER", "ADMIN", "OPERATOR"] },
    ],
  },
  {
    label: "Relacionamento",
    items: [
      { title: "Clientes / CRM", url: "/clientes", icon: Users, roles: ALL },
      { title: "CRM", url: "/crm", icon: HeartHandshake, roles: ["OWNER", "ADMIN"] },
      { title: "Comunicação", url: "/comunicacao", icon: MessageCircle, roles: ["OWNER", "ADMIN"] },
    ],
  },
  {
    label: "Comercial",
    items: [
      {
        title: "Catálogo",
        url: "/catalogo",
        icon: Scissors,
        roles: ["OWNER", "ADMIN", "OPERATOR"],
        children: [
          { title: "Serviços", url: "/catalogo/servicos", roles: ["OWNER", "ADMIN", "OPERATOR"] },
          { title: "Produtos", url: "/catalogo/produtos", roles: ["OWNER", "ADMIN", "OPERATOR"] },
          { title: "Categorias", url: "/catalogo/categorias", roles: ["OWNER", "ADMIN"] },
        ],
      },
      {
        title: "Pacotes",
        url: "/pacotes",
        icon: Package,
        roles: ["OWNER", "ADMIN"],
        children: [
          { title: "Planos", url: "/pacotes", roles: ["OWNER", "ADMIN"] },
          { title: "Compras", url: "/pacotes/compras", roles: ["OWNER", "ADMIN"] },
        ],
      },
      {
        title: "Assinaturas",
        url: "/assinaturas",
        icon: Boxes,
        roles: ["OWNER", "ADMIN"],
        children: [
          { title: "Planos", url: "/assinaturas/planos", roles: ["OWNER", "ADMIN"] },
          { title: "Instâncias", url: "/assinaturas", roles: ["OWNER", "ADMIN"] },
        ],
      },
      { title: "Promoções", url: "/promocoes", icon: Tags, roles: ["OWNER", "ADMIN"] },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { title: "Pagamentos", url: "/pagamentos", icon: Wallet, roles: ["OWNER", "ADMIN", "OPERATOR"] },
      { title: "Caixa", url: "/caixa", icon: Receipt, roles: ["OWNER", "ADMIN", "OPERATOR"] },
      {
        title: "Gestão Financeira",
        url: "/financeiro",
        icon: Landmark,
        roles: ["OWNER", "ADMIN"],
        children: [
          { title: "DRE", url: "/financeiro/dre", roles: ["OWNER", "ADMIN"] },
          { title: "Contas", url: "/financeiro/contas", roles: ["OWNER", "ADMIN"] },
          { title: "Conciliação", url: "/financeiro/conciliacao", roles: ["OWNER", "ADMIN"] },
        ],
      },
      { title: "Despesas", url: "/despesas", icon: FileSpreadsheet, roles: ["OWNER", "ADMIN"] },
      { title: "Estoque / Fornecedores", url: "/estoque", icon: Warehouse, roles: ["OWNER", "ADMIN"] },
      { title: "Payables", url: "/payables", icon: HandCoins, roles: ["OWNER", "ADMIN"] },
      { title: "Comissões", url: "/comissoes", icon: Percent, roles: ["OWNER", "ADMIN"] },
      { title: "Extrato", url: "/extrato", icon: Boxes, roles: ["OWNER", "ADMIN", "PROFESSIONAL"] },
      { title: "Taxas", url: "/taxas", icon: Percent, roles: ["OWNER", "ADMIN"] },
    ],
  },
  {
    label: "Administração",
    items: [
      { title: "Profissionais", url: "/profissionais", icon: UserCircle, roles: ["OWNER", "ADMIN"] },
      { title: "Usuários e acessos", url: "/usuarios", icon: ShieldCheck, roles: ["OWNER", "ADMIN"] },
      { title: "Configurações", url: "/configuracoes", icon: Settings, roles: ["OWNER", "ADMIN"] },
      { title: "Relatórios", url: "/relatorios", icon: BarChart3, roles: ["OWNER", "ADMIN"] },
      { title: "Auditoria", url: "/audit", icon: ScrollText, roles: ["OWNER"] },
    ],
  },
];

function filterByRole(role: Role): NavGroup[] {
  return NAV
    .map((g) => ({
      ...g,
      items: g.items
        .filter((i) => i.roles.includes(role))
        .map((i) => ({
          ...i,
          children: i.children?.filter((c) => c.roles.includes(role)),
        })),
    }))
    .filter((g) => g.items.length > 0);
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { role } = useAuth();

  const groups = filterByRole(role);

  const isActive = (url: string) => path === url || path.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="pt-6 pb-4">
        <Link to="/dashboard" className="flex items-center justify-center px-3 py-1">
          <Wordmark collapsed={collapsed} />
        </Link>
        {!collapsed && <div className="mx-3 mt-3 h-px bg-sidebar-border" />}
      </SidebarHeader>

      <SidebarContent className="px-1">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) =>
                  item.children && item.children.length > 0 ? (
                    <NavGroupItem
                      key={item.url}
                      item={item}
                      collapsed={collapsed}
                      isActive={isActive}
                    />
                  ) : (
                    <NavLeaf
                      key={item.url}
                      item={item}
                      collapsed={collapsed}
                      active={isActive(item.url)}
                    />
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border pt-2">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            v0.1 · Fase 0
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function NavLeaf({
  item, collapsed, active,
}: { item: NavItem; collapsed: boolean; active: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.title}
        className="h-9 rounded-md data-[active=true]:bg-sidebar-accent/60"
      >
        <Link to={item.url} className="flex items-center justify-between">
          <span className="flex items-center gap-3">
            <item.icon size={16} strokeWidth={1.5} className="opacity-80" />
            {!collapsed && (
              <span
                className={
                  active
                    ? "text-sm italic text-foreground"
                    : "text-sm text-sidebar-foreground/85"
                }
              >
                {item.title}
              </span>
            )}
          </span>
          {!collapsed && active && (
            <span className="ml-2 text-sidebar-primary" aria-hidden>◆</span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NavGroupItem({
  item, collapsed, isActive,
}: { item: NavItem; collapsed: boolean; isActive: (url: string) => boolean }) {
  const anyChildActive = item.children?.some((c) => isActive(c.url)) ?? false;
  const [open, setOpen] = useState(anyChildActive);

  // When collapsed, render as flat clickable button to the parent URL
  if (collapsed) {
    return <NavLeaf item={item} collapsed={collapsed} active={anyChildActive || isActive(item.url)} />;
  }

  return (
    <SidebarMenuItem>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className="h-9 rounded-md"
            isActive={anyChildActive}
          >
            <span className="flex items-center gap-3">
              <item.icon size={16} strokeWidth={1.5} className="opacity-80" />
              <span
                className={
                  anyChildActive
                    ? "text-sm italic text-foreground"
                    : "text-sm text-sidebar-foreground/85"
                }
              >
                {item.title}
              </span>
            </span>
            <ChevronRight
              size={14}
              strokeWidth={1.5}
              className={`ml-auto transition-transform ${open ? "rotate-90" : ""}`}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children!.map((c) => {
              const active = isActive(c.url);
              return (
                <SidebarMenuSubItem key={c.url}>
                  <SidebarMenuSubButton asChild isActive={active}>
                    <Link to={c.url} className="flex items-center justify-between">
                      <span
                        className={
                          active
                            ? "text-sm italic text-foreground"
                            : "text-sm text-sidebar-foreground/80"
                        }
                      >
                        {c.title}
                      </span>
                      {active && (
                        <span className="ml-2 text-sidebar-primary" aria-hidden>◆</span>
                      )}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}