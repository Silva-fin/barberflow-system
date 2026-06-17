import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_public/nps/respond/$surveyId")({
  head: () => ({ meta: [{ title: "Avalie sua experiência" }] }),
  component: NpsPublicRespondPage,
});

type State = "idle" | "sending" | "success" | "error";

function NpsPublicRespondPage() {
  const { surveyId } = useParams({ from: "/_public/nps/respond/$surveyId" });
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errMsg, setErrMsg] = useState<string>("");

  async function submit() {
    if (score === null) return;
    setState("sending");
    await new Promise((r) => setTimeout(r, 700));
    if (surveyId.endsWith("x")) {
      setState("error");
      setErrMsg("Esta pesquisa não está mais disponível.");
      return;
    }
    setState("success");
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-sm">
      {state === "success" ? (
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl tracking-wide">Obrigado pelo seu feedback!</h1>
          <p className="text-sm text-muted-foreground">Sua avaliação foi registrada com sucesso.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="font-display text-3xl tracking-wide">Como foi sua experiência?</h1>
            <p className="text-sm text-muted-foreground">
              De 0 a 10, o quanto você recomendaria nosso atendimento?
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
                      "h-12 min-w-[2.75rem] rounded border font-mono text-sm tabular-nums transition",
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
              <span>Pouco provável</span>
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
            className="h-12 w-full"
            disabled={score === null || state === "sending"}
            onClick={submit}
          >
            {state === "sending" ? "Enviando…" : "Enviar"}
          </Button>
        </div>
      )}
    </div>
  );
}
