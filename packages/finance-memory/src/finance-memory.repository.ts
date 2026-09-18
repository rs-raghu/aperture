import {
  assetSchema,
  budgetLineSchema,
  budgetSchema,
  dividendSchema,
  financialAccountSchema,
  financialDocumentSchema,
  financialGoalSchema,
  financialImportRowSchema,
  financialImportSchema,
  holdingSchema,
  incomeSourceSchema,
  insurancePolicySchema,
  investmentAccountSchema,
  liabilitySchema,
  loanPaymentSchema,
  loanSchema,
  marketPriceSchema,
  netWorthSnapshotSchema,
  recurringTransactionSchema,
  savedCalculatorScenarioSchema,
  taxProfileSchema,
  taxRecordSchema,
  tradeSchema,
  transactionCategorySchema,
  transactionSchema,
  transactionSplitSchema,
} from "@aperture/finance";
import type { FinanceRepository } from "@aperture/finance";

import type { CreateFinanceMemoryRepositoryOptions } from "./finance-memory.types.js";
import { EntityCollection, type CollectionConfiguration } from "./store/entity-collection.js";

const configurations = {
  accounts: { key: "accounts", schema: financialAccountSchema, defaults: { status: "active" }, filterFields: ["accountType", "status", "currency"], order: [{ field: "name" }] },
  transactions: { key: "transactions", schema: transactionSchema, defaults: { status: "active", reviewed: false }, filterFields: ["accountId", "categoryId"], currencyPath: "amount.currency", dateField: "occurredAt", order: [{ field: "occurredAt", direction: "descending" }] },
  transactionSplits: { key: "transaction-splits", schema: transactionSplitSchema, filterFields: ["transactionId"], order: [{ field: "sequence", numeric: true }] },
  categories: { key: "categories", schema: transactionCategorySchema, defaults: { status: "active", systemCategory: false }, filterFields: ["kind", "status"], order: [{ field: "name" }] },
  budgets: { key: "budgets", schema: budgetSchema, defaults: { status: "draft" }, filterFields: ["status"], order: [{ field: "startsOn", direction: "descending" }, { field: "name" }] },
  budgetLines: { key: "budget-lines", schema: budgetLineSchema, filterFields: ["budgetId", "categoryId"], order: [{ field: "categoryId" }] },
  recurringTransactions: { key: "recurring-transactions", schema: recurringTransactionSchema, defaults: { status: "active" }, filterFields: ["status", "accountId", "categoryId"], currencyPath: "amount.currency", dateField: "nextOccurrenceOn", order: [{ field: "nextOccurrenceOn" }, { field: "description" }] },
  incomeSources: { key: "income-sources", schema: incomeSourceSchema, defaults: { status: "active" }, filterFields: ["status"], currencyPath: "expectedAmount.currency", order: [{ field: "name" }] },
  assets: { key: "assets", schema: assetSchema, defaults: { status: "active" }, filterFields: ["assetType", "status"], currencyPath: "currentValue.currency", dateField: "valuedOn", order: [{ field: "name" }] },
  liabilities: { key: "liabilities", schema: liabilitySchema, defaults: { status: "active" }, filterFields: ["liabilityType", "status"], currencyPath: "outstandingBalance.currency", dateField: "valuedOn", order: [{ field: "name" }] },
  netWorthSnapshots: { key: "net-worth-snapshots", schema: netWorthSnapshotSchema, currencyPath: "netWorth.currency", dateField: "snapshotDate", order: [{ field: "snapshotDate", direction: "descending" }] },
  investmentAccounts: { key: "investment-accounts", schema: investmentAccountSchema, defaults: { status: "active" }, filterFields: ["status", "financialAccountId", "currency"], order: [{ field: "name" }] },
  holdings: { key: "holdings", schema: holdingSchema, defaults: { status: "active" }, filterFields: ["investmentAccountId", "status", "symbol"], currencyPath: "averageUnitCost.currency", order: [{ field: "symbol" }] },
  trades: { key: "trades", schema: tradeSchema, filterFields: ["holdingId", "tradeType"], currencyPath: "unitPrice.currency", dateField: "occurredAt", order: [{ field: "occurredAt", direction: "descending" }] },
  dividends: { key: "dividends", schema: dividendSchema, filterFields: ["holdingId"], currencyPath: "amount.currency", dateField: "paidOn", order: [{ field: "paidOn", direction: "descending" }] },
  marketPrices: { key: "market-prices", schema: marketPriceSchema, filterFields: ["symbol"], currencyPath: "unitPrice.currency", dateField: "observedAt", order: [{ field: "observedAt", direction: "descending" }] },
  loans: { key: "loans", schema: loanSchema, defaults: { status: "active" }, filterFields: ["status"], currencyPath: "principal.currency", dateField: "startedOn", order: [{ field: "name" }] },
  loanPayments: { key: "loan-payments", schema: loanPaymentSchema, filterFields: ["loanId"], currencyPath: "amount.currency", dateField: "paidOn", order: [{ field: "paidOn", direction: "descending" }] },
  taxProfiles: { key: "tax-profiles", schema: taxProfileSchema, defaults: { status: "active" }, filterFields: ["status", "jurisdiction", "currency"], order: [{ field: "jurisdiction" }] },
  taxRecords: { key: "tax-records", schema: taxRecordSchema, filterFields: ["taxProfileId", "financialYear", "recordType"], currencyPath: "amount.currency", dateField: "recordedOn", order: [{ field: "recordedOn", direction: "descending" }] },
  insurancePolicies: { key: "insurance-policies", schema: insurancePolicySchema, defaults: { status: "active" }, filterFields: ["status", "policyType"], currencyPath: "premium.currency", dateField: "renewsOn", order: [{ field: "renewsOn" }, { field: "name" }] },
  financialGoals: { key: "financial-goals", schema: financialGoalSchema, defaults: { status: "active" }, filterFields: ["status"], currencyPath: "targetAmount.currency", dateField: "targetDate", order: [{ field: "targetDate" }, { field: "name" }] },
  financialImports: { key: "financial-imports", schema: financialImportSchema, defaults: { status: "draft" }, filterFields: ["status"], order: [{ field: "createdAt", direction: "descending" }, { field: "fileName" }] },
  financialImportRows: { key: "financial-import-rows", schema: financialImportRowSchema, defaults: { status: "pending", messages: [] }, filterFields: ["financialImportId", "status"], order: [{ field: "rowNumber", numeric: true }] },
  financialDocuments: { key: "financial-documents", schema: financialDocumentSchema, defaults: { status: "active" }, filterFields: ["documentType", "status"], dateField: "documentDate", order: [{ field: "documentDate", direction: "descending" }, { field: "title" }] },
  calculatorScenarios: { key: "calculator-scenarios", schema: savedCalculatorScenarioSchema, filterFields: ["calculatorId"], order: [{ field: "name" }] },
} as const satisfies Readonly<Record<string, CollectionConfiguration>>;

function repository<TRepository>(collection: EntityCollection): TRepository {
  return Object.freeze({
    create: (input: unknown) => collection.create(input),
    update: (id: string, ownerId: string, input: unknown) => collection.update(id, ownerId, input),
    delete: (id: string, ownerId: string) => collection.delete(id, ownerId),
    findById: (id: string, ownerId: string) => collection.findById(id, ownerId),
    findMany: (query: unknown) => collection.findMany(query),
  }) as TRepository;
}

export function createFinanceMemoryRepository(options: CreateFinanceMemoryRepositoryOptions = {}): FinanceRepository {
  const collection = (configuration: CollectionConfiguration) => new EntityCollection(configuration, options);
  return Object.freeze({
    accounts: repository<FinanceRepository["accounts"]>(collection(configurations.accounts)),
    transactions: repository<FinanceRepository["transactions"]>(collection(configurations.transactions)),
    transactionSplits: repository<FinanceRepository["transactionSplits"]>(collection(configurations.transactionSplits)),
    categories: repository<FinanceRepository["categories"]>(collection(configurations.categories)),
    budgets: repository<FinanceRepository["budgets"]>(collection(configurations.budgets)),
    budgetLines: repository<FinanceRepository["budgetLines"]>(collection(configurations.budgetLines)),
    recurringTransactions: repository<FinanceRepository["recurringTransactions"]>(collection(configurations.recurringTransactions)),
    incomeSources: repository<FinanceRepository["incomeSources"]>(collection(configurations.incomeSources)),
    assets: repository<FinanceRepository["assets"]>(collection(configurations.assets)),
    liabilities: repository<FinanceRepository["liabilities"]>(collection(configurations.liabilities)),
    netWorthSnapshots: repository<FinanceRepository["netWorthSnapshots"]>(collection(configurations.netWorthSnapshots)),
    investmentAccounts: repository<FinanceRepository["investmentAccounts"]>(collection(configurations.investmentAccounts)),
    holdings: repository<FinanceRepository["holdings"]>(collection(configurations.holdings)),
    trades: repository<FinanceRepository["trades"]>(collection(configurations.trades)),
    dividends: repository<FinanceRepository["dividends"]>(collection(configurations.dividends)),
    marketPrices: repository<FinanceRepository["marketPrices"]>(collection(configurations.marketPrices)),
    loans: repository<FinanceRepository["loans"]>(collection(configurations.loans)),
    loanPayments: repository<FinanceRepository["loanPayments"]>(collection(configurations.loanPayments)),
    taxProfiles: repository<FinanceRepository["taxProfiles"]>(collection(configurations.taxProfiles)),
    taxRecords: repository<FinanceRepository["taxRecords"]>(collection(configurations.taxRecords)),
    insurancePolicies: repository<FinanceRepository["insurancePolicies"]>(collection(configurations.insurancePolicies)),
    financialGoals: repository<FinanceRepository["financialGoals"]>(collection(configurations.financialGoals)),
    financialImports: repository<FinanceRepository["financialImports"]>(collection(configurations.financialImports)),
    financialImportRows: repository<FinanceRepository["financialImportRows"]>(collection(configurations.financialImportRows)),
    financialDocuments: repository<FinanceRepository["financialDocuments"]>(collection(configurations.financialDocuments)),
    calculatorScenarios: repository<FinanceRepository["calculatorScenarios"]>(collection(configurations.calculatorScenarios)),
  });
}
