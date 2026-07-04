import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/portal/consentimentos")({
  component: () => <Navigate to="/portal/perfil" />,
});
