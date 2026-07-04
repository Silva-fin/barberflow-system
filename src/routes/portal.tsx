import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CompanyFilterProvider } from "@/lib/portal/company-filter";

export const Route = createFileRoute("/portal")({
  component: () => (
    <CompanyFilterProvider>
      <Outlet />
    </CompanyFilterProvider>
  ),
});