import { useCompanyFilter } from "@/lib/portal/company-filter";
import { cn } from "@/lib/utils";

export function CompanyChips() {
  const { selected, setSelected, companies } = useCompanyFilter();
  const chips = [{ id: "all", name: "Todas" }, ...companies];
  return (
    <div className="border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-2 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((c) => {
          const active = selected === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors",
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CompanyCta() {
  const { selectedCompany } = useCompanyFilter();
  if (!selectedCompany) return null;
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <p className="text-xs uppercase tracking-widest text-primary/80">
        {selectedCompany.name}
      </p>
      <p className="mt-1 font-display text-lg">Quer agendar ou comprar?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
          Agendar horário
        </button>
        <button className="rounded-md border border-primary/40 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10">
          Ver catálogo
        </button>
      </div>
    </div>
  );
}