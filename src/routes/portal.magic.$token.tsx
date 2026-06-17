import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Wordmark } from "@/components/app/wordmark";
import { Button } from "@/components/ui/button";
import { consumeMagicToken, usePortalSession } from "@/lib/portal/session";

export const Route = createFileRoute("/portal/magic/$token")({
  component: MagicLanding,
});

function MagicLanding() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { setSession } = usePortalSession();
  const [state, setState] = useState<"loading" | "error">("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    consumeMagicToken(token)
      .then((s) => {
        if (!mounted) return;
        setSession(s);
        navigate({ to: "/portal/dashboard" });
      })
      .catch((err: Error) => {
        if (!mounted) return;
        setState("error");
        setMsg(err.message);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md text-center">
        <Wordmark />
        <div className="mt-8 rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
          {state === "loading" ? (
            <>
              <Loader2
                size={32}
                strokeWidth={1.5}
                className="mx-auto animate-spin text-primary"
              />
              <p className="mt-4 text-sm text-muted-foreground">
                Validando seu acesso…
              </p>
            </>
          ) : (
            <>
              <AlertCircle
                size={32}
                strokeWidth={1.5}
                className="mx-auto text-muted-foreground"
              />
              <h1 className="mt-4 font-display text-xl">Link indisponível</h1>
              <p className="mt-2 text-sm text-muted-foreground">{msg}</p>
              <Button asChild className="mt-6">
                <Link to="/portal/login">Pedir novo link</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}