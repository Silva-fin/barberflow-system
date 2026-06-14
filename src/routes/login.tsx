import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth, type Role } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Wordmark } from "@/components/app/wordmark";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Paladino" },
      { name: "description", content: "Acesse o painel administrativo do seu negócio." },
    ],
  }),
  component: LoginPage,
});

const DEV_ROLES: Role[] = ["OWNER", "ADMIN", "OPERATOR", "PROFESSIONAL"];

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("zeca@paladino.com.br");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  async function doLogin(asRole?: Role) {
    setLoading(true);
    try {
      await auth.login(email, password, asRole);
      toast.success(asRole ? `Entrando como ${asRole}` : "Bem-vindo de volta!");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    doLogin();
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 lg:flex">
        <Link to="/" className="inline-flex">
          <Wordmark />
        </Link>
        <div>
          <h2 className="font-display text-5xl leading-tight text-sidebar-foreground">
            Sua operação,<br />sua equipe,<br />seu caixa.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Plataforma multi-tenant para negócios de serviço. Tudo em um painel.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© Paladino</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
          <div className="flex justify-center lg:hidden">
            <Wordmark accent={false} />
          </div>
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

          {import.meta.env.DEV && (
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Atalhos de dev
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEV_ROLES.map((r) => (
                  <Button
                    key={r}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => doLogin(r)}
                    className="text-xs"
                  >
                    Entrar como {r}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">← Voltar ao site</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
