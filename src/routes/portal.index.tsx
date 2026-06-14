import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_portal/")({
  component: PortalHome,
});

function PortalHome() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-5xl tracking-wide">Portal do Cliente</h1>
      <p className="mt-3 text-sm text-muted-foreground">Shell reservado — Fase 1.</p>
    </div>
  );
}