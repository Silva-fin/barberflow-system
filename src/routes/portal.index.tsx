import { createFileRoute, Navigate } from "@tanstack/react-router";
import { usePortalSession } from "@/lib/portal/session";

export const Route = createFileRoute("/portal/")({
  component: PortalIndex,
});

function PortalIndex() {
  const { hydrated, session } = usePortalSession();
  if (!hydrated) return null;
  return (
    <Navigate to={session ? "/portal/dashboard" : "/portal/login"} />
  );
}