import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { RequirePortalAuth } from "@/components/portal/guard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/portal/status-badge";
import { CompanyCta } from "@/components/portal/company-chips";
import { fetchPayments } from "@/lib/portal/api";
import { formatBRLFromDecimal, formatDate } from "@/lib/format";
import { matchesCompany, useCompanyFilter } from "@/lib/portal/company-filter";

const METHOD_LABEL: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao: "Cartão",
};

export const Route = createFileRoute("/portal/pagamentos")({
  component: () => (
    <RequirePortalAuth title="Pagamentos">
      <PaymentsPage />
    </RequirePortalAuth>
  ),
});

function PaymentsPage() {
  const { selected } = useCompanyFilter();
  const q = useQuery({ queryKey: ["portal", "payments"], queryFn: fetchPayments });

  if (q.isLoading)
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );

  const items = (q.data ?? []).filter((p) =>
    matchesCompany(selected, p.establishment.id),
  );

  return (
    <div className="space-y-4">
      <CompanyCta />
      {items.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <CreditCard
            size={20}
            strokeWidth={1.5}
            className="mx-auto text-muted-foreground"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {selected === "all"
              ? "Nenhum pagamento registrado."
              : "Nenhum pagamento nesta empresa."}
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((p) => (
            <li key={p.id}>
              <Card className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {METHOD_LABEL[p.method]} · {formatDate(p.date)}
                      {selected === "all" && (
                        <>
                          {" · "}
                          <span className="text-primary">
                            {p.establishment.name}
                          </span>
                        </>
                      )}
                    </p>
                    {p.couponCode && (
                      <p className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] tracking-widest text-primary">
                        Cupom {p.couponCode}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-medium">
                      {formatBRLFromDecimal(p.amountBRL)}
                    </p>
                    <StatusBadge
                      tone={p.status === "pago" ? "success" : "warning"}
                    >
                      {p.status === "pago" ? "Pago" : "Pendente"}
                    </StatusBadge>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
