import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { usePortalSession } from "@/lib/portal/session";
import { PortalShell } from "./portal-shell";

export function RequirePortalAuth({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const { hydrated, session } = usePortalSession();
  if (!hydrated) return null;
  if (!session) return <Navigate to="/portal/login" />;
  return <PortalShell title={title}>{children}</PortalShell>;
}