import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/portal/status-badge";
import { CompanyCta } from "@/components/portal/company-chips";
import { fetchProducts } from "@/lib/portal/api";
import type { Product, ProductStatus } from "@/lib/portal/mock";
import { formatBRLFromDecimal, formatDate } from "@/lib/format";
import { matchesCompany, useCompanyFilter } from "@/lib/portal/company-filter";

export const Route = createFileRoute("/portal/produtos")({
  component: () => (
    <RequirePortalAuth title="Produtos">
      <ProductsPage />
    </RequirePortalAuth>
  ),
});

const STATUS_LABEL: Record<ProductStatus, string> = {
  reservado: "Reservado",
  comprado: "Comprado",
  retirado: "Retirado",
};

function ProductsPage() {
  const { selected } = useCompanyFilter();
  const q = useQuery({ queryKey: ["portal", "products"], queryFn: fetchProducts });

  if (q.isLoading)
    return (
      <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );

  const all = (q.data ?? []).filter((p) =>
    matchesCompany(selected, p.establishment.id),
  );
  const reserved = all.filter((p) => p.status === "reservado");
  const bought = all.filter((p) => p.status === "comprado");

  return (
    <div className="space-y-4">
      <CompanyCta />
      <Tabs defaultValue="historico">
        <TabsList>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="reservados">
            Reservados {reserved.length > 0 && `· ${reserved.length}`}
          </TabsTrigger>
          <TabsTrigger value="comprados">Comprados p/ retirada</TabsTrigger>
        </TabsList>
        <TabsContent value="historico" className="mt-4">
          <ProductList items={all} emptyMsg="Você ainda não tem produtos." selected={selected} />
        </TabsContent>
        <TabsContent value="reservados" className="mt-4">
          <ProductList
            items={reserved}
            emptyMsg="Nenhum produto reservado."
            selected={selected}
            hint="Pague e retire na barbearia."
          />
        </TabsContent>
        <TabsContent value="comprados" className="mt-4">
          <ProductList
            items={bought}
            emptyMsg="Nenhum produto comprado ainda."
            selected={selected}
            hint="Retire na barbearia."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProductList({
  items,
  emptyMsg,
  selected,
  hint,
}: {
  items: Product[];
  emptyMsg: string;
  selected: string;
  hint?: string;
}) {
  if (items.length === 0)
    return (
      <Card className="border-dashed p-10 text-center">
        <Package
          size={20}
          strokeWidth={1.5}
          className="mx-auto text-muted-foreground"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          {selected === "all" ? emptyMsg : `Nenhum produto nesta empresa.`}
        </p>
      </Card>
    );

  return (
    <ul className="space-y-2">
      {items.map((p) => (
        <li key={p.id}>
          <Card className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.quantity}un · {formatBRLFromDecimal(p.unitPriceBRL * p.quantity)}
                </p>
                {selected === "all" && (
                  <p className="mt-1 text-[11px] uppercase tracking-widest text-primary/80">
                    {p.establishment.name}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge
                  tone={
                    p.status === "reservado"
                      ? "warning"
                      : p.status === "comprado"
                        ? "primary"
                        : "success"
                  }
                >
                  {STATUS_LABEL[p.status]}
                </StatusBadge>
                <span className="text-[11px] text-muted-foreground">
                  {formatDate(p.date)}
                </span>
              </div>
            </div>
            {hint && p.status !== "retirado" && (
              <p className="mt-3 rounded-md bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                {hint}
              </p>
            )}
          </Card>
        </li>
      ))}
    </ul>
  );
}
