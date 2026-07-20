import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calendar, Store, CreditCard, Users, MessageCircle, BarChart3, Percent,
  Boxes, ArrowRight, Check,
} from "lucide-react";
import { LandingHeader } from "@/components/marketing/landing-header";
import { LandingFooter } from "@/components/marketing/landing-footer";
import { Hero } from "@/components/marketing/hero";
import { StatRow } from "@/components/marketing/stat-row";
import { ModuleGrid } from "@/components/marketing/module-grid";
import { PillarBlock } from "@/components/marketing/pillar-block";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import { BASE_PRICE, CATALOG } from "@/lib/marketing/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Paladino — Sua barbearia inteira em uma plataforma" },
      { name: "description", content: "Agenda, equipe, caixa, vitrine, comunicação e financeiro. Ative só o que precisa e monte seu Paladino em minutos." },
      { property: "og:title", content: "Paladino — Sua barbearia inteira em uma plataforma" },
      { property: "og:description", content: "Plataforma modular para negócios de serviço. Ative só o que precisa." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <Hero />
      <StatRow />

      {/* Módulos */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.25em] text-sidebar-primary">
              {CATALOG.length} módulos
            </span>
            <h2 className="mt-3 font-display text-5xl leading-tight md:text-6xl">
              Um app para cada parte do negócio.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Cada módulo faz uma coisa muito bem — e conversa com todos os outros.
            </p>
          </div>
          <Link
            to="/modulos"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-muted"
          >
            Ver catálogo completo <ArrowRight size={14} />
          </Link>
        </div>
        <ModuleGrid withSearch={false} />
      </section>

      {/* Pilares */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl space-y-24 px-4 py-24 sm:px-6">
          <PillarBlock
            eyebrow="Atender"
            title="Agenda cheia, sem esforço."
            description="Vitrine pública com carrinho e checkout unificado. Fila de espera com aviso automático. Confirmação por WhatsApp sem levantar da cadeira."
            bullets={[
              { icon: Calendar, label: "Agenda por profissional e por serviço" },
              { icon: Store, label: "Vitrine com URL própria" },
              { icon: MessageCircle, label: "Confirmação e lembrete automáticos" },
            ]}
            ctaLabel="Ver módulo Agenda"
            ctaTo="/modulos/agenda"
          />
          <PillarBlock
            reverse
            eyebrow="Receber"
            title="Financeiro completo, do caixa ao DRE."
            description="Registre pagamentos por qualquer meio, concilie com adquirentes, controle contas a pagar e feche o mês com o DRE em minutos."
            bullets={[
              { icon: CreditCard, label: "Pix, cartão, dinheiro e link" },
              { icon: Percent, label: "Taxas descontadas automaticamente" },
              { icon: BarChart3, label: "DRE por competência" },
            ]}
            ctaLabel="Ver Financeiro"
            ctaTo="/modulos/financeiro"
          />
          <PillarBlock
            eyebrow="Fidelizar"
            title="Cada cliente, uma jornada."
            description="CRM com segmentos dinâmicos, pacotes pré-pagos, assinaturas recorrentes e NPS pós-atendimento. Tudo conversando entre si."
            bullets={[
              { icon: Users, label: "Segmentação por RFV" },
              { icon: Boxes, label: "Pacotes e assinaturas" },
              { icon: MessageCircle, label: "Comunicação multicanal" },
            ]}
            ctaLabel="Ver módulo CRM"
            ctaTo="/modulos/crm"
          />
        </div>
      </section>

      {/* Prova social */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs uppercase tracking-[0.25em] text-sidebar-primary">Depoimentos</span>
          <h2 className="mt-3 font-display text-5xl leading-tight">
            Barbearias que já operam no Paladino.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <TestimonialCard
            quote="Consegui olhar meu financeiro pela primeira vez em anos. Fiz o fechamento do mês em 20 minutos."
            name="Ricardo Zeca"
            role="Barbearia do Zeca — Palmas/TO"
          />
          <TestimonialCard
            quote="A vitrine com checkout unificado dobrou nossa reserva de pacotes em 60 dias."
            name="Camila Rocha"
            role="Studio Alpha — São Paulo/SP"
          />
          <TestimonialCard
            quote="Ativei só agenda e comissões no começo. Hoje uso tudo. Cresci sem trocar de sistema."
            name="Igor Barber"
            role="Barber King — 4 unidades"
          />
        </div>
      </section>

      {/* Preço */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <span className="text-xs uppercase tracking-[0.25em] text-sidebar-primary">Preço</span>
          <h2 className="mt-3 font-display text-5xl leading-tight md:text-6xl">
            R$ {BASE_PRICE}<span className="text-2xl text-muted-foreground">/mês por unidade</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Plano base com o essencial. Ative módulos adicionais só quando fizer sentido.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/montar"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Monte seu Paladino
            </Link>
            <Link
              to="/precos"
              className="rounded-md border border-border bg-background px-6 py-3 text-sm hover:bg-muted"
            >
              Ver detalhes de preços
            </Link>
          </div>
          <ul className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {["Sem cartão", "Sem fidelidade", "Cancele quando quiser", "Suporte em português"].map((f) => (
              <li key={f} className="inline-flex items-center gap-1">
                <Check size={12} className="text-sidebar-primary" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="rounded-2xl border border-sidebar-primary/40 bg-card p-10 text-center">
          <h2 className="font-display text-5xl leading-tight md:text-6xl">
            Pronto para começar?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Configure sua plataforma em minutos escolhendo apenas o que você precisa.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/montar"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Monte seu Paladino <ArrowRight size={14} />
            </Link>
            <Link
              to="/login"
              className="rounded-md border border-border bg-background px-6 py-3 text-sm hover:bg-muted"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
