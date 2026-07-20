import {
  Calendar, Users, Store, Wallet, BarChart3, ShoppingBag, Package, Boxes,
  Tags, HeartHandshake, Star, ListOrdered, Bot, Link2, MessageCircle,
  Percent, Building2, ShieldCheck, UserCircle, FileBarChart, Warehouse,
  Receipt, CreditCard, Landmark, type LucideIcon,
} from "lucide-react";

export type ModuleCategory =
  | "core"
  | "operacao"
  | "financeiro"
  | "clientes"
  | "crescimento"
  | "plataforma";

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  core: "Núcleo",
  operacao: "Operação",
  financeiro: "Financeiro",
  clientes: "Clientes",
  crescimento: "Crescimento",
  plataforma: "Plataforma",
};

export type CatalogModule = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  category: ModuleCategory;
  /** Núcleo obrigatório — sempre incluso, não desmarcável. */
  core: boolean;
  features: string[];
  /** Rotas do próprio app para "ver no produto". */
  screens?: { label: string; to: string }[];
  dependsOn?: string[];
  /** Preço incremental mock (R$/mês). Núcleos contam no plano base. */
  price: number;
};

export const BASE_PRICE = 149;

export const CATALOG: CatalogModule[] = [
  // ===== Núcleo =====
  {
    slug: "agenda", name: "Agenda", category: "core", core: true, price: 0,
    icon: Calendar,
    tagline: "Calendário por profissional com slots automáticos.",
    description:
      "Central de agendamentos com visões por dia, semana e profissional. Bloqueios, encaixes e regras de horário por serviço, tudo em uma interface pensada para atender rápido no balcão.",
    features: [
      "Visão por profissional, dia e semana",
      "Bloqueios, folgas e horários especiais",
      "Encaixes e reagendamento em um clique",
      "Integração com Fila de espera",
    ],
    screens: [{ label: "Ver agenda", to: "/agenda" }, { label: "Novo agendamento", to: "/agenda/novo" }],
  },
  {
    slug: "clientes", name: "Clientes", category: "core", core: true, price: 0,
    icon: Users,
    tagline: "Cadastro completo com histórico e preferências.",
    description:
      "Ficha do cliente com histórico de atendimentos, preferências, saldo de pacotes e comunicação. Base para todo o restante do produto.",
    features: [
      "Histórico completo de atendimentos",
      "Preferências, alergias e observações",
      "Saldo de pacotes e assinaturas",
      "Consentimentos LGPD",
    ],
    screens: [{ label: "Ver clientes", to: "/clientes" }],
  },
  {
    slug: "operacoes", name: "Operações", category: "core", core: true, price: 0,
    icon: ListOrdered,
    tagline: "O dia a dia da barbearia em uma tela.",
    description:
      "Lista dinâmica de atendimentos em andamento, concluídos e pendentes. Aciona pagamentos, comissões e comunicação sem sair da tela.",
    features: [
      "Fluxo do atendimento em tempo real",
      "Ações rápidas de pagamento",
      "Histórico por dia e profissional",
    ],
    screens: [{ label: "Ver operações", to: "/operacoes" }],
  },

  // ===== Operação =====
  {
    slug: "estoque", name: "Estoque", category: "operacao", core: false, price: 39,
    icon: Warehouse,
    tagline: "Controle de produtos, entradas e movimentações.",
    description:
      "Gestão de produtos revendidos e insumos internos. Movimentações por venda, uso, perda e ajuste, com alertas de saldo mínimo.",
    features: [
      "Cadastro de produtos e insumos",
      "Entradas, saídas e ajustes",
      "Alertas de saldo mínimo",
      "Custo médio automático",
    ],
    screens: [{ label: "Ver estoque", to: "/estoque" }, { label: "Movimentações", to: "/estoque/movimentacoes" }],
  },
  {
    slug: "comissoes", name: "Comissões", category: "operacao", core: false, price: 49,
    icon: Percent,
    tagline: "Cálculo automático por profissional.",
    description:
      "Regras flexíveis por serviço, produto e faixa. Fechamento por período com histórico e pagamentos rastreáveis.",
    features: [
      "Regras por serviço, produto e categoria",
      "Fechamento e histórico por período",
      "Pagamentos com comprovante",
    ],
    screens: [
      { label: "Hub de comissões", to: "/comissoes" },
      { label: "Regras", to: "/comissoes/regras" },
      { label: "Pagamentos", to: "/comissoes/pagamentos" },
    ],
    dependsOn: [],
  },
  {
    slug: "fila", name: "Fila de espera", category: "operacao", core: false, price: 19,
    icon: ListOrdered,
    tagline: "Fila com avisos automáticos por WhatsApp.",
    description:
      "Cliente entra na fila e recebe posição em tempo real. Notificação automática quando abre um horário compatível.",
    features: [
      "Fila por profissional ou serviço",
      "Notificação automática de vaga",
      "Priorização por VIP e assinatura",
    ],
    screens: [{ label: "Ver fila", to: "/fila" }],
  },
  {
    slug: "caixa", name: "Caixa", category: "operacao", core: false, price: 29,
    icon: Landmark,
    tagline: "Movimentações e contagem do dia.",
    description:
      "Abertura, sangria, reforço e fechamento com contagem física. Divergências destacadas e resolução com auditoria.",
    features: [
      "Abertura e fechamento diário",
      "Sangria e reforço",
      "Contagem física com divergência",
    ],
    screens: [{ label: "Ver caixa", to: "/caixa" }],
  },

  // ===== Financeiro =====
  {
    slug: "pagamentos", name: "Pagamentos", category: "financeiro", core: true, price: 0,
    icon: CreditCard,
    tagline: "Cobranças e recebimentos consolidados.",
    description:
      "Registre pagamentos por Pix, cartão, dinheiro e link. Parcelamento, estorno e conciliação automáticas.",
    features: [
      "Múltiplos métodos e parcelamentos",
      "Estornos e ajustes",
      "Conciliação com adquirente",
    ],
    screens: [{ label: "Ver pagamentos", to: "/pagamentos" }],
  },
  {
    slug: "financeiro", name: "Financeiro completo", category: "financeiro", core: false, price: 79,
    icon: BarChart3,
    tagline: "Contas, extrato, conciliação e DRE.",
    description:
      "Plano de contas, extrato multiconta, conciliação bancária e DRE por período. Fecha o mês em minutos.",
    features: [
      "Contas a pagar e receber",
      "Extrato multiconta",
      "Conciliação bancária",
      "DRE por competência",
    ],
    screens: [
      { label: "Extrato", to: "/financeiro/extrato" },
      { label: "Contas", to: "/financeiro/contas" },
      { label: "DRE", to: "/financeiro/dre" },
    ],
  },
  {
    slug: "despesas", name: "Despesas", category: "financeiro", core: false, price: 19,
    icon: Receipt,
    tagline: "Categorize e acompanhe custos fixos e variáveis.",
    description:
      "Lançamento de despesas com categorias, anexos e parcelamento. Alimenta o DRE automaticamente.",
    features: [
      "Categorias e centros de custo",
      "Anexo de comprovante",
      "Parcelamento e recorrência",
    ],
    screens: [{ label: "Ver despesas", to: "/despesas" }],
  },
  {
    slug: "taxas", name: "Taxas & tarifas", category: "financeiro", core: false, price: 0,
    icon: Percent,
    tagline: "Configure taxas por método de pagamento.",
    description:
      "Taxas por adquirente, bandeira e parcelamento aplicadas automaticamente ao registrar pagamentos.",
    features: [
      "Por adquirente e método",
      "Prazos de recebimento",
      "Descontadas do líquido",
    ],
    screens: [{ label: "Ver taxas", to: "/configuracoes/taxas" }],
  },

  // ===== Clientes =====
  {
    slug: "pacotes", name: "Pacotes", category: "clientes", core: false, price: 29,
    icon: Package,
    tagline: "Pacotes pré-pagos com saldo por cliente.",
    description:
      "Venda pacotes de serviços com saldo, validade e regras de consumo. Cliente acompanha pelo Portal.",
    features: [
      "Saldo por cliente e serviço",
      "Validade e política de expiração",
      "Consumo automático no atendimento",
    ],
    screens: [{ label: "Pacotes", to: "/pacotes" }],
  },
  {
    slug: "assinaturas", name: "Assinaturas", category: "clientes", core: false, price: 49,
    icon: Boxes,
    tagline: "Planos recorrentes com cobrança automática.",
    description:
      "Planos mensais com cotas de serviços e produtos. Pausa, retomada e cancelamento auto-atendidos pelo cliente.",
    features: [
      "Cotas de serviços e produtos",
      "Cobrança recorrente",
      "Pausa e retomada",
    ],
    screens: [{ label: "Assinaturas", to: "/assinaturas" }, { label: "Planos", to: "/assinaturas/planos" }],
    dependsOn: ["pagamentos"],
  },
  {
    slug: "portal-cliente", name: "Portal do cliente", category: "clientes", core: false, price: 0,
    icon: UserCircle,
    tagline: "Área logada para seus clientes.",
    description:
      "Home unificada por cliente com agendamentos, pacotes, assinaturas, produtos, cupons e pagamentos — de todas as unidades.",
    features: [
      "Multi-empresa por cliente",
      "Auto-atendimento",
      "Consentimentos LGPD",
    ],
    screens: [{ label: "Ver portal", to: "/portal" }],
  },
  {
    slug: "crm", name: "CRM", category: "clientes", core: false, price: 39,
    icon: HeartHandshake,
    tagline: "Segmentação e jornada do cliente.",
    description:
      "Classificação por RFV, tags e listas dinâmicas. Identifica clientes em risco e oportunidades de upsell.",
    features: [
      "Segmentos dinâmicos",
      "Clientes em risco",
      "Tags e listas",
    ],
    screens: [{ label: "Ver CRM", to: "/crm" }],
  },

  // ===== Crescimento =====
  {
    slug: "vitrine", name: "Vitrine pública", category: "crescimento", core: false, price: 0,
    icon: Store,
    tagline: "Página pública com agendamento online.",
    description:
      "URL própria com catálogo de serviços, pacotes, assinaturas, produtos e promoções. Checkout unificado com carrinho.",
    features: [
      "URL própria por unidade",
      "Carrinho e checkout unificado",
      "Cross-sell contextual",
    ],
    screens: [{ label: "Ver vitrine demo", to: "/b/barbearia-do-zeca" }],
  },
  {
    slug: "promocoes", name: "Promoções & cupons", category: "crescimento", core: false, price: 29,
    icon: Tags,
    tagline: "Campanhas automáticas e cupons rastreáveis.",
    description:
      "Regras de desconto por serviço, categoria e cliente. Cupons individuais ou em lote com relatório de uso.",
    features: [
      "Automáticas ou por cupom",
      "Cupom único ou em lote",
      "Relatório de uso",
    ],
    screens: [{ label: "Ver promoções", to: "/promocoes" }],
  },
  {
    slug: "nps", name: "NPS", category: "crescimento", core: false, price: 19,
    icon: Star,
    tagline: "Pesquisas de satisfação pós-atendimento.",
    description:
      "Envio automático de pesquisa após o atendimento, com alerta para notas baixas e resposta do gestor.",
    features: [
      "Envio automatizado",
      "Alerta de nota baixa",
      "Resposta do gestor",
    ],
    screens: [{ label: "Ver NPS", to: "/nps" }],
  },
  {
    slug: "comunicacao", name: "Comunicação", category: "crescimento", core: false, price: 29,
    icon: MessageCircle,
    tagline: "Templates de WhatsApp, e-mail e SMS.",
    description:
      "Templates por evento (confirmação, lembrete, pós-atendimento) com variáveis e logs de envio.",
    features: [
      "Templates por evento",
      "Multi-canal",
      "Logs e diagnóstico",
    ],
    screens: [{ label: "Templates", to: "/comunicacao" }, { label: "Logs", to: "/comunicacao/logs" }],
  },
  {
    slug: "bot-whatsapp", name: "Bot WhatsApp", category: "crescimento", core: false, price: 59,
    icon: Bot,
    tagline: "Atendimento automatizado no WhatsApp.",
    description:
      "Bot conversacional que agenda, confirma e responde dúvidas frequentes. Escala para humano quando necessário.",
    features: [
      "Agendamento por conversa",
      "Confirmação automática",
      "Escalada para humano",
    ],
    dependsOn: ["comunicacao"],
  },

  // ===== Plataforma =====
  {
    slug: "relatorios", name: "Relatórios", category: "plataforma", core: true, price: 0,
    icon: FileBarChart,
    tagline: "Indicadores de receita, margem e ocupação.",
    description:
      "Painéis de receita, despesa, margem, ocupação e ranking de profissionais. Exportação para planilha.",
    features: [
      "Receita e margem",
      "Ocupação por profissional",
      "Ranking de serviços",
    ],
    screens: [{ label: "Ver relatórios", to: "/relatorios" }],
  },
  {
    slug: "multi-empresa", name: "Multi-empresa", category: "plataforma", core: false, price: 79,
    icon: Building2,
    tagline: "Gerencie várias unidades em uma conta.",
    description:
      "Rede com contas separadas por unidade, consolidação financeira e permissões por unidade.",
    features: [
      "Contas por unidade",
      "Consolidação de indicadores",
      "Permissões por unidade",
    ],
  },
  {
    slug: "usuarios", name: "Usuários & permissões", category: "plataforma", core: true, price: 0,
    icon: ShieldCheck,
    tagline: "Papéis, convites e auditoria de acessos.",
    description:
      "Papéis pré-definidos (Owner, Admin, Operador, Profissional), convites por e-mail e auditoria completa.",
    features: [
      "Papéis pré-definidos",
      "Convite por e-mail",
      "Auditoria de ações",
    ],
    screens: [{ label: "Usuários", to: "/usuarios" }, { label: "Auditoria", to: "/audit" }],
  },
  {
    slug: "link-publico", name: "Links públicos", category: "plataforma", core: false, price: 0,
    icon: Link2,
    tagline: "Manage e NPS sem login.",
    description:
      "Links seguros e temporários para o cliente gerenciar agendamento e responder pesquisa sem criar conta.",
    features: [
      "Gestão de agendamento por token",
      "Resposta de NPS sem login",
    ],
  },
  {
    slug: "caixa-online", name: "Loja de produtos", category: "crescimento", core: false, price: 19,
    icon: ShoppingBag,
    tagline: "Venda produtos pela vitrine.",
    description:
      "Ative a aba de produtos na vitrine pública com reserva por WhatsApp ou checkout unificado.",
    features: [
      "Aba na vitrine",
      "Reserva ou checkout",
      "Baixa automática no estoque",
    ],
    dependsOn: ["estoque", "vitrine"],
  },
  {
    slug: "carteiras", name: "Contas & carteiras", category: "financeiro", core: false, price: 19,
    icon: Wallet,
    tagline: "Múltiplas contas bancárias e caixas.",
    description:
      "Cadastre caixas, contas bancárias e adquirentes. Transferências entre contas e saldo em tempo real.",
    features: [
      "Múltiplas contas",
      "Transferências",
      "Saldo em tempo real",
    ],
  },
];

export const CATALOG_BY_SLUG = new Map(CATALOG.map((m) => [m.slug, m]));

/** Recomendações preset (slugs adicionais, além dos núcleos). */
export const PRESETS: { id: string; label: string; description: string; slugs: string[] }[] = [
  {
    id: "solo",
    label: "Barbearia solo",
    description: "Um profissional, foco em atender e receber.",
    slugs: ["comissoes", "vitrine", "comunicacao", "promocoes"],
  },
  {
    id: "casa",
    label: "Casa com equipe",
    description: "3-10 profissionais, com pacotes e estoque.",
    slugs: ["comissoes", "estoque", "pacotes", "vitrine", "comunicacao", "promocoes", "nps", "fila", "caixa"],
  },
  {
    id: "rede",
    label: "Rede multi-unidade",
    description: "Operação de várias unidades com financeiro completo.",
    slugs: [
      "comissoes", "estoque", "pacotes", "assinaturas", "vitrine",
      "comunicacao", "promocoes", "nps", "fila", "caixa",
      "financeiro", "despesas", "crm", "multi-empresa", "bot-whatsapp",
    ],
  },
];

export function coreSlugs(): string[] {
  return CATALOG.filter((m) => m.core).map((m) => m.slug);
}

/** Resolve dependências transitivas. */
export function withDependencies(slugs: string[]): string[] {
  const out = new Set(slugs);
  let changed = true;
  while (changed) {
    changed = false;
    for (const s of Array.from(out)) {
      const m = CATALOG_BY_SLUG.get(s);
      m?.dependsOn?.forEach((d) => {
        if (!out.has(d)) { out.add(d); changed = true; }
      });
    }
  }
  return Array.from(out);
}

/** Módulos que dependem de `slug`. */
export function reverseDependents(slug: string): string[] {
  return CATALOG.filter((m) => m.dependsOn?.includes(slug)).map((m) => m.slug);
}

export function priceOf(slugs: string[]): number {
  const set = new Set(slugs);
  let total = BASE_PRICE;
  for (const m of CATALOG) {
    if (m.core) continue;
    if (set.has(m.slug)) total += m.price;
  }
  return total;
}