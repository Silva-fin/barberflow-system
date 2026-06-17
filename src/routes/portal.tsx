import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalSessionProvider } from "@/lib/portal/session";

export const Route = createFileRoute("/portal")({
  component: PortalLayout,
});

function PortalLayout() {
  return (
    <PortalSessionProvider>
      <Outlet />
    </PortalSessionProvider>
  );
}