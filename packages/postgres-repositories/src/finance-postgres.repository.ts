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
  type FinanceRepository,
  type PageResult,
} from "@aperture/finance";
import {
  FinanceEntityCollection,
  type FinanceCollectionConfiguration,
} from "@aperture/finance-memory/adapter-internals";
import type { CreateFinanceMemoryRepositoryOptions } from "@aperture/finance-memory";
import type { ValidationSchema } from "@aperture/validation";

import { PostgresRepositoryError, type SqlExecutor } from "./postgres.types.js";
import { generateUuid } from "./random-identifier.js";
import { PostgresCollection } from "./store/postgres-collection.js";

type StoredEntity = Readonly<Record<string, unknown>> & {
  readonly id: string;
  readonly ownerId: string;
  readonly source: "manual" | "import" | "system";
  readonly createdAt: string;
  readonly updatedAt: string;
};

type RuntimeQuery = Readonly<Record<string, unknown>> & {
  readonly ownerId: string;
  readonly cursor?: string;
  readonly limit?: number;
};

interface Configuration extends FinanceCollectionConfiguration {
  readonly table: string;
  readonly schema: ValidationSchema<unknown>;
  readonly project: (entity: StoredEntity) => Readonly<Record<string, unknown>>;
}

function field(entity: StoredEntity, name: string): unknown {
  return entity[name] ?? null;
}

function objectField(value: unknown, name: string): unknown {
  return typeof value === "object" && value !== null
    ? (value as Readonly<Record<string, unknown>>)[name] ?? null
    : null;
}

function money(entity: StoredEntity, name: string, part: "amount" | "currency"): unknown {
  return objectField(entity[name], part);
}

const configurations = {
  accounts: { key: "accounts", table: "accounts", schema: financialAccountSchema, defaults: { status: "active" }, filterFields: ["accountType", "status", "currency"], order: [{ field: "name" }], project: (entity) => ({ name: field(entity, "name"), account_type: field(entity, "accountType"), currency: field(entity, "currency"), status: field(entity, "status") }) },
  transactions: { key: "transactions", table: "transactions", schema: transactionSchema, defaults: { status: "active", reviewed: false }, filterFields: ["accountId", "categoryId"], currencyPath: "amount.currency", dateField: "occurredAt", order: [{ field: "occurredAt", direction: "descending" }], project: (entity) => ({ account_id: field(entity, "accountId"), category_id: field(entity, "categoryId"), description: field(entity, "description"), transaction_type: field(entity, "transactionType"), amount: money(entity, "amount", "amount"), currency: money(entity, "amount", "currency"), occurred_at: field(entity, "occurredAt"), reviewed: field(entity, "reviewed"), status: field(entity, "status") }) },
  transactionSplits: { key: "transaction-splits", table: "transaction_splits", schema: transactionSplitSchema, filterFields: ["transactionId"], order: [{ field: "sequence", numeric: true }], project: (entity) => ({ transaction_id: field(entity, "transactionId"), category_id: field(entity, "categoryId"), amount: money(entity, "amount", "amount"), currency: money(entity, "amount", "currency") }) },
  categories: { key: "categories", table: "categories", schema: transactionCategorySchema, defaults: { status: "active", systemCategory: false }, filterFields: ["kind", "status"], order: [{ field: "name" }], project: (entity) => ({ name: field(entity, "name"), category_kind: field(entity, "kind"), status: field(entity, "status"), system_category: field(entity, "systemCategory") }) },
  budgets: { key: "budgets", table: "budgets", schema: budgetSchema, defaults: { status: "draft" }, filterFields: ["status"], order: [{ field: "startsOn", direction: "descending" }, { field: "name" }], project: (entity) => ({ name: field(entity, "name"), currency: field(entity, "currency"), period: field(entity, "period"), starts_on: field(entity, "startsOn"), ends_on: field(entity, "endsOn"), status: field(entity, "status") }) },
  budgetLines: { key: "budget-lines", table: "budget_lines", schema: budgetLineSchema, filterFields: ["budgetId", "categoryId"], order: [{ field: "categoryId" }], project: (entity) => ({ budget_id: field(entity, "budgetId"), category_id: field(entity, "categoryId"), allocated_amount: money(entity, "allocatedAmount", "amount"), currency: money(entity, "allocatedAmount", "currency") }) },
  recurringTransactions: { key: "recurring-transactions", table: "recurring_transactions", schema: recurringTransactionSchema, defaults: { status: "active" }, filterFields: ["status", "accountId", "categoryId"], currencyPath: "amount.currency", dateField: "nextOccurrenceOn", order: [{ field: "nextOccurrenceOn" }, { field: "description" }], project: (entity) => ({ account_id: field(entity, "accountId"), category_id: field(entity, "categoryId"), description: field(entity, "description"), transaction_type: null, amount: money(entity, "amount", "amount"), currency: money(entity, "amount", "currency"), recurrence_rule: field(entity, "frequency"), next_occurrence_on: field(entity, "nextOccurrenceOn"), status: field(entity, "status") }) },
  incomeSources: { key: "income-sources", table: "income_sources", schema: incomeSourceSchema, defaults: { status: "active" }, filterFields: ["status"], currencyPath: "expectedAmount.currency", order: [{ field: "name" }], project: (entity) => ({ name: field(entity, "name"), amount: money(entity, "expectedAmount", "amount"), currency: money(entity, "expectedAmount", "currency"), frequency: field(entity, "frequency"), status: field(entity, "status") }) },
  assets: { key: "assets", table: "assets", schema: assetSchema, defaults: { status: "active" }, filterFields: ["assetType", "status"], currencyPath: "currentValue.currency", dateField: "valuedOn", order: [{ field: "name" }], project: (entity) => ({ name: field(entity, "name"), asset_type: field(entity, "assetType"), current_value: money(entity, "currentValue", "amount"), currency: money(entity, "currentValue", "currency"), valued_on: field(entity, "valuedOn"), status: field(entity, "status") }) },
  liabilities: { key: "liabilities", table: "liabilities", schema: liabilitySchema, defaults: { status: "active" }, filterFields: ["liabilityType", "status"], currencyPath: "outstandingBalance.currency", dateField: "valuedOn", order: [{ field: "name" }], project: (entity) => ({ name: field(entity, "name"), liability_type: field(entity, "liabilityType"), outstanding_balance: money(entity, "outstandingBalance", "amount"), currency: money(entity, "outstandingBalance", "currency"), valued_on: field(entity, "valuedOn"), status: field(entity, "status") }) },
  netWorthSnapshots: { key: "net-worth-snapshots", table: "net_worth_snapshots", schema: netWorthSnapshotSchema, currencyPath: "netWorth.currency", dateField: "snapshotDate", order: [{ field: "snapshotDate", direction: "descending" }], project: (entity) => ({ total_assets: money(entity, "totalAssets", "amount"), total_liabilities: money(entity, "totalLiabilities", "amount"), net_worth: money(entity, "netWorth", "amount"), currency: money(entity, "netWorth", "currency"), recorded_on: field(entity, "snapshotDate") }) },
  investmentAccounts: { key: "investment-accounts", table: "investment_accounts", schema: investmentAccountSchema, defaults: { status: "active" }, filterFields: ["status", "financialAccountId", "currency"], order: [{ field: "name" }], project: (entity) => ({ financial_account_id: field(entity, "financialAccountId"), name: field(entity, "name"), currency: field(entity, "currency"), status: field(entity, "status") }) },
  holdings: { key: "holdings", table: "holdings", schema: holdingSchema, defaults: { status: "active" }, filterFields: ["investmentAccountId", "status", "symbol"], currencyPath: "averageUnitCost.currency", order: [{ field: "symbol" }], project: (entity) => ({ investment_account_id: field(entity, "investmentAccountId"), symbol: field(entity, "symbol"), quantity: field(entity, "quantity"), average_unit_cost: money(entity, "averageUnitCost", "amount"), currency: money(entity, "averageUnitCost", "currency") }) },
  trades: { key: "trades", table: "trades", schema: tradeSchema, filterFields: ["holdingId", "tradeType"], currencyPath: "unitPrice.currency", dateField: "occurredAt", order: [{ field: "occurredAt", direction: "descending" }], project: (entity) => ({ holding_id: field(entity, "holdingId"), investment_account_id: null, symbol: null, trade_type: field(entity, "tradeType"), quantity: field(entity, "quantity"), unit_price: money(entity, "unitPrice", "amount"), fees: money(entity, "fees", "amount") ?? 0, currency: money(entity, "unitPrice", "currency") ?? money(entity, "fees", "currency"), traded_at: field(entity, "occurredAt") }) },
  dividends: { key: "dividends", table: "dividends", schema: dividendSchema, filterFields: ["holdingId"], currencyPath: "amount.currency", dateField: "paidOn", order: [{ field: "paidOn", direction: "descending" }], project: (entity) => ({ holding_id: field(entity, "holdingId"), investment_account_id: null, symbol: null, amount: money(entity, "amount", "amount"), currency: money(entity, "amount", "currency"), received_on: field(entity, "paidOn") }) },
  marketPrices: { key: "market-prices", table: "market_prices", schema: marketPriceSchema, filterFields: ["symbol"], currencyPath: "unitPrice.currency", dateField: "observedAt", order: [{ field: "observedAt", direction: "descending" }], project: (entity) => ({ symbol: field(entity, "symbol"), price: money(entity, "unitPrice", "amount"), currency: money(entity, "unitPrice", "currency"), observed_at: field(entity, "observedAt"), source: field(entity, "provider") }) },
  loans: { key: "loans", table: "loans", schema: loanSchema, defaults: { status: "active" }, filterFields: ["status"], currencyPath: "principal.currency", dateField: "startedOn", order: [{ field: "name" }], project: (entity) => ({ name: field(entity, "name"), principal: money(entity, "principal", "amount"), outstanding_balance: money(entity, "outstandingBalance", "amount"), currency: money(entity, "principal", "currency"), started_on: field(entity, "startedOn"), ends_on: field(entity, "endsOn"), status: field(entity, "status") }) },
  loanPayments: { key: "loan-payments", table: "loan_payments", schema: loanPaymentSchema, filterFields: ["loanId"], currencyPath: "amount.currency", dateField: "paidOn", order: [{ field: "paidOn", direction: "descending" }], project: (entity) => ({ loan_id: field(entity, "loanId"), amount: money(entity, "amount", "amount"), principal_component: money(entity, "principalComponent", "amount"), interest_component: money(entity, "interestComponent", "amount"), currency: money(entity, "amount", "currency"), paid_on: field(entity, "paidOn") }) },
  taxProfiles: { key: "tax-profiles", table: "tax_profiles", schema: taxProfileSchema, defaults: { status: "active" }, filterFields: ["status", "jurisdiction", "currency"], order: [{ field: "jurisdiction" }], project: (entity) => ({ jurisdiction: field(entity, "jurisdiction"), financial_year: null, rule_version: null, rule_effective_on: null, currency: field(entity, "currency"), status: field(entity, "status") }) },
  taxRecords: { key: "tax-records", table: "tax_records", schema: taxRecordSchema, filterFields: ["taxProfileId", "financialYear", "recordType"], currencyPath: "amount.currency", dateField: "recordedOn", order: [{ field: "recordedOn", direction: "descending" }], project: (entity) => ({ tax_profile_id: field(entity, "taxProfileId"), record_type: field(entity, "recordType"), amount: money(entity, "amount", "amount"), currency: money(entity, "amount", "currency"), occurred_on: field(entity, "recordedOn") }) },
  insurancePolicies: { key: "insurance-policies", table: "insurance_policies", schema: insurancePolicySchema, defaults: { status: "active" }, filterFields: ["status", "policyType"], currencyPath: "premium.currency", dateField: "renewsOn", order: [{ field: "renewsOn" }, { field: "name" }], project: (entity) => ({ name: field(entity, "name"), policy_type: field(entity, "policyType"), premium_amount: money(entity, "premium", "amount"), coverage_amount: money(entity, "coverageAmount", "amount"), currency: money(entity, "premium", "currency") ?? money(entity, "coverageAmount", "currency"), starts_on: field(entity, "startsOn"), ends_on: field(entity, "renewsOn"), status: field(entity, "status") }) },
  financialGoals: { key: "financial-goals", table: "financial_goals", schema: financialGoalSchema, defaults: { status: "active" }, filterFields: ["status"], currencyPath: "targetAmount.currency", dateField: "targetDate", order: [{ field: "targetDate" }, { field: "name" }], project: (entity) => ({ name: field(entity, "name"), target_amount: money(entity, "targetAmount", "amount"), recorded_progress_amount: money(entity, "recordedProgressAmount", "amount") ?? 0, currency: money(entity, "targetAmount", "currency"), target_date: field(entity, "targetDate"), status: field(entity, "status") }) },
  financialImports: { key: "financial-imports", table: "financial_imports", schema: financialImportSchema, defaults: { status: "draft" }, filterFields: ["status"], order: [{ field: "createdAt", direction: "descending" }, { field: "fileName" }], project: (entity) => ({ source_type: null, source_name: null, imported_at: field(entity, "createdAt"), file_name: field(entity, "fileName"), status: field(entity, "status"), content_checksum: field(entity, "contentChecksum") }) },
  financialImportRows: { key: "financial-import-rows", table: "financial_import_rows", schema: financialImportRowSchema, defaults: { status: "pending", messages: [] }, filterFields: ["financialImportId", "status"], order: [{ field: "rowNumber", numeric: true }], project: (entity) => ({ financial_import_id: field(entity, "financialImportId"), row_number: field(entity, "rowNumber"), status: field(entity, "status"), normalized_data: field(entity, "fields") }) },
  financialDocuments: { key: "financial-documents", table: "financial_documents", schema: financialDocumentSchema, defaults: { status: "active" }, filterFields: ["documentType", "status"], dateField: "documentDate", order: [{ field: "documentDate", direction: "descending" }, { field: "title" }], project: (entity) => ({ title: field(entity, "title"), document_type: field(entity, "documentType"), storage_key: null, recorded_on: field(entity, "documentDate"), content_checksum: field(entity, "contentChecksum"), status: field(entity, "status") }) },
  calculatorScenarios: { key: "calculator-scenarios", table: "calculator_scenarios", schema: savedCalculatorScenarioSchema, filterFields: ["calculatorId"], order: [{ field: "name" }], project: (entity) => ({ calculator_id: field(entity, "calculatorId"), calculator_version: field(entity, "calculatorVersion"), name: field(entity, "name"), input: field(entity, "input") }) },
} as const satisfies Readonly<Record<string, Configuration>>;

function nestedValue(record: Readonly<Record<string, unknown>>, path: string): unknown {
  return path.split(".").reduce<unknown>(
    (value, segment) => typeof value === "object" && value !== null
      ? (value as Readonly<Record<string, unknown>>)[segment]
      : undefined,
    record,
  );
}

function dateComparable(value: string, boundary: string): string {
  return boundary.length === 10 && value.length > 10 ? value.slice(0, 10) : value;
}

function compareUnknown(left: unknown, right: unknown, numeric: boolean): number {
  if (left === undefined) return right === undefined ? 0 : 1;
  if (right === undefined) return -1;
  if (numeric) return Number(left) - Number(right);
  return String(left).localeCompare(String(right));
}

class FinancePostgresCollection extends FinanceEntityCollection {
  readonly #durable: PostgresCollection<StoredEntity>;
  readonly #now: () => string;
  readonly #generateId: (collection: string, sequence: number) => string;
  #sequence = 0;

  public constructor(
    database: SqlExecutor,
    private readonly durableConfiguration: Configuration,
    options: CreateFinanceMemoryRepositoryOptions,
  ) {
    super(durableConfiguration, options);
    this.#now = options.now ?? (() => new Date().toISOString());
    this.#generateId = options.generateId ?? (() => generateUuid());
    this.#durable = new PostgresCollection(database, {
      schema: "finance",
      table: durableConfiguration.table,
      entitySchema: durableConfiguration.schema as unknown as import("./store/postgres-collection.js").RuntimeSchema<StoredEntity>,
      project: durableConfiguration.project,
    });
  }

  public override async create(input: unknown): Promise<unknown> {
    const source = this.requireInputObject(input, "create input");
    const now = this.#now();
    const id = typeof source.id === "string"
      ? source.id
      : this.#generateId(this.durableConfiguration.key, ++this.#sequence);
    return this.#durable.create(this.validateInputEntity({
      ...this.durableConfiguration.defaults,
      ...source,
      id,
      source: source.source ?? "manual",
      createdAt: source.createdAt ?? now,
      updatedAt: source.updatedAt ?? source.createdAt ?? now,
    }));
  }

  public override async update(id: string, ownerId: string, input: unknown): Promise<unknown> {
    const existing = await this.#durable.findById(id, ownerId);
    if (existing === null) this.throwNotFound(id);
    const patch = this.requireInputObject(input, "update input");
    if (
      (patch.id !== undefined && patch.id !== id) ||
      (patch.ownerId !== undefined && patch.ownerId !== ownerId) ||
      (patch.createdAt !== undefined && patch.createdAt !== existing.createdAt)
    ) {
      throw new PostgresRepositoryError(
        "postgres-immutable-identity",
        "Record identity, owner, and creation timestamp are immutable.",
        { namespace: `finance.${this.durableConfiguration.table}`, entityId: id },
      );
    }
    return this.#durable.update(this.validateInputEntity({
      ...existing,
      ...patch,
      id,
      ownerId,
      createdAt: existing.createdAt,
      updatedAt: patch.updatedAt ?? this.#now(),
    }));
  }

  public override delete(id: string, ownerId: string): Promise<void> {
    return this.#durable.delete(id, ownerId);
  }

  public override findById(id: string, ownerId: string): Promise<unknown | null> {
    return this.#durable.findById(id, ownerId);
  }

  public override findMany(input: unknown): Promise<PageResult<unknown>> {
    const query = this.readInputQuery(input);
    return this.#durable.findMany(
      query,
      (entity, runtimeQuery) => this.matchesQuery(entity, runtimeQuery),
      (left, right) => this.compareEntities(left, right),
    );
  }

  private requireInputObject(value: unknown, label: string): Readonly<Record<string, unknown>> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new PostgresRepositoryError(
        "postgres-invalid-entity",
        `${label} must be an object.`,
        { namespace: `finance.${this.durableConfiguration.table}` },
      );
    }
    return value as Readonly<Record<string, unknown>>;
  }

  private validateInputEntity(value: unknown): StoredEntity {
    const result = this.durableConfiguration.schema.safeParse(value);
    if (!result.success) {
      throw new PostgresRepositoryError(
        "postgres-invalid-entity",
        "Record does not satisfy its Finance entity contract.",
        { namespace: `finance.${this.durableConfiguration.table}`, issues: result.error.issues },
      );
    }
    return result.data as StoredEntity;
  }

  private readInputQuery(input: unknown): RuntimeQuery {
    const query = this.requireInputObject(input, "query");
    if (typeof query.ownerId !== "string" || query.ownerId.trim().length === 0) {
      throw new PostgresRepositoryError("postgres-invalid-query", "A non-empty owner is required.", { field: "ownerId" });
    }
    if (query.cursor !== undefined && typeof query.cursor !== "string") {
      throw new PostgresRepositoryError("postgres-invalid-query", "Pagination cursor must be a string.", { field: "cursor" });
    }
    return query as RuntimeQuery;
  }

  private matchesQuery(entity: StoredEntity, query: RuntimeQuery): boolean {
    if (entity.ownerId !== query.ownerId) return false;
    for (const filterField of this.durableConfiguration.filterFields ?? []) {
      if (query[filterField] !== undefined && entity[filterField] !== query[filterField]) return false;
    }
    if (
      query.currency !== undefined &&
      this.durableConfiguration.currencyPath !== undefined &&
      nestedValue(entity, this.durableConfiguration.currencyPath) !== query.currency
    ) return false;
    const date = this.durableConfiguration.dateField === undefined
      ? undefined
      : entity[this.durableConfiguration.dateField];
    if (query.range !== undefined) {
      if (typeof date !== "string" || typeof query.range !== "object" || query.range === null) return false;
      const range = query.range as Readonly<Record<string, unknown>>;
      if (typeof range.startsOn !== "string" || typeof range.endsOn !== "string") return false;
      const comparable = dateComparable(date, range.startsOn);
      if (comparable < range.startsOn || dateComparable(date, range.endsOn) > range.endsOn) return false;
    }
    if (
      query.before !== undefined &&
      (typeof date !== "string" || typeof query.before !== "string" || dateComparable(date, query.before) > query.before)
    ) return false;
    return true;
  }

  private compareEntities(left: StoredEntity, right: StoredEntity): number {
    for (const rule of this.durableConfiguration.order ?? []) {
      const compared = compareUnknown(left[rule.field], right[rule.field], rule.numeric ?? false);
      if (compared !== 0) return rule.direction === "descending" ? -compared : compared;
    }
    return left.id.localeCompare(right.id);
  }

  private throwNotFound(id: string): never {
    throw new PostgresRepositoryError(
      "postgres-record-not-found",
      "The requested durable record is unavailable.",
      { namespace: `finance.${this.durableConfiguration.table}`, entityId: id },
    );
  }
}

function repository<TRepository>(collection: FinancePostgresCollection): TRepository {
  return Object.freeze({
    create: (input: unknown) => collection.create(input),
    update: (id: string, ownerId: string, input: unknown) => collection.update(id, ownerId, input),
    delete: (id: string, ownerId: string) => collection.delete(id, ownerId),
    findById: (id: string, ownerId: string) => collection.findById(id, ownerId),
    findMany: (query: unknown) => collection.findMany(query),
  }) as TRepository;
}

export function createFinancePostgresRepository(
  database: SqlExecutor,
  options: CreateFinanceMemoryRepositoryOptions = {},
): FinanceRepository {
  const collection = (configuration: Configuration) =>
    new FinancePostgresCollection(database, configuration, options);
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
