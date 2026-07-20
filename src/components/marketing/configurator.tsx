import { useMemo, useState, useEffect } from "react";
import { Check, Info, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
  CATALOG, CATEGORY_LABELS, PRESETS, coreSlugs, priceOf,
  withDependencies, reverseDependents, CATALOG_BY_SLUG,
  type ModuleCategory, BASE_PRICE,
} from "@/lib/marketing/catalog";
import { cn } from "@/lib/utils";

const CORE = coreSlugs();

export function Configurator({ preselect = [] as string[] }) {
  const navigate = useNavigate();
  const initial = useMemo(
    () => withDependencies([...CORE, ...preselect]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<ModuleCategory | "all">("all");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (preselect.length) {
      setSelected(new Set(withDependencies([...CORE, ...preselect])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselect.join(",")]);

  function toggle(slug: string) {
    const m = CATALOG_BY_SLUG.get(slug);
    if (!m || m.core) return;
    const next = new Set(selected);
    if (next.has(slug)) {
      // unchecking: warn about reverse dependents
      const dependents = reverseDependents(slug).filter((d) => next.has(d));
      if (dependents.length) {
        setNotice(
          `Ao remover ${m.name}, também desativamos: ${dependents
            .map((d) => CATALOG_BY_SLUG.get(d)?.name)
            .join(", ")}.`,
        );
        dependents.forEach((d) => next.delete(d));
      } else {
        setNotice(null);
      }
      next.delete(slug);
    } else {
      const before = next.size;
      const withDeps = withDependencies([...next, slug]);
      withDeps.forEach((s) => next.add(s));
      const added = withDeps.length - before - 1;
      if (added > 0) {
        setNotice(`Adicionamos ${added} dependência${added > 1 ? "s" : ""} automaticamente.`);
      } else {
        setNotice(null);
      }
    }
    setSelected(next);
  }

  function applyPreset(slugs: string[]) {
    setSelected(new Set(withDependencies([...CORE, ...slugs])));
    setNotice("Preset aplicado.");
  }

  function reset() {
    setSelected(new Set(CORE));
    setNotice(null);
  }

  const grouped = useMemo(() => {
    const qn = query.trim().toLowerCase();
    const filtered = CATALOG.filter((m) => {
      if (cat !== "all" && m.category !== cat) return false;
      if (!qn) return true;
      return m.name.toLowerCase().includes(qn) || m.tagline.toLowerCase().includes(qn);
    });
    const g = new Map<ModuleCategory, typeof CATALOG>();
    for (const m of filtered) {
      const list = g.get(m.category) ?? [];
      list.push(m);
      g.set(m.category, list);
    }
    return Array.from(g.entries());
  }, [query, cat]);

  const total = priceOf(Array.from(selected));
  const selectedList = CATALOG.filter((m) => selected.has(m.slug));

  function submit() {
    toast.success("Configuração enviada! Vamos abrir sua conta.");
    setTimeout(() => navigate({ to: "/login" }), 600);
  }

  const CATS: (ModuleCategory | "all")[] = [
    "all", "core", "operacao", "financeiro", "clientes", "crescimento", "plataforma",
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
      <div className="space-y-6">
        {/* Presets */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-sidebar-primary" />
            <p className="text-xs uppercase tracking-[0.2em] text-sidebar-primary">Comece rápido</p>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.slugs)}
                className="rounded-md border border-border bg-background p-3 text-left transition-colors hover:border-sidebar-primary/60"
              >
                <p className="font-display text-base">{p.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
              </button>
            ))}
          </div>
          <button
            onClick={reset}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
            Limpar seleção
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  cat === c
                    ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {c === "all" ? "Todos" : CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar…"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-sidebar-primary md:w-64"
          />
        </div>

        {notice && (
          <div className="flex items-start gap-2 rounded-md border border-sidebar-primary/40 bg-sidebar-primary/10 p-3 text-xs">
            <Info size={14} className="mt-0.5 text-sidebar-primary" />
            <span className="flex-1">{notice}</span>
            <button onClick={() => setNotice(null)} className="text-muted-foreground hover:text-foreground">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Groups */}
        <div className="space-y-6">
          {grouped.map(([category, list]) => (
            <div key={category}>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {CATEGORY_LABELS[category]}
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {list.map((m) => {
                  const on = selected.has(m.slug);
                  const Icon = m.icon;
                  const autoDep =
                    on && !m.core &&
                    Array.from(selected).some((s) => CATALOG_BY_SLUG.get(s)?.dependsOn?.includes(m.slug));
                  return (
                    <button
                      key={m.slug}
                      onClick={() => toggle(m.slug)}
                      disabled={m.core}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                        on
                          ? "border-sidebar-primary/60 bg-sidebar-primary/5"
                          : "border-border bg-card hover:bg-muted/40",
                        m.core && "cursor-not-allowed opacity-90",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                          on
                            ? "border-sidebar-primary bg-sidebar-primary text-primary-foreground"
                            : "border-border bg-background",
                        )}
                      >
                        {on && <Check size={12} />}
                      </span>
                      <span className="flex-1">
                        <span className="flex items-center gap-2">
                          <Icon size={14} strokeWidth={1.5} className="text-sidebar-primary" />
                          <span className="font-medium">{m.name}</span>
                          {m.core && (
                            <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                              incluso
                            </span>
                          )}
                          {autoDep && (
                            <span className="rounded-full border border-sidebar-primary/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-sidebar-primary">
                              dependência
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{m.tagline}</span>
                        {!m.core && (
                          <span className="mt-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                            + R$ {m.price}/mês
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-sidebar-primary">Sua configuração</p>
          <p className="mt-2 font-display text-4xl text-foreground">
            R$ {total}<span className="text-base text-muted-foreground">/mês</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedList.length} módulos · base R$ {BASE_PRICE}
          </p>

          <div className="mt-4 max-h-64 space-y-1 overflow-y-auto pr-1">
            {selectedList.map((m) => (
              <div key={m.slug} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <m.icon size={12} className="text-sidebar-primary" />
                  <span>{m.name}</span>
                </span>
                <span className="text-muted-foreground">
                  {m.core ? "—" : m.price === 0 ? "grátis" : `R$ ${m.price}`}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={submit}
            className="mt-5 w-full rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Começar com essa configuração
          </button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Sem cartão · cancele quando quiser
          </p>
        </div>
      </aside>
    </div>
  );
}