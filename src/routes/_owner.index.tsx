import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_owner/")({
  head: () => ({ meta: [{ title: "Plataforma — Paladino" }] }),
  component: OwnerHome,
});

function OwnerHome() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        Painel da Plataforma
      </p>
      <h1 className="mt-2 font-display text-5xl tracking-wide">Em construção</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Shell vazio para a Fase 1. Acesso reservado ao PLATFORM_OWNER.
      </p>
    </div>
  );
}