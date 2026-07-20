import { createFileRoute } from "@tanstack/react-router";
import { ModuleGrid } from "@/components/marketing/module-grid";
import { LandingHeader } from "@/components/marketing/landing-header";
import { LandingFooter } from "@/components/marketing/landing-footer";

export const Route = createFileRoute("/_public/modulos")({
  head: () => ({
    meta: [
      { title: "Módulos — Paladino" },
      { name: "description", content: "Explore todos os módulos disponíveis no Paladino: agenda, comissões, financeiro, vitrine, CRM e muito mais." },
      { property: "og:title", content: "Módulos — Paladino" },
      { property: "og:description", content: "Todos os módulos do Paladino em um só lugar." },
    ],
  }),
  component: ModulesPage,
});

function ModulesPage() {
  return (
    <>
      <LandingHeader />
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs uppercase tracking-[0.25em] text-sidebar-primary">Catálogo</span>
          <h1 className="mt-3 font-display text-5xl leading-tight md:text-6xl">
            Todos os módulos do Paladino
          </h1>
          <p className="mt-4 text-muted-foreground">
            Ative só o que precisa. Combine módulos conforme sua operação cresce.
          </p>
        </div>
        <ModuleGrid />
      </main>
      <LandingFooter />
    </>
  );
}