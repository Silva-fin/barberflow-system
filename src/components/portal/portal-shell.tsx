import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, LogOut, UserCircle } from "lucide-react";
import { type ReactNode } from "react";
import { Wordmark } from "@/components/app/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePortalSession } from "@/lib/portal/session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompanyChips } from "./company-chips";

export function PortalShell({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const { session, logout } = usePortalSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDashboard = pathname === "/portal/dashboard" || pathname === "/portal";

  const onLogout = () => {
    logout();
    navigate({ to: "/portal/login" });
  };

  const initials =
    session?.name
      ?.split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/portal/dashboard" className="flex items-center gap-2">
            <Wordmark className="text-xl sm:text-2xl" />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-1 grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-xs font-medium hover:border-primary/40">
                {initials}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm">{session?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/portal/perfil" className="flex items-center gap-2">
                    <UserCircle size={14} strokeWidth={1.5} />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onLogout} className="text-destructive">
                  <LogOut size={14} strokeWidth={1.5} />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CompanyChips />
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-4 sm:px-6">
        {!isDashboard && (
          <div className="mb-4 flex items-center gap-2">
            <Link
              to="/portal/dashboard"
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
              Voltar
            </Link>
            {title && (
              <h1 className="font-display text-2xl sm:text-3xl">{title}</h1>
            )}
          </div>
        )}
        {isDashboard && title && (
          <h1 className="mb-4 font-display text-2xl sm:text-3xl">{title}</h1>
        )}
        {children}
      </main>
    </div>
  );
}
