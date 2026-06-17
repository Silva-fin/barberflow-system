import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Wordmark } from "@/components/app/wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Mail, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import {
  loginPassword,
  requestMagicLink,
  usePortalSession,
} from "@/lib/portal/session";

export const Route = createFileRoute("/portal/login")({
  component: LoginPage,
});

function LoginPage() {
  const { hydrated, session, setSession } = usePortalSession();
  const navigate = useNavigate();

  if (hydrated && session) return <Navigate to="/portal/dashboard" />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Wordmark />
          <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Portal do Cliente
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h1 className="font-display text-2xl">Acesse sua conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use o link mágico ou entre com e-mail e senha.
          </p>

          <Tabs defaultValue="magic" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="magic">
                <Mail size={14} strokeWidth={1.5} className="mr-2" />
                Magic link
              </TabsTrigger>
              <TabsTrigger value="pw">
                <KeyRound size={14} strokeWidth={1.5} className="mr-2" />
                E-mail e senha
              </TabsTrigger>
            </TabsList>
            <TabsContent value="magic" className="mt-4">
              <MagicForm />
            </TabsContent>
            <TabsContent value="pw" className="mt-4">
              <PasswordForm
                onSuccess={(email) => {
                  setSession({
                    id: "cli-001",
                    name: "Marina Castro",
                    email,
                    phone: "(11) 98123-4567",
                  });
                  navigate({ to: "/portal/dashboard" });
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            ← Voltar para o site
          </Link>
        </p>
      </div>
    </div>
  );
}

function MagicForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    "idle" | "loading" | "sent" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");
    try {
      await requestMagicLink(email);
      setState("sent");
    } catch (err) {
      setState("error");
      setErrorMsg((err as Error).message ?? "Erro ao enviar link");
    }
  };

  if (state === "sent") {
    return (
      <div className="rounded-md border border-success/30 bg-success/10 p-4 text-sm">
        <div className="flex items-start gap-2">
          <CheckCircle2 size={16} strokeWidth={1.5} className="mt-0.5 text-success" />
          <div>
            <p className="font-medium text-foreground">Link enviado</p>
            <p className="mt-1 text-muted-foreground">
              Se houver uma conta com esse e-mail, enviamos um link de acesso.
              Confira sua caixa de entrada.
            </p>
          </div>
        </div>
        <button
          className="mt-3 text-xs text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => setState("idle")}
        >
          Enviar para outro e-mail
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="magic-email">E-mail</Label>
        <Input
          id="magic-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="mt-1"
        />
      </div>
      {state === "error" && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle size={12} /> {errorMsg}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={state === "loading"}>
        {state === "loading" && (
          <Loader2 size={14} className="mr-2 animate-spin" />
        )}
        Enviar link
      </Button>
    </form>
  );
}

function PasswordForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");
    try {
      const s = await loginPassword(email, pw);
      onSuccess(s.email);
    } catch (err) {
      setState("error");
      setErrorMsg((err as Error).message ?? "Erro");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="pw-email">E-mail</Label>
        <Input
          id="pw-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="pw-pass">Senha</Label>
        <Input
          id="pw-pass"
          type="password"
          autoComplete="current-password"
          required
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="mt-1"
        />
      </div>
      {state === "error" && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle size={12} /> {errorMsg}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={state === "loading"}>
        {state === "loading" && (
          <Loader2 size={14} className="mr-2 animate-spin" />
        )}
        Entrar
      </Button>
    </form>
  );
}