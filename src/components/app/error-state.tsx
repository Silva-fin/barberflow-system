import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Algo deu errado",
  description = "Não foi possível carregar os dados.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <AlertTriangle size={24} strokeWidth={1.5} className="mb-2 text-destructive" />
      <p className="font-display text-lg text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}