import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home,
  History,
  Ticket,
  Repeat,
  ShieldCheck,
  CreditCard,
  UserCircle,
  LogOut,
  MoreHorizontal,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Wordmark } from "@/components/app/wordmark";
import { usePortalSession } from "@/lib/portal/session";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
}

const PRIMARY: NavItem[] = [
  { to: "/portal/dashboard", label: "Início", icon: Home },
  { to: "/portal/historico", label: "Histórico", icon: History },
  { to: "/portal/cotas", label: "Cotas", icon: Ticket },
  { to: "/portal/assinaturas", label: "Assinaturas", icon: Repeat },
  { to: "/portal/perfil", label: "Perfil", icon: UserCircle },
];

const SECONDARY: NavItem[] = [
  { to: "/portal/consentimentos", label: "Consentimentos", icon: ShieldCheck },
  { to: "/portal/pagamentos", label: "Pagamentos", icon: CreditCard },
];

const ALL_NAV = [...PRIMARY, ...SECONDARY];

function useCurrentPath() {
  return useRouterState({ select: (s) => s.location.pathname });
}

function NavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon size={16} strokeWidth={1.5} />
      <span>{item.label}</span>
    </Link>
  );
}

export function PortalShell({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const { session, logout } = usePortalSession();
  const navigate = useNavigate();
  const pathname = useCurrentPath();
  const [moreOpen, setMoreOpen] = useState(false);

  const current =
    ALL_NAV.find((n) => pathname === n.to) ??
    ALL_NAV.find((n) => pathname.startsWith(n.to));
  const heading = title ?? current?.label ?? "Portal";

  const onLogout = () => {
    logout();
    navigate({ to: "/portal/login" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="md:flex">
        {/* Sidebar (md+) */}
        <aside className="hidden border-r border-sidebar-border bg-sidebar md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="px-5 py-6">
            <Wordmark />
            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-sidebar-foreground/60">
              Portal do Cliente
            </p>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {PRIMARY.map((n) => (
              <NavLink key={n.to} item={n} active={pathname === n.to} />
            ))}
            <div className="my-2 h-px bg-sidebar-border" />
            {SECONDARY.map((n) => (
              <NavLink key={n.to} item={n} active={pathname === n.to} />
            ))}
          </nav>
          <div className="border-t border-sidebar-border p-3">
            <div className="px-2 py-1.5">
              <p className="truncate text-sm text-sidebar-foreground">
                {session?.name ?? "—"}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {session?.email ?? ""}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut size={16} strokeWidth={1.5} />
              Sair
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 md:pl-64">
          {/* Mobile header */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex min-w-0 items-center gap-2">
              <Wordmark className="text-lg" />
            </div>
            <h1 className="truncate font-display text-base">{heading}</h1>
          </header>

          <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-4 sm:px-6 md:pt-8">
            <div className="hidden md:mb-6 md:block">
              <h1 className="font-display text-3xl">{heading}</h1>
            </div>
            {children}
          </main>

          {/* Bottom nav (mobile) */}
          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden">
            <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
              {PRIMARY.slice(0, 4).map((n) => {
                const Icon = n.icon;
                const active = pathname === n.to;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 py-2 text-[11px]",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    <span>{n.label}</span>
                  </Link>
                );
              })}
              <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
                <SheetTrigger asChild>
                  <button
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 py-2 text-[11px]",
                      "text-muted-foreground",
                    )}
                  >
                    <MoreHorizontal size={18} strokeWidth={1.5} />
                    <span>Mais</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-xl">
                  <SheetHeader>
                    <SheetTitle>Mais</SheetTitle>
                  </SheetHeader>
                  <div className="mt-2 space-y-1">
                    <NavLink
                      item={{ to: "/portal/perfil", label: "Perfil", icon: UserCircle }}
                      active={pathname === "/portal/perfil"}
                      onClick={() => setMoreOpen(false)}
                    />
                    {SECONDARY.map((n) => (
                      <NavLink
                        key={n.to}
                        item={n}
                        active={pathname === n.to}
                        onClick={() => setMoreOpen(false)}
                      />
                    ))}
                    <div className="my-2 h-px bg-border" />
                    <div className="px-3 py-2">
                      <p className="truncate text-sm">{session?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {session?.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setMoreOpen(false);
                        onLogout();
                      }}
                      className="w-full justify-start"
                    >
                      <LogOut size={16} strokeWidth={1.5} />
                      Sair
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}