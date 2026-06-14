import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { BrandingProvider } from "@/lib/branding";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppHeader } from "@/components/app/app-header";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { isAuthenticated, hydrated, role } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  // Não-autenticado → / (preservando guard de hydrated)
  useEffect(() => {
    if (hydrated && !isAuthenticated) navigate({ to: "/" });
  }, [hydrated, isAuthenticated, navigate]);

  // PROFESSIONAL em /financeiro/* → /dashboard
  useEffect(() => {
    if (!hydrated) return;
    if (role === "PROFESSIONAL" && pathname.startsWith("/financeiro")) {
      navigate({ to: "/dashboard" });
    }
  }, [hydrated, role, pathname, navigate]);

  if (!hydrated || !isAuthenticated) return null;

  return (
    <BrandingProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppHeader />
            <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </BrandingProvider>
  );
}
