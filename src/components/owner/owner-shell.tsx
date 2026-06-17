import type { ReactNode } from "react";
import { OwnerSidebar } from "./owner-sidebar";
import { ImpersonationBanner } from "./impersonation-banner";

export function OwnerShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <OwnerSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <ImpersonationBanner />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
