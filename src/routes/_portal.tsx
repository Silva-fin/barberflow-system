import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_portal")({
  component: PortalLayout,
});

function PortalLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}