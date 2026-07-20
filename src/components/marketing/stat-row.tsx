const STATS = [
  { value: "+320", label: "barbearias ativas" },
  { value: "+180k", label: "atendimentos/mês" },
  { value: "24", label: "módulos disponíveis" },
  { value: "99,9%", label: "uptime da plataforma" },
];

export function StatRow() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-4xl text-sidebar-primary">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}