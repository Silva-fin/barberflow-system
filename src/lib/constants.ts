export const DISCOUNT_TYPE = {
  PERCENTAGE: "Percentual",
  FIXED_AMOUNT: "Valor fixo",
  OVERRIDE_PRICE: "Preço fixo",
  FREE_ITEM: "Item grátis",
} as const;
export type DiscountType = keyof typeof DISCOUNT_TYPE;

export const APPLICATION_MODE = {
  AUTOMATIC: "Automática",
  COUPON_REQUIRED: "Requer cupom",
} as const;
export type ApplicationMode = keyof typeof APPLICATION_MODE;

export const GENERATION_TYPE = {
  BULK: "Em lote",
  SINGLE_USE: "Uso único",
  PER_CUSTOMER: "Por cliente",
} as const;
export type GenerationType = keyof typeof GENERATION_TYPE;

export const COUPON_REOPEN = {
  NEVER_REOPEN: "Não reabrir",
  REOPEN_ON_REFUND: "Reabrir no estorno",
} as const;
export type CouponReopenPolicy = keyof typeof COUPON_REOPEN;

export const ENTITY_TYPE = {
  SERVICE: "Serviço",
  PRODUCT: "Produto",
  EXPENSE: "Despesa",
} as const;
export type EntityType = keyof typeof ENTITY_TYPE;

export const PAYMENT_METHOD_OPTIONS = [
  {
    group: "Dinheiro / Pix",
    options: [
      { value: "CASH", label: "Dinheiro" },
      { value: "PIX", label: "Pix" },
    ],
  },
  {
    group: "Crédito",
    options: [
      { value: "CREDIT_CARD", label: "Cartão de crédito" },
      { value: "CREDIT_LINK", label: "Link de crédito" },
    ],
  },
  {
    group: "Débito",
    options: [
      { value: "DEBIT_CARD", label: "Cartão de débito" },
      { value: "TRANSFER", label: "Transferência" },
    ],
  },
] as const;

export type PaymentMethodValue =
  (typeof PAYMENT_METHOD_OPTIONS)[number]["options"][number]["value"];

/* ============ FASE 3 — Financeiro profundo ============ */

export const EXPENSE_STATUS = {
  PENDENTE: "Pendente",
  PAGA: "Paga",
  CANCELLED: "Cancelada",
} as const;
export type ExpenseStatus = keyof typeof EXPENSE_STATUS;

export const PAYABLE_STATUS = {
  OPEN: "Em aberto",
  PARTIALLY_PAID: "Parcial",
  PAID: "Paga",
  CANCELLED: "Cancelada",
} as const;
export type PayableStatus = keyof typeof PAYABLE_STATUS;

export const INSTALLMENT_STATUS = {
  OPEN: "Em aberto",
  PAID: "Paga",
  CANCELLED: "Cancelada",
} as const;
export type InstallmentStatus = keyof typeof INSTALLMENT_STATUS;

export const RECONCILIATION_STATUS = {
  OPEN: "Aberta",
  CLOSED: "Fechada",
} as const;
export type ReconciliationStatus = keyof typeof RECONCILIATION_STATUS;

export const STATEMENT_STATUS = {
  PENDING: "Pendente",
  MATCHED: "Conciliado",
  DISMISSED: "Dispensado",
} as const;
export type StatementStatus = keyof typeof STATEMENT_STATUS;

export const TRANSFER_STATUS = {
  REQUESTED: "Solicitada",
  COMPLETED: "Concluída",
  FAILED: "Falhou",
} as const;
export type TransferStatus = keyof typeof TRANSFER_STATUS;

export const STOCK_MOVEMENT_TYPE = {
  ENTRADA: "Entrada",
  VENDA: "Venda",
  USO_INTERNO: "Uso interno",
  PERDA: "Perda",
  AJUSTE: "Ajuste",
} as const;
export type StockMovementType = keyof typeof STOCK_MOVEMENT_TYPE;

export const ACCOUNT_TYPE = {
  CAIXA: "Caixa",
  ACQUIRER: "Adquirente",
  BANK: "Banco",
  ESCROW: "Conta garantia",
} as const;
export type AccountType = keyof typeof ACCOUNT_TYPE;

export const MOVEMENT_TYPE = {
  INFLOW: "Entrada",
  OUTFLOW: "Saída",
  TRANSFER_IN: "Transf. recebida",
  TRANSFER_OUT: "Transf. enviada",
} as const;
export type MovementType = keyof typeof MOVEMENT_TYPE;

export const ENTRY_TYPE = {
  RECEITA: "Receita",
  CUSTO: "Custo",
  DESPESA: "Despesa",
  TAXA: "Taxa",
  COMISSAO: "Comissão",
  ESTORNO: "Estorno",
  AJUSTE: "Ajuste",
} as const;
export type EntryType = keyof typeof ENTRY_TYPE;

export const CLOSING_METHOD = {
  CASH_AT_CREATION: "À vista",
  INSTALLMENTS: "Parcelado",
} as const;
export type ClosingMethod = keyof typeof CLOSING_METHOD;

export const CASH_COUNT_RESOLUTION = {
  ADJUSTED: "Com ajuste",
  NO_ADJUSTMENT: "Sem ajuste",
} as const;
export type CashCountResolution = keyof typeof CASH_COUNT_RESOLUTION;

/** Categoria → label. Bucket inferido pelo prefixo no map abaixo. */
export const ENTRY_CATEGORY = {
  // RECEITA
  SERVICO_PRESTADO: "Serviço prestado",
  PRODUTO_VENDIDO: "Produto vendido",
  PACOTE_VENDIDO: "Pacote vendido",
  ASSINATURA: "Assinatura",
  // CUSTO
  CUSTO_PRODUTO: "Custo de produto",
  CUSTO_INSUMO: "Custo de insumo",
  // DESPESA
  ALUGUEL: "Aluguel",
  UTILITIES: "Água/Luz/Internet",
  MARKETING: "Marketing",
  SOFTWARE: "Software",
  CONTABILIDADE: "Contabilidade",
  LIMPEZA: "Limpeza",
  MANUTENCAO: "Manutenção",
  SALARIO: "Salário",
  SERVICOS_PJ: "Serviços PJ",
  ALIMENTACAO_COPA: "Alimentação/Copa",
  EQUIPAMENTOS: "Equipamentos",
  TAXAS_BANCARIAS: "Taxas bancárias",
  TREINAMENTO: "Treinamento",
  DESPESA_OUTROS: "Outros (despesa)",
  // TAXA
  TAXA_CARTAO: "Taxa de cartão",
  TAXA_PIX: "Taxa de Pix",
  // COMISSAO
  COMISSAO_PROFISSIONAL: "Comissão profissional",
  // ESTORNO
  ESTORNO_CLIENTE: "Estorno ao cliente",
  // AJUSTE
  AJUSTE_MANUAL: "Ajuste manual",
} as const;
export type EntryCategoryKey = keyof typeof ENTRY_CATEGORY;

export const EXPENSE_CATEGORY_KEYS: EntryCategoryKey[] = [
  "ALUGUEL", "UTILITIES", "MARKETING", "SOFTWARE", "CONTABILIDADE",
  "LIMPEZA", "MANUTENCAO", "SALARIO", "SERVICOS_PJ", "ALIMENTACAO_COPA",
  "EQUIPAMENTOS", "TAXAS_BANCARIAS", "TREINAMENTO", "DESPESA_OUTROS",
];