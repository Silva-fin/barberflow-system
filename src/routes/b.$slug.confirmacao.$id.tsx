import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/b/$slug/confirmacao/$id")({
  head: () => ({ meta: [{ title: "Agendamento confirmado" }] }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { slug, id } = Route.useParams();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-4xl tracking-wide">Agendamento confirmado!</h1>
        <p className="mt-3 text-muted-foreground">
          Você receberá uma confirmação por SMS/e-mail. Não se atrase!
        </p>
        <p className="mt-2 text-xs text-muted-foreground font-mono">Código: {id}</p>

        <div className="mt-8 flex flex-col gap-2">
          <Link
            to="/b/$slug" params={{ slug }}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
          >
            Fazer novo agendamento
          </Link>
        </div>

        <div className="mt-12 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" /> Powered by Navalha
        </div>
      </div>
    </div>
  );
}
