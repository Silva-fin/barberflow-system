import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_owner")({
  component: OwnerLayout,
});

function OwnerLayout() {
  const { hydrated, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) navigate({ to: "/" });
    else if (role !== "PLATFORM_OWNER") navigate({ to: "/dashboard" });
  }, [hydrated, role, isAuthenticated, navigate]);

  if (!hydrated || !isAuthenticated || role !== "PLATFORM_OWNER") return null;

  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}