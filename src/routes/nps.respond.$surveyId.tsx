import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wordmark } from "@/components/app/wordmark";

export const Route = createFileRoute("/nps/respond/$surveyId")({
  head: () => ({ meta: [{ title: "Avalie sua experiência" }] }),
  component: NpsPublicRespondPage,
});

type State = "idle" | "sending" | "success" | "error";

function NpsPublicRespondPage() {
  const { surveyId } = useParams({ from: "/nps/respond/$surveyId" });
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errMsg, setErrMsg] = useState<string>("");

  async function submit() {
    if (score === null) return;
    setState("sending");
    await new Promise((r) => setTimeout(r, 700));
    // simulação determinística para preview
    const bad = surveyId.endsWith("x");
    if (bad) {
      setState("error");
      setErrMsg("Esta pesquisa não está mais disponível.");
      return;
    }
    setState("success");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-10">
        <div className="flex justify-center pb-8">
          <Wordmark />
        </div>

        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          {state === "success" ? (
            <div className="space-y-3 text-center">
              <h1 className="font-display text-3xl tracking-wide">Obrigado pelo seu feedback!</h1>
              <p className="text-sm text-muted-foreground">Sua opinião nos ajuda a melhorar.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="font-display text-3xl tracking-wide">Como foi sua experiência?</h1>
                <p className="text-sm text-muted-foreground">
                  De 0 a 10, qual a chance de você recomendar nossos serviços?
                </p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-11 gap-1">
                  {Array.from({ length: 11 }, (_, i) => {
                    const selected = score === i;
                    const tone = i <= 6
                      ? "border-destructive/30 bg-destructive/5 hover:bg-destructive/15 text-destructive"
                      : i <= 8
                      ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      : "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={state === "sending"}
                        onClick={() => setScore(i)}
                        className={cn(
                          "h-12 rounded border font-mono text-sm tabular-nums transition",
                          tone,
                          selected && "ring-2 ring-foreground ring-offset-2 ring-offset-card",
                        )}
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span>Nada provável</span>
                  <span>Muito provável</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm">Comentário (opcional)</label>
                <Textarea
                  rows={4}
                  maxLength={2000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={state === "sending"}
                  placeholder="Conte mais sobre sua experiência…"
                />
              </div>

              {state === "error" && (
                <p className="text-sm text-destructive">{errMsg}</p>
              )}

              <Button
                className="w-full"
                disabled={score === null || state === "sending"}
                onClick={submit}
              >
                {state === "sending" ? "Enviando…" : "Enviar"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}