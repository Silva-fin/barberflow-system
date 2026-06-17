import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { OwnerImpersonationProvider } from "@/lib/owner/session";
import { OwnerShell } from "@/components/owner/owner-shell";

export const Route = createFileRoute("/owner")({
  component: OwnerLayout,
});

function OwnerLayout() {
  const { hydrated, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) navigate({ to: "/login" });
    else if (role !== "PLATFORM_OWNER") navigate({ to: "/dashboard" });
  }, [hydrated, role, isAuthenticated, navigate]);

  if (!hydrated || !isAuthenticated || role !== "PLATFORM_OWNER") return null;

  return (
    <OwnerImpersonationProvider>
      <OwnerShell>
        <Outlet />
      </OwnerShell>
    </OwnerImpersonationProvider>
  );
}