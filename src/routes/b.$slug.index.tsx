import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin, Phone, Star, CreditCard,
  Instagram, Facebook, MessageCircle, ChevronRight, Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/app/empty-state";
import { CatalogTabs, type CatalogTabKey } from "@/components/booking/catalog-tabs";
import { ServiceCard } from "@/components/booking/service-card";
import { PackageCard } from "@/components/booking/package-card";
import { SubscriptionCard } from "@/components/booking/subscription-card";
import { ProductCard } from "@/components/booking/product-card";
import { PromotionCard } from "@/components/booking/promotion-card";
import { bookingApi } from "@/lib/booking/api";
import paladinoWordmark from "@/assets/paladino-wordmark-tight.png";

export const Route = createFileRoute("/b/$slug/")({
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

  const profileQ = useQuery({
    queryKey: ["booking", slug, "profile"],
    queryFn: () => bookingApi.getProfile(slug),
    retry: false,
  });
  const servicesQ = useQuery({
    queryKey: ["booking", slug, "services"],
    queryFn: () => bookingApi.listServices(slug),
    enabled: profileQ.isSuccess,
  });
  const packagesQ = useQuery({
    queryKey: ["booking", slug, "packages"],
    queryFn: () => bookingApi.listPackages(slug),
    enabled: profileQ.isSuccess,
  });
  const subscriptionsQ = useQuery({
    queryKey: ["booking", slug, "subscriptions"],
    queryFn: () => bookingApi.listSubscriptions(slug),
    enabled: profileQ.isSuccess,
  });
  const productsQ = useQuery({
    queryKey: ["booking", slug, "products"],
    queryFn: () => bookingApi.listProducts(slug),
    enabled: profileQ.isSuccess,
  });
  const promotionsQ = useQuery({
    queryKey: ["booking", slug, "promotions"],
    queryFn: () => bookingApi.listPromotions(slug),
    enabled: profileQ.isSuccess,
  });

  if (profileQ.isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Carregando...</div>;
  }
  const shop = profileQ.data;
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

  const panels: Record<CatalogTabKey, React.ReactNode> = {
    servicos: (
      <QueryGrid
        query={servicesQ}
        emptyTitle="Nenhum serviço disponível"
        skeletonVariant="row"
        render={(items) => (
          <div className="grid gap-3">
            {items.map((s) => (
              <ServiceCard key={s.id} service={s} onBook={bookService} />
            ))}
          </div>
        )}
      />
    ),
    pacotes: (
      <QueryGrid
        query={packagesQ}
        emptyTitle="Nenhum pacote disponível"
        render={(items) => (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => <PackageCard key={p.id} pkg={p} />)}
          </div>
        )}
      />
    ),
    assinaturas: (
      <QueryGrid
        query={subscriptionsQ}
        emptyTitle="Nenhuma assinatura disponível"
        render={(items) => (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => <SubscriptionCard key={p.id} plan={p} />)}
          </div>
        )}
      />
    ),
    produtos: (
      <QueryGrid
        query={productsQ}
        emptyTitle="Nenhum produto disponível"
        render={(items) => (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      />
    ),
    promocoes: (
      <QueryGrid
        query={promotionsQ}
        emptyTitle="Nenhuma promoção ativa"
        emptyIcon={<Sparkles size={28} strokeWidth={1.5} />}
        render={(items) => (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => <PromotionCard key={p.id} promo={p} />)}
          </div>
        )}
      />
    ),
    avaliacoes: (
      <EmptyState
        icon={<Star size={28} strokeWidth={1.5} />}
        title="Avaliações em breve"
        description="Em breve você poderá ler e deixar avaliações sobre o atendimento."
      />
    ),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img
              src={paladinoWordmark}
              alt="Paladino"
              className="h-12 md:h-14 w-auto object-contain brightness-110 contrast-110 drop-shadow-sm"
            />
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
                  <Star size={16} className="fill-primary text-primary" />
                  <span className="font-medium text-foreground">{shop.rating.toFixed(1)}</span>
                  {shop.reviews_count && <span>· {shop.reviews_count} avaliações</span>}
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
                <ChevronRight size={16} className="ml-1" />
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

          <TooltipProvider delayDuration={200}>
            <CatalogTabs panels={panels} />
          </TooltipProvider>
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
              <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
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
                  <CreditCard size={12} /> {p}
                </span>
              ))}
            </div>
          </InfoCard>

          <InfoCard title="Contato">
            <a href={`tel:${shop.phone.replace(/\D/g, "")}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
              <Phone size={16} className="text-primary" />
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
                  <Icon size={16} />
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

function QueryGrid<T>({
  query,
  render,
  emptyTitle,
  emptyIcon,
  skeletonVariant = "card",
}: {
  query: { isLoading: boolean; isError: boolean; data: T[] | undefined; refetch: () => void };
  render: (items: T[]) => React.ReactNode;
  emptyTitle: string;
  emptyIcon?: React.ReactNode;
  skeletonVariant?: "card" | "row";
}) {
  if (query.isLoading) {
    if (skeletonVariant === "row") {
      return (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center text-sm">
        <p className="text-destructive">Não foi possível carregar.</p>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => query.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }
  const items = query.data ?? [];
  if (items.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} />;
  }
  return <>{render(items)}</>;
}