import { useMemo, useState } from "react";
import { CATALOG, CATEGORY_LABELS, type ModuleCategory } from "@/lib/marketing/catalog";
import { ModuleCard } from "./module-card";
import { cn } from "@/lib/utils";

const CATEGORIES: (ModuleCategory | "all")[] = [
  "all", "core", "operacao", "financeiro", "clientes", "crescimento", "plataforma",
];

export function ModuleGrid({ withSearch = true }: { withSearch?: boolean }) {
  const [cat, setCat] = useState<ModuleCategory | "all">("all");
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return CATALOG.filter((m) => {
      if (cat !== "all" && m.category !== cat) return false;
      if (!qn) return true;
      return (
        m.name.toLowerCase().includes(qn) ||
        m.tagline.toLowerCase().includes(qn) ||
        m.description.toLowerCase().includes(qn)
      );
    });
  }, [cat, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
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
        {withSearch && (
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar módulo…"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-sidebar-primary md:w-64"
          />
        )}
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhum módulo encontrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <ModuleCard key={m.slug} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}