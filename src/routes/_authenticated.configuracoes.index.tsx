import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight, UserCircle, Building2, ShieldCheck, Users, Plug,
  MessageCircle, Percent, BarChart3, type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/configuracoes/")({
  head: () => ({ meta: [{ title: "Configurações — Paladino" }] }),
  component: ConfiguracoesHub,
});

type Item = { to: string; icon: LucideIcon; title: string; desc: string };

const items: Item[] = [
  { to: "/configuracoes/perfil",      icon: UserCircle,   title: "Meu Perfil",       desc: "Suas informações de acesso." },
  { to: "/configuracoes/financeiro",  icon: Building2,    title: "Perfil da empresa", desc: "Dados fiscais e contas da barbearia." },
  { to: "/configuracoes/seguranca",   icon: ShieldCheck,  title: "Segurança",        desc: "Altere a sua senha de acesso." },
  { to: "/usuarios",                  icon: Users,        title: "Usuários",         desc: "Equipe com acesso ao sistema." },
  { to: "/configuracoes/integracoes", icon: Plug,         title: "Integrações",      desc: "Conexões com serviços externos." },
  { to: "/comunicacao",               icon: MessageCircle,title: "Comunicação",      desc: "Templates e canais de mensagem." },
  { to: "/configuracoes/taxas",       icon: Percent,      title: "Taxas",            desc: "Taxas por método de pagamento." },
  { to: "/relatorios",                icon: BarChart3,    title: "Relatórios",       desc: "Acesso rápido a indicadores." },
];

function ConfiguracoesHub() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Configurações"
        description="Gerencie as configurações da sua empresa."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(it => (
          <Link key={it.to} to={it.to} className="block">
            <Card className="h-full transition-colors hover:bg-muted/30">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <it.icon size={18} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg">{it.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{it.desc}</p>
                </div>
                <ChevronRight size={16} strokeWidth={1.5} className="mt-1 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}