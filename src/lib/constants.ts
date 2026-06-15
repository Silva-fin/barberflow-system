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