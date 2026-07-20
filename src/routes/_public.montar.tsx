import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { LandingHeader } from "@/components/marketing/landing-header";
import { LandingFooter } from "@/components/marketing/landing-footer";
import { Configurator } from "@/components/marketing/configurator";

const searchSchema = z.object({
  add: z.string().optional(),
});

export const Route = createFileRoute("/_public/montar")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Monte seu Paladino — configurador" },
      { name: "description", content: "Escolha os módulos que fazem sentido para o seu negócio e veja o preço em tempo real." },
      { property: "og:title", content: "Monte seu Paladino" },
      { property: "og:description", content: "Configure sua plataforma escolhendo apenas o que você precisa." },
    ],
  }),
  component: MontarPage,
});

function MontarPage() {
  const { add } = Route.useSearch();
  const preselect = add ? [add] : [];
  return (
    <>
      <LandingHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <span className="text-xs uppercase tracking-[0.25em] text-sidebar-primary">Configurador</span>
          <h1 className="mt-3 font-display text-5xl leading-tight md:text-6xl">
            Monte seu Paladino
          </h1>
          <p className="mt-3 text-muted-foreground">
            Escolha os módulos que você precisa hoje. Ative outros a qualquer momento — sem migração, sem contrato.
          </p>
        </div>
        <Configurator preselect={preselect} />
      </main>
      <LandingFooter />
    </>
  );
}