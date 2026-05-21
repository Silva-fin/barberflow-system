import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Clock, MapPin, Phone, Scissors, Star, CreditCard,
  Instagram, Facebook, MessageCircle, ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBRL } from "@/lib/format";
import paladinoWordmark from "@/assets/paladino-wordmark.png";

export const Route = createFileRoute("/b/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Agendar pela Paladino` },
      { name: "description", content: "Conheça a barbearia, escolha o serviço e agende online em segundos." },
    ],
  }),
  component: ShopProfilePage,
});

const WEEKDAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function ShopProfilePage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();

  const { data: shop, isLoading } = useQuery({ queryKey: ["shop", slug], queryFn: () => api.getBarbershopBySlug(slug) });
  const { data: services = [] } = useQuery({
    queryKey: ["services-pub", shop?.id], queryFn: () => api.listServices(shop!.id), enabled: !!shop,
  });
  const { data: barbers = [] } = useQuery({
    queryKey: ["barbers-pub", shop?.id], queryFn: () => api.listBarbers(shop!.id), enabled: !!shop,
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Carregando...</div>;
  }
  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-4xl">Barbearia não encontrada</h1>
          <p className="mt-2 text-muted-foreground">Verifique o link e tente novamente.</p>
        </div>
      </div>
    );
  }

  const photos = shop.photos ?? [];
  const hero = photos[0];
  const thumbs = photos.slice(1, 4);
  const extraPhotos = Math.max(0, photos.length - 4);
  const todayWeekday = new Date().getDay();

  const bookService = (serviceId: string) =>
    navigate({ to: "/b/$slug/agendar", params: { slug }, search: { service: serviceId } });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={paladinoWordmark} alt="Paladino" className="h-5 w-auto" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* MAIN COLUMN */}
        <main className="space-y-10">
          {/* Hero */}
          <section className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary font-display text-3xl">
              {shop.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-4xl tracking-wide leading-tight">{shop.name}</h1>
              {shop.rating && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-medium text-foreground">{shop.rating.toFixed(1)}</span>
                  {shop.reviewsCount && <span>· {shop.reviewsCount} avaliações</span>}
                </div>
              )}
              {shop.description && (
                <p className="mt-3 max-w-prose text-sm text-muted-foreground">{shop.description}</p>
              )}
              <Button
                size="lg"
                className="mt-5"
                onClick={() => navigate({ to: "/b/$slug/agendar", params: { slug }, search: {} })}
              >
                Agendar agora
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </section>

          {/* Gallery */}
          {hero && (
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
              <img
                src={hero}
                alt={`${shop.name} — ambiente`}
                className="h-80 w-full rounded-lg object-cover border border-border"
                loading="lazy"
              />
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-1">
                {thumbs.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`${shop.name} — ambiente ${i + 2}`}
                    className="h-24 sm:h-[calc((20rem-1.5rem)/3)] w-full rounded-lg object-cover border border-border"
                    loading="lazy"
                  />
                ))}
                {extraPhotos > 0 && (
                  <div className="hidden sm:flex h-[calc((20rem-1.5rem)/3)] items-center justify-center rounded-lg border border-dashed border-border text-xs uppercase tracking-widest text-muted-foreground">
                    +{extraPhotos} fotos
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Tabs */}
          <Tabs defaultValue="services" className="w-full">
            <TabsList>
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="barbers">Profissionais</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-6">
              <div className="grid gap-3">
                {services.map(s => (
                  <article
                    key={s.id}
                    className="rounded-lg border border-border bg-card p-5 flex items-center gap-4 transition-colors hover:border-primary/60"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Scissors className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{s.name}</h3>
                      {s.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {s.durationMin} min
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-display text-lg text-primary">{formatBRL(s.priceCents)}</span>
                      <Button size="sm" onClick={() => bookService(s.id)}>Agendar</Button>
                    </div>
                  </article>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="barbers" className="mt-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {barbers.map(b => (
                  <article key={b.id} className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {b.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.specialties.join(" · ")}</p>
                    </div>
                  </article>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Avaliações em breve.
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* SIDE COLUMN */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <InfoCard title="Localização">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2 text-sm hover:text-primary transition-colors"
            >
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>{shop.address}</span>
            </a>
          </InfoCard>

          {shop.hours && shop.hours.length > 0 && (
            <InfoCard title="Horário de atendimento">
              <ul className="space-y-1.5 text-sm">
                {shop.hours.map(h => {
                  const today = h.weekday === todayWeekday;
                  return (
                    <li key={h.weekday} className="flex items-center justify-between">
                      <span className={`${today ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {WEEKDAY_LABELS[h.weekday]}
                        {today && (
                          <Badge variant="outline" className="ml-2 border-primary/50 text-[9px] text-primary px-1 py-0">
                            Hoje
                          </Badge>
                        )}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{h.open} – {h.close}</span>
                    </li>
                  );
                })}
              </ul>
            </InfoCard>
          )}

          <InfoCard title="Formas de pagamento">
            <div className="flex flex-wrap gap-2">
              {["Dinheiro", "Pix", "Crédito", "Débito"].map(p => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  <CreditCard className="h-3 w-3" /> {p}
                </span>
              ))}
            </div>
          </InfoCard>

          <InfoCard title="Contato">
            <a href={`tel:${shop.phone.replace(/\D/g, "")}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
              <Phone className="h-4 w-4 text-primary" />
              {shop.phone}
            </a>
          </InfoCard>

          <InfoCard title="Redes sociais">
            <div className="flex gap-3">
              {[Instagram, Facebook, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  aria-label="Rede social"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </InfoCard>
        </aside>
      </div>

      <footer className="border-t border-border mt-10 py-6">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs text-muted-foreground">
          Powered by <Link to="/" className="text-primary hover:underline">Paladino</Link>
        </div>
      </footer>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{title}</h2>
      {children}
    </section>
  );
}