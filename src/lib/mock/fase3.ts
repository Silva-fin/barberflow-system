import type {
  ExpenseStatus, PayableStatus, InstallmentStatus, ReconciliationStatus,
  StatementStatus, TransferStatus, StockMovementType, AccountType, MovementType,
  EntryCategoryKey, ClosingMethod, CashCountResolution,
} from "@/lib/constants";

/* ============ Despesas ============ */
export type Expense = {
  id: string;
  description: string;
  category: EntryCategoryKey;
  amount: string;
  due_date: string;
  status: ExpenseStatus;
  supplier_id?: string | null;
  paid_at?: string | null;
  paid_amount?: string | null;
  parent_expense_id?: string | null;
  is_recurring?: boolean;
};

export const mockExpenses: Expense[] = [
  { id: "exp_1", description: "Aluguel — Janeiro", category: "ALUGUEL", amount: "4500.00", due_date: "2026-01-05T00:00:00", status: "PAGA", supplier_id: "sup_1", paid_at: "2026-01-04T11:20:00", paid_amount: "4500.00", is_recurring: true },
  { id: "exp_2", description: "Aluguel — Fevereiro", category: "ALUGUEL", amount: "4500.00", due_date: "2026-02-05T00:00:00", status: "PENDENTE", supplier_id: "sup_1", parent_expense_id: "exp_1", is_recurring: true },
  { id: "exp_3", description: "Energia elétrica", category: "UTILITIES", amount: "612.80", due_date: "2026-02-10T00:00:00", status: "PENDENTE" },
  { id: "exp_4", description: "Anúncios Instagram", category: "MARKETING", amount: "900.00", due_date: "2026-01-20T00:00:00", status: "PAGA", paid_at: "2026-01-19T15:00:00", paid_amount: "900.00" },
  { id: "exp_5", description: "Software de agenda", category: "SOFTWARE", amount: "189.00", due_date: "2026-02-01T00:00:00", status: "CANCELLED" },
  { id: "exp_6", description: "Manutenção cadeira", category: "MANUTENCAO", amount: "320.00", due_date: "2026-01-28T00:00:00", status: "PAGA", supplier_id: "sup_2", paid_at: "2026-01-28T09:00:00", paid_amount: "320.00" },
];

/* ============ Fornecedores ============ */
export type Supplier = {
  id: string; name: string; contact?: string | null; document?: string | null;
  active: boolean; created_at: string;
};
export const mockSuppliers: Supplier[] = [
  { id: "sup_1", name: "Imobiliária Centro", contact: "(11) 99876-1122", document: "12.345.678/0001-90", active: true, created_at: "2025-04-12T10:00:00" },
  { id: "sup_2", name: "Marcenaria Ribeiro", contact: "(11) 98123-4455", document: "445.621.910-23", active: true, created_at: "2025-06-02T10:00:00" },
  { id: "sup_3", name: "Distribuidora BellArt", contact: "comercial@bellart.com", document: "32.881.450/0001-12", active: true, created_at: "2025-08-22T10:00:00" },
  { id: "sup_4", name: "Insumos Velho", contact: "(11) 97700-1199", document: "21.776.301/0001-55", active: false, created_at: "2025-02-10T10:00:00" },
];
export const supplierName = (id?: string | null) =>
  mockSuppliers.find((s) => s.id === id)?.name ?? "—";

/* ============ Estoque ============ */
export type StockProduct = {
  id: string; name: string; active: boolean;
  stock?: string; stock_min_alert?: string; unit?: string; avg_cost?: string;
};
export const mockStockProducts: StockProduct[] = [
  { id: "prod_1", name: "Pomada modeladora 80g", active: true, stock: "32", stock_min_alert: "10", unit: "un", avg_cost: "18.40" },
  { id: "prod_2", name: "Shampoo barba 200ml", active: true, stock: "8", stock_min_alert: "10", unit: "un", avg_cost: "22.10" },
  { id: "prod_3", name: "Toalha descartável (pacote 50)", active: true, stock: "12", stock_min_alert: "5", unit: "pct", avg_cost: "34.00" },
  { id: "prod_4", name: "Óleo essencial 30ml", active: true, stock: "0", stock_min_alert: "3", unit: "un", avg_cost: "48.50" },
  { id: "prod_5", name: "Lâmina descartável (cx 100)", active: false, stock: "4", stock_min_alert: "2", unit: "cx", avg_cost: "62.00" },
];
export const productName = (id: string) =>
  mockStockProducts.find((p) => p.id === id)?.name ?? "—";

/* ============ Movimentações de estoque ============ */
export type StockMovement = {
  id: string; product_id: string; movement_type: StockMovementType;
  quantity: string; unit_cost?: string | null; occurred_at: string;
  source_type?: string | null; notes?: string | null;
};
export const mockStockMovements: StockMovement[] = [
  { id: "mv_1", product_id: "prod_1", movement_type: "ENTRADA", quantity: "20", unit_cost: "18.20", occurred_at: "2026-01-10T09:30:00", source_type: "SUPPLIER_ORDER", notes: "Pedido #ORD-021" },
  { id: "mv_2", product_id: "prod_1", movement_type: "VENDA", quantity: "3", unit_cost: "18.40", occurred_at: "2026-01-14T16:10:00", source_type: "OPERATION" },
  { id: "mv_3", product_id: "prod_2", movement_type: "VENDA", quantity: "2", unit_cost: "22.10", occurred_at: "2026-01-15T11:00:00", source_type: "OPERATION" },
  { id: "mv_4", product_id: "prod_3", movement_type: "USO_INTERNO", quantity: "4", occurred_at: "2026-01-18T09:00:00", notes: "Reposição estações" },
  { id: "mv_5", product_id: "prod_4", movement_type: "PERDA", quantity: "1", occurred_at: "2026-01-22T14:00:00", notes: "Vazamento" },
  { id: "mv_6", product_id: "prod_5", movement_type: "AJUSTE", quantity: "-2", occurred_at: "2026-01-25T17:00:00", notes: "Contagem trimestral" },
];

/* ============ Payables + parcelas ============ */
export type Payable = {
  id: string; description: string; supplier_id?: string | null;
  total_amount: string; paid_amount: string; status: PayableStatus;
  due_date?: string | null; closing_method: ClosingMethod;
  source_type?: "SUPPLIER_ORDER" | "MANUAL" | null;
  created_at: string;
};
export const mockPayables: Payable[] = [
  { id: "pay_1", description: "Pedido #ORD-021 — BellArt", supplier_id: "sup_3", total_amount: "1240.00", paid_amount: "0.00", status: "OPEN", closing_method: "INSTALLMENTS", source_type: "SUPPLIER_ORDER", created_at: "2026-01-10T09:30:00" },
  { id: "pay_2", description: "Manutenção cadeira", supplier_id: "sup_2", total_amount: "320.00", paid_amount: "320.00", status: "PAID", due_date: "2026-01-28T00:00:00", closing_method: "CASH_AT_CREATION", source_type: "MANUAL", created_at: "2026-01-26T10:00:00" },
  { id: "pay_3", description: "Pedido #ORD-019 — Insumos", supplier_id: "sup_3", total_amount: "880.00", paid_amount: "440.00", status: "PARTIALLY_PAID", closing_method: "INSTALLMENTS", source_type: "SUPPLIER_ORDER", created_at: "2025-12-12T11:00:00" },
  { id: "pay_4", description: "Consultoria contábil Jan", supplier_id: null, total_amount: "750.00", paid_amount: "0.00", status: "CANCELLED", due_date: "2026-01-30T00:00:00", closing_method: "CASH_AT_CREATION", source_type: "MANUAL", created_at: "2026-01-05T10:00:00" },
];

export type Installment = {
  id: string; payable_id: string; installment_number: number;
  amount: string; due_date: string; status: InstallmentStatus;
  paid_at?: string | null;
};
export const mockInstallments: Installment[] = [
  { id: "inst_1", payable_id: "pay_1", installment_number: 1, amount: "413.34", due_date: "2026-02-10T00:00:00", status: "OPEN" },
  { id: "inst_2", payable_id: "pay_1", installment_number: 2, amount: "413.33", due_date: "2026-03-10T00:00:00", status: "OPEN" },
  { id: "inst_3", payable_id: "pay_1", installment_number: 3, amount: "413.33", due_date: "2026-04-10T00:00:00", status: "OPEN" },
  { id: "inst_4", payable_id: "pay_3", installment_number: 1, amount: "440.00", due_date: "2026-01-12T00:00:00", status: "PAID", paid_at: "2026-01-12T14:00:00" },
  { id: "inst_5", payable_id: "pay_3", installment_number: 2, amount: "440.00", due_date: "2026-02-12T00:00:00", status: "OPEN" },
];

/* ============ Contas + saldos ============ */
export type Account = {
  id: string; name: string; type: AccountType; status: "ACTIVE" | "INACTIVE";
  provider?: string | null; external_ref?: string | null;
  is_default_inflow: boolean;
};
export const mockAccounts: Account[] = [
  { id: "acc_1", name: "Caixa loja", type: "CAIXA", status: "ACTIVE", is_default_inflow: false },
  { id: "acc_2", name: "Stone Adquirente", type: "ACQUIRER", status: "ACTIVE", provider: "Stone", external_ref: "MERCH-44210", is_default_inflow: true },
  { id: "acc_3", name: "Itaú Empresa", type: "BANK", status: "ACTIVE", provider: "Itaú", external_ref: "0341/12345-6", is_default_inflow: false },
  { id: "acc_4", name: "Conta garantia", type: "ESCROW", status: "ACTIVE", is_default_inflow: false },
];
export const accountBalance: Record<string, string> = {
  acc_1: "1842.50", acc_2: "9320.00", acc_3: "21455.10", acc_4: "1200.00",
};
export const accountName = (id: string) =>
  mockAccounts.find((a) => a.id === id)?.name ?? "—";

export const mockFinancialSettings = {
  provider: "Stone", accounts_count: 4,
};

/* ============ Transferências ============ */
export type Transfer = {
  id: string; from_account_id: string; to_account_id: string;
  amount: string; status: TransferStatus;
  requested_at: string; completed_at?: string | null;
  failure_reason?: string | null; notes?: string | null;
};
export const mockTransfers: Transfer[] = [
  { id: "tr_1", from_account_id: "acc_2", to_account_id: "acc_3", amount: "5000.00", status: "COMPLETED", requested_at: "2026-01-15T10:00:00", completed_at: "2026-01-15T10:01:12" },
  { id: "tr_2", from_account_id: "acc_1", to_account_id: "acc_3", amount: "1200.00", status: "REQUESTED", requested_at: "2026-02-02T09:30:00" },
  { id: "tr_3", from_account_id: "acc_3", to_account_id: "acc_1", amount: "400.00", status: "FAILED", requested_at: "2026-01-29T14:00:00", failure_reason: "Saldo insuficiente" },
];

/* ============ Movimentos por conta ============ */
export type AccountMovement = {
  id: string; account_id: string; type: MovementType;
  amount: string; occurred_at: string; source?: string | null;
  reconciled?: boolean;
};
export const mockAccountMovements: AccountMovement[] = [
  { id: "amv_1", account_id: "acc_2", type: "INFLOW", amount: "120.00", occurred_at: "2026-02-01T11:30:00", source: "Pagamento op #4421" },
  { id: "amv_2", account_id: "acc_2", type: "INFLOW", amount: "85.00", occurred_at: "2026-02-01T15:00:00", source: "Pagamento op #4422", reconciled: true },
  { id: "amv_3", account_id: "acc_2", type: "OUTFLOW", amount: "12.50", occurred_at: "2026-02-01T15:01:00", source: "Taxa cartão" },
  { id: "amv_4", account_id: "acc_3", type: "TRANSFER_IN", amount: "5000.00", occurred_at: "2026-01-15T10:01:12", source: "Transf. acc_2" },
  { id: "amv_5", account_id: "acc_3", type: "OUTFLOW", amount: "320.00", occurred_at: "2026-01-28T11:00:00", source: "Payable #pay_2", reconciled: true },
  { id: "amv_6", account_id: "acc_1", type: "INFLOW", amount: "230.00", occurred_at: "2026-02-02T13:00:00", source: "Caixa diário" },
];

/* ============ Conciliação ============ */
export type Reconciliation = {
  id: string; account_id: string; status: ReconciliationStatus;
  opened_at: string; closed_at?: string | null; notes?: string | null;
};
export const mockReconciliations: Reconciliation[] = [
  { id: "rec_1", account_id: "acc_2", status: "OPEN", opened_at: "2026-02-01T09:00:00" },
  { id: "rec_2", account_id: "acc_3", status: "CLOSED", opened_at: "2026-01-01T09:00:00", closed_at: "2026-01-31T22:00:00", notes: "Janeiro fechado" },
];

/* ============ Contagem de caixa ============ */
export type CashCount = {
  id: string; account_id: string;
  expected_amount: string; counted_amount: string; discrepancy: string;
  resolution: CashCountResolution; notes?: string | null;
  created_at: string;
};
export const mockCashCounts: CashCount[] = [
  { id: "cc_1", account_id: "acc_1", expected_amount: "1820.00", counted_amount: "1820.00", discrepancy: "0.00", resolution: "NO_ADJUSTMENT", created_at: "2026-01-31T22:00:00" },
  { id: "cc_2", account_id: "acc_1", expected_amount: "950.00", counted_amount: "940.00", discrepancy: "-10.00", resolution: "ADJUSTED", notes: "Troco devolvido a cliente", created_at: "2026-01-28T22:00:00" },
  { id: "cc_3", account_id: "acc_1", expected_amount: "1340.00", counted_amount: "1355.00", discrepancy: "15.00", resolution: "ADJUSTED", notes: "Sobra de gorjeta no caixa", created_at: "2026-01-25T22:00:00" },
];

/* ============ Extrato CSV ============ */
export type StatementBatch = {
  batch_id: string; account_id: string; created_at: string;
  total: number; matched: number; pending: number; dismissed: number;
};
export const mockStatementBatches: StatementBatch[] = [
  { batch_id: "batch_1", account_id: "acc_3", created_at: "2026-02-01T08:00:00", total: 42, matched: 32, pending: 8, dismissed: 2 },
  { batch_id: "batch_2", account_id: "acc_3", created_at: "2026-01-01T08:00:00", total: 51, matched: 49, pending: 0, dismissed: 2 },
];

export type StatementLine = {
  id: string; batch_id: string; account_id: string;
  occurred_at: string; description: string; amount: string;
  direction: "INFLOW" | "OUTFLOW"; status: StatementStatus;
};
export const mockStatementLines: StatementLine[] = [
  { id: "st_1", batch_id: "batch_1", account_id: "acc_3", occurred_at: "2026-02-01T11:30:00", description: "PIX RECEBIDO MARIA S.", amount: "120.00", direction: "INFLOW", status: "PENDING" },
  { id: "st_2", batch_id: "batch_1", account_id: "acc_3", occurred_at: "2026-02-01T15:00:00", description: "TED CRED STONE", amount: "85.00", direction: "INFLOW", status: "MATCHED" },
  { id: "st_3", batch_id: "batch_1", account_id: "acc_3", occurred_at: "2026-02-02T09:10:00", description: "TARIFA MENSAL", amount: "29.90", direction: "OUTFLOW", status: "DISMISSED" },
  { id: "st_4", batch_id: "batch_1", account_id: "acc_3", occurred_at: "2026-02-02T14:00:00", description: "PIX BARBA & CIA", amount: "240.00", direction: "INFLOW", status: "PENDING" },
];

/* ============ DRE ============ */
export type DreLine = { category: EntryCategoryKey; amount: string };
export type DreBucket = { lines: DreLine[]; total: string };
export type Dre = {
  date_from: string; date_to: string;
  receita: DreBucket; custo: DreBucket; despesa: DreBucket;
  taxa: DreBucket; comissao: DreBucket; estorno: DreBucket; ajuste: DreBucket;
  resultado_bruto: string; resultado_liquido: string;
};
export const mockDre: Dre = {
  date_from: "2026-01-01T00:00:00",
  date_to: "2026-01-31T23:59:59",
  receita: {
    lines: [
      { category: "SERVICO_PRESTADO", amount: "32450.00" },
      { category: "PRODUTO_VENDIDO", amount: "4120.00" },
      { category: "PACOTE_VENDIDO", amount: "2800.00" },
      { category: "ASSINATURA", amount: "1980.00" },
    ],
    total: "41350.00",
  },
  custo: {
    lines: [
      { category: "CUSTO_PRODUTO", amount: "1880.00" },
      { category: "CUSTO_INSUMO", amount: "640.00" },
    ],
    total: "2520.00",
  },
  despesa: {
    lines: [
      { category: "ALUGUEL", amount: "4500.00" },
      { category: "UTILITIES", amount: "612.80" },
      { category: "MARKETING", amount: "900.00" },
      { category: "SALARIO", amount: "9800.00" },
      { category: "MANUTENCAO", amount: "320.00" },
    ],
    total: "16132.80",
  },
  taxa: {
    lines: [
      { category: "TAXA_CARTAO", amount: "812.40" },
      { category: "TAXA_PIX", amount: "44.20" },
    ],
    total: "856.60",
  },
  comissao: {
    lines: [{ category: "COMISSAO_PROFISSIONAL", amount: "9735.00" }],
    total: "9735.00",
  },
  estorno: {
    lines: [{ category: "ESTORNO_CLIENTE", amount: "180.00" }],
    total: "180.00",
  },
  ajuste: {
    lines: [{ category: "AJUSTE_MANUAL", amount: "15.00" }],
    total: "15.00",
  },
  resultado_bruto: "38830.00",
  resultado_liquido: "11910.60",
};