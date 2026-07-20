import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { LandingHeader } from "@/components/marketing/landing-header";
import { LandingFooter } from "@/components/marketing/landing-footer";
import { BASE_PRICE, CATALOG } from "@/lib/marketing/catalog";

export const Route = createFileRoute("/_public/precos")({
  head: () => ({
    meta: [
      { title: "Preços — Paladino" },
      { name: "description", content: "Um plano base transparente. Ative módulos adicionais conforme sua operação cresce." },
      { property: "og:title", content: "Preços — Paladino" },
      { property: "og:description", content: "Plano base transparente e módulos sob demanda." },
    ],
  }),
  component: PrecosPage,
});

const FAQ = [
  { q: "Existe fidelidade?", a: "Não. Você pode cancelar quando quiser, sem multa." },
  { q: "Como funcionam os módulos?", a: "Cada módulo é ativado individualmente. Você paga só pelo que usa." },
  { q: "Preciso de cartão para testar?", a: "Não. O teste é gratuito e sem cartão." },
  { q: "Tem plano para redes?", a: "Sim. O módulo Multi-empresa habilita várias unidades na mesma conta." },
];

function PrecosPage() {
  const included = CATALOG.filter((m) => m.core).map((m) => m.name);

  return (
    <>
      <LandingHeader />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-sidebar-primary">Preços</span>
          <h1 className="mt-3 font-display text-6xl leading-tight md:text-7xl">
            Simples e transparente.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Um plano base com o essencial. Ative módulos adicionais só quando fizer sentido.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-sidebar-primary/40 bg-card p-8 shadow-2xl shadow-black/40">
          <div className="grid gap-6 md:grid-cols-[1fr,auto] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sidebar-primary">Plano base</p>
              <p className="mt-2 font-display text-6xl">
                R$ {BASE_PRICE}<span className="text-lg text-muted-foreground">/mês por unidade</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Inclui: {included.join(" · ")}.
              </p>
            </div>
            <Link
              to="/montar"
              className="rounded-md bg-primary px-6 py-4 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Monte seu Paladino
            </Link>
          </div>
          <ul className="mt-6 grid gap-2 border-t border-border pt-6 md:grid-cols-2">
            {[
              "Sem fidelidade",
              "Sem cartão para testar",
              "Usuários ilimitados",
              "Suporte em português",
              "Atualizações contínuas",
              "Ative módulos quando precisar",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-sidebar-primary" /> {f}
              </li>
            ))}
          </ul>
        </div>

        <section className="mt-16">
          <h2 className="font-display text-3xl">Perguntas frequentes</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-lg border border-border bg-card p-5">
                <p className="font-medium">{f.q}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}