import type {
  Package, Promotion, PublicProduct, PublicProfile, PublicService, SubscriptionPlan,
} from "./types";

const SLUG = "barbearia-do-zeca";

const profile: PublicProfile = {
  slug: SLUG,
  name: "Barbearia do Zeca",
  description: "Tradição e estilo desde 1998. Cortes clássicos e modernos.",
  address: "Rua Augusta, 1500 — São Paulo, SP",
  phone: "(11) 99876-5432",
  whatsapp: "5511998765432",
  rating: 4.9,
  reviews_count: 218,
  photos: [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80",
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80",
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
    "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=800&q=80",
  ],
  hours: [
    { weekday: 1, open: "09:00", close: "19:00" },
    { weekday: 2, open: "09:00", close: "19:00" },
    { weekday: 3, open: "09:00", close: "19:00" },
    { weekday: 4, open: "09:00", close: "20:00" },
    { weekday: 5, open: "09:00", close: "20:00" },
    { weekday: 6, open: "09:00", close: "18:00" },
  ],
  socials: {
    instagram: "https://instagram.com/barbeariadozeca",
    facebook: "https://facebook.com/barbeariadozeca",
    whatsapp: "https://wa.me/5511998765432",
  },
};

const services: PublicService[] = [
  { id: "s-1", name: "Corte masculino", description: "Corte na máquina e tesoura", duration_min: 30, price_cents: 5000 },
  { id: "s-2", name: "Barba completa", description: "Toalha quente, óleo e navalha", duration_min: 30, price_cents: 4000 },
  { id: "s-3", name: "Corte + Barba", description: "Combo completo", duration_min: 60, price_cents: 8000 },
  { id: "s-4", name: "Degradê navalhado", description: "Acabamento na navalha", duration_min: 45, price_cents: 6500 },
  { id: "s-5", name: "Pigmentação", description: "Disfarce de falhas", duration_min: 60, price_cents: 9000 },
  { id: "s-6", name: "Corte infantil", description: "Até 10 anos", duration_min: 30, price_cents: 4000 },
];

const packages: Package[] = [
  {
    id: "pk-1",
    name: "Pacote Mensal Essencial",
    description: "Pra quem mantém o visual no ponto todo mês.",
    items: [
      { type: "service", name: "Corte masculino", quantity: 4 },
    ],
    total_cotas: 4,
    validity_days: 60,
    price_cents: 18000,
  },
  {
    id: "pk-2",
    name: "Pacote Combo",
    description: "Corte e barba em ritmo de assinatura, sem fidelidade.",
    items: [
      { type: "service", name: "Corte masculino", quantity: 3 },
      { type: "service", name: "Barba completa", quantity: 3 },
    ],
    total_cotas: 6,
    validity_days: 90,
    price_cents: 21000,
  },
  {
    id: "pk-3",
    name: "Kit Cuidados",
    description: "Serviços + produtos para levar pra casa.",
    items: [
      { type: "service", name: "Corte + Barba", quantity: 2 },
      { type: "product", name: "Pomada Modeladora", quantity: 1 },
      { type: "product", name: "Óleo de Barba", quantity: 1 },
    ],
    total_cotas: 4,
    validity_days: 120,
    price_cents: 24900,
  },
];

const subscriptions: SubscriptionPlan[] = [
  {
    id: "sub-1",
    name: "Clube Zeca Mensal",
    description: "Renovação automática todo mês.",
    items: [
      { type: "service", name: "Corte masculino", quantity: 2 },
      { type: "service", name: "Barba completa", quantity: 1 },
    ],
    total_cotas: 3,
    cycle: "monthly",
    price_cents: 12900,
  },
  {
    id: "sub-2",
    name: "Clube Zeca Trimestral",
    description: "3 meses pagos à vista, com bônus.",
    items: [
      { type: "service", name: "Corte + Barba", quantity: 6 },
      { type: "product", name: "Pomada Modeladora", quantity: 1 },
    ],
    total_cotas: 7,
    cycle: "quarterly",
    price_cents: 34900,
  },
];

const products: PublicProduct[] = [
  { id: "p-1", name: "Pomada Modeladora Matte", description: "Fixação forte, efeito seco", price_cents: 4990, stock: 12 },
  { id: "p-2", name: "Óleo para Barba 30ml", description: "Hidrata e amacia os fios", price_cents: 3590, stock: 8 },
  { id: "p-3", name: "Shampoo Anticaspa 250ml", description: "Uso diário", price_cents: 2990, stock: 0 },
  { id: "p-4", name: "Kit Navalha + Lâminas", description: "Acabamento profissional", price_cents: 7900, stock: 3 },
  { id: "p-5", name: "Talco Pós-Barba", description: "Sensação refrescante", price_cents: 1990, stock: 20 },
  { id: "p-6", name: "Cera Capilar 100g", description: "Brilho leve, reaplicável", price_cents: 4290, stock: 0 },
];

const promotions: Promotion[] = [
  {
    id: "pr-1",
    name: "Combo Corte + Barba com 10% off",
    description: "Desconto aplicado automaticamente ao agendar o combo.",
    kind: "auto",
    valid_until: "2026-12-31",
  },
  {
    id: "pr-2",
    name: "Segunda do Zeca",
    description: "Toda segunda-feira: 15% off em qualquer serviço.",
    kind: "auto",
    valid_until: "2026-12-31",
  },
  {
    id: "pr-3",
    name: "Indicação de amigo",
    description: "Ganhe R$ 10 de desconto no próximo atendimento.",
    kind: "coupon",
    coupon_code: "INDICA10",
    valid_until: "2026-09-30",
  },
];

export const bookingMock = {
  isKnownSlug: (slug: string) => slug === SLUG,
  profile,
  services,
  packages,
  subscriptions,
  products,
  promotions,
};