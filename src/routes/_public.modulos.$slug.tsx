import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronLeft, ExternalLink } from "lucide-react";
import { LandingHeader } from "@/components/marketing/landing-header";
import { LandingFooter } from "@/components/marketing/landing-footer";
import { ModuleCard } from "@/components/marketing/module-card";
import { CATALOG, CATALOG_BY_SLUG, CATEGORY_LABELS, reverseDependents, type CatalogModule } from "@/lib/marketing/catalog";

export const Route = createFileRoute("/_public/modulos/$slug")({
  loader: ({ params }): { module: CatalogModule } => {
    const m = CATALOG_BY_SLUG.get(params.slug);
    if (!m) throw notFound();
    return { module: m };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Módulo não encontrado — Paladino" }, { name: "robots", content: "noindex" }] };
    }
    const m = loaderData.module;
    return {
      meta: [
        { title: `${m.name} — Paladino` },
        { name: "description", content: m.tagline },
        { property: "og:title", content: `${m.name} — Paladino` },
        { property: "og:description", content: m.tagline },
      ],
    };
  },
  component: ModuleDetail,
});

function ModuleDetail() {
  const data = Route.useLoaderData() as { module: CatalogModule };
  const m = data.module;
  const Icon = m.icon;
  const related = [
    ...(m.dependsOn ?? []),
    ...reverseDependents(m.slug),
  ]
    .map((s) => CATALOG_BY_SLUG.get(s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const suggestions = related.length
    ? related
    : CATALOG.filter((x) => x.category === m.category && x.slug !== m.slug).slice(0, 3);

  return (
    <>
      <LandingHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Link
          to="/modulos"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={14} /> Todos os módulos
        </Link>

        <header className="mt-6 grid gap-8 border-b border-border pb-10 md:grid-cols-[1fr,auto] md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-sidebar-primary">
                <Icon size={26} strokeWidth={1.5} />
              </div>
              <span className="text-xs uppercase tracking-[0.25em] text-sidebar-primary">
                {CATEGORY_LABELS[m.category]}
              </span>
            </div>
            <h1 className="mt-5 font-display text-6xl leading-tight tracking-wide">{m.name}</h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{m.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/montar"
              search={{ add: m.slug }}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Adicionar ao meu Paladino <ArrowRight size={14} />
            </Link>
            <Link
              to="/modulos"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm hover:bg-muted"
            >
              Ver outros
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-10 md:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <p className="text-base text-muted-foreground">{m.description}</p>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sidebar-primary">O que está incluso</p>
              <ul className="mt-3 space-y-2">
                {m.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="mt-0.5 text-sidebar-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {m.screens && m.screens.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sidebar-primary">Como fica no produto</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.screens.map((s) => (
                    <a
                      key={s.to}
                      href={s.to}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs hover:bg-muted"
                    >
                      {s.label}
                      <ExternalLink size={12} className="text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-sidebar-primary">Preço</p>
            <p className="mt-2 font-display text-4xl">
              {m.core ? "Incluso" : m.price === 0 ? "Grátis" : `+ R$ ${m.price}`}
              {!m.core && m.price > 0 && <span className="text-base text-muted-foreground">/mês</span>}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {m.core
                ? "Faz parte do plano base do Paladino."
                : m.price === 0
                ? "Ative gratuitamente quando quiser."
                : "Cobrado apenas se você ativar."}
            </p>
            {m.dependsOn && m.dependsOn.length > 0 && (
              <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                Requer:{" "}
                {m.dependsOn.map((d, i) => {
                  const dep = CATALOG_BY_SLUG.get(d);
                  return (
                    <span key={d}>
                      {i > 0 && ", "}
                      <Link
                        to="/modulos/$slug"
                        params={{ slug: d }}
                        className="text-sidebar-primary hover:underline"
                      >
                        {dep?.name ?? d}
                      </Link>
                    </span>
                  );
                })}
              </p>
            )}
          </aside>
        </section>

        {suggestions.length > 0 && (
          <section className="mt-16">
            <p className="text-xs uppercase tracking-[0.2em] text-sidebar-primary">Combina com</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.slice(0, 3).map((r) => (
                <ModuleCard key={r.slug} m={r} />
              ))}
            </div>
          </section>
        )}
      </main>
      <LandingFooter />
    </>
  );
}