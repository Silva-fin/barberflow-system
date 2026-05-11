import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (!auth.isAuthenticated) navigate({ to: "/login" });
  }, [auth.isAuthenticated, navigate]);

  if (!auth.isAuthenticated) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              {pathLabel(path)}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {auth.user?.name?.split(" ").map(n => n[0]).slice(0,2).join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function pathLabel(path: string) {
  if (path === "/app") return "Dashboard";
  if (path.startsWith("/app/agenda")) return "Agenda";
  if (path.startsWith("/app/clientes")) return "Clientes";
  if (path.startsWith("/app/barbeiros")) return "Barbeiros";
  if (path.startsWith("/app/servicos")) return "Serviços";
  if (path.startsWith("/app/financeiro")) return "Financeiro";
  if (path.startsWith("/app/configuracoes")) return "Configurações";
  return "";
}
