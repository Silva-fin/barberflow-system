import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Tag } from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/portal/status-badge";
import { CompanyCta } from "@/components/portal/company-chips";
import { fetchCoupons } from "@/lib/portal/api";
import { formatDate } from "@/lib/format";
import { matchesCompany, useCompanyFilter } from "@/lib/portal/company-filter";

export const Route = createFileRoute("/portal/cupons")({
  component: () => (
    <RequirePortalAuth title="Cupons">
      <CouponsPage />
    </RequirePortalAuth>
  ),
});

function CouponsPage() {
  const { selected } = useCompanyFilter();
  const q = useQuery({ queryKey: ["portal", "coupons"], queryFn: fetchCoupons });

  if (q.isLoading) return <Skeleton className="h-24 w-full" />;

  const items = (q.data ?? []).filter((c) =>
    matchesCompany(selected, c.establishment.id),
  );

  return (
    <div className="space-y-4">
      <CompanyCta />
      {items.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <Tag
            size={20}
            strokeWidth={1.5}
            className="mx-auto text-muted-foreground"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {selected === "all"
              ? "Você não tem cupons disponíveis."
              : "Nenhum cupom nesta empresa."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-xl tracking-widest text-primary">
                    {c.code}
                  </p>
                  <p className="mt-1 text-sm">{c.discountLabel}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.description}
                  </p>
                </div>
                {c.personal && (
                  <StatusBadge tone="primary">Pessoal</StatusBadge>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Válido até {formatDate(c.validUntil)}</span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(c.code);
                    toast.success("Código copiado");
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:border-primary/40 hover:text-foreground"
                >
                  <Copy size={12} strokeWidth={1.5} />
                  Copiar
                </button>
              </div>
              {selected === "all" && (
                <p className="mt-3 border-t border-border/60 pt-2 text-[11px] uppercase tracking-widest text-primary/80">
                  {c.establishment.name}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
