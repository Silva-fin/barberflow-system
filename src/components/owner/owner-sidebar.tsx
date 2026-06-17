import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Building2, KeyRound, Activity, Settings as SettingsIcon, ScrollText, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Wordmark } from "@/components/app/wordmark";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/owner/tenants",       label: "Tenants",        icon: Building2 },
  { to: "/owner/impersonation", label: "Impersonation",  icon: KeyRound },
  { to: "/owner/sistema",       label: "Sistema",        icon: Activity },
  { to: "/owner/settings",      label: "Configurações",  icon: SettingsIcon },
  { to: "/owner/audit",         label: "Auditoria",      icon: ScrollText },
] as const;

export function OwnerSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="border-b border-border px-5 py-5">
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Plataforma</p>
        <div className="mt-1">
          <Wordmark />
        </div>
      </div>
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-border px-3 py-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
