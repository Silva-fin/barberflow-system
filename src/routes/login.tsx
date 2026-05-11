import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Navalha" },
      { name: "description", content: "Acesse o painel administrativo da sua barbearia." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("zeca@barbeariadozeca.com.br");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.login(email, password);
      toast.success("Bem-vindo de volta!");
      navigate({ to: "/app" });
    } catch {
      toast.error("Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-2xl tracking-wider">NAVALHA</span>
        </div>
        <div>
          <h2 className="font-display text-5xl leading-tight">
            Sua agenda,<br />sua equipe,<br />seu caixa.
          </h2>
          <p className="mt-4 max-w-sm text-muted-foreground">
            Tudo em um painel feito para barbearias. Sem planilhas, sem atrito.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© Navalha</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="font-display text-3xl tracking-wide">Entrar no painel</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use qualquer e-mail/senha para a demo.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">← Voltar ao site</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
