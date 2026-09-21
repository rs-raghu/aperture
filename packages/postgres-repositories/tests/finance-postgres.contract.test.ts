import { afterEach, describe, expect, it } from "vitest";

import {
  createFinancePostgresRepository,
  createRepositorySet,
  PostgresRepositoryError,
  runInPostgresTransaction,
} from "../src/index.js";
import { CREATED_AT, createTestDatabase, identifier, OWNER_A, OWNER_B } from "./postgres-test-support.js";

interface RuntimeEntity extends Readonly<Record<string, unknown>> {
  readonly id: string;
  readonly ownerId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface RuntimeRepository {
  create(input: unknown): Promise<RuntimeEntity>;
  update(id: string, ownerId: string, input: unknown): Promise<RuntimeEntity>;
  delete(id: string, ownerId: string): Promise<void>;
  findById(id: string, ownerId: string): Promise<RuntimeEntity | null>;
  findMany(query: unknown): Promise<{ readonly items: readonly RuntimeEntity[]; readonly nextCursor?: string }>;
}

const money = (amount: string, currency = "USD") => ({ amount, currency });
const ids = {
  account: identifier(301), category: identifier(302), transaction: identifier(303), split: identifier(304),
  budget: identifier(305), budgetLine: identifier(306), recurring: identifier(307), income: identifier(308),
  asset: identifier(309), liability: identifier(310), netWorth: identifier(311), investmentAccount: identifier(312),
  holding: identifier(313), trade: identifier(314), dividend: identifier(315), marketPrice: identifier(316),
  loan: identifier(317), loanPayment: identifier(318), taxProfile: identifier(319), taxRecord: identifier(320),
  insurance: identifier(321), goal: identifier(322), financialImport: identifier(323), importRow: identifier(324),
  document: identifier(325), scenario: identifier(326),
} as const;

const fixtures: ReadonlyArray<readonly [string, Readonly<Record<string, unknown>>]> = [
  ["accounts", { id: ids.account, ownerId: OWNER_A, name: "Checking", accountType: "bank", currency: "USD" }],
  ["categories", { id: ids.category, ownerId: OWNER_A, name: "Groceries", kind: "expense" }],
  ["transactions", { id: ids.transaction, ownerId: OWNER_A, accountId: ids.account, categoryId: ids.category, description: "Groceries", transactionType: "expense", amount: money("12.3400"), occurredAt: "2040-01-02T10:00:00.000Z" }],
  ["transactionSplits", { id: ids.split, ownerId: OWNER_A, transactionId: ids.transaction, categoryId: ids.category, amount: money("12.3400"), sequence: 1 }],
  ["budgets", { id: ids.budget, ownerId: OWNER_A, name: "January", currency: "USD", period: "month", startsOn: "2040-01-01", endsOn: "2040-01-31" }],
  ["budgetLines", { id: ids.budgetLine, ownerId: OWNER_A, budgetId: ids.budget, categoryId: ids.category, allocatedAmount: money("500.0000") }],
  ["recurringTransactions", { id: ids.recurring, ownerId: OWNER_A, accountId: ids.account, categoryId: ids.category, description: "Rent", amount: money("1000.0000"), frequency: "monthly", nextOccurrenceOn: "2040-02-01" }],
  ["incomeSources", { id: ids.income, ownerId: OWNER_A, name: "Salary", expectedAmount: money("5000.0000"), frequency: "monthly" }],
  ["assets", { id: ids.asset, ownerId: OWNER_A, name: "Home", assetType: "property", currentValue: money("300000.0000"), valuedOn: "2040-01-01" }],
  ["liabilities", { id: ids.liability, ownerId: OWNER_A, name: "Mortgage", liabilityType: "mortgage", outstandingBalance: money("200000.0000"), valuedOn: "2040-01-01" }],
  ["netWorthSnapshots", { id: ids.netWorth, ownerId: OWNER_A, snapshotDate: "2040-01-01", totalAssets: money("300000.0000"), totalLiabilities: money("200000.0000"), netWorth: money("100000.0000") }],
  ["investmentAccounts", { id: ids.investmentAccount, ownerId: OWNER_A, financialAccountId: ids.account, name: "Brokerage", currency: "USD" }],
  ["holdings", { id: ids.holding, ownerId: OWNER_A, investmentAccountId: ids.investmentAccount, symbol: "AAA", name: "Example holding", quantity: "2.5000", averageUnitCost: money("10.2500") }],
  ["trades", { id: ids.trade, ownerId: OWNER_A, holdingId: ids.holding, tradeType: "buy", quantity: "2.5000", unitPrice: money("10.2500"), fees: money("0.1000"), occurredAt: "2040-01-02T10:00:00.000Z" }],
  ["dividends", { id: ids.dividend, ownerId: OWNER_A, holdingId: ids.holding, amount: money("1.2300"), paidOn: "2040-01-03" }],
  ["marketPrices", { id: ids.marketPrice, ownerId: OWNER_A, symbol: "AAA", unitPrice: money("12.5000"), observedAt: "2040-01-03T10:00:00.000Z" }],
  ["loans", { id: ids.loan, ownerId: OWNER_A, name: "Auto", principal: money("20000.0000"), outstandingBalance: money("15000.0000"), startedOn: "2040-01-01", endsOn: "2045-01-01" }],
  ["loanPayments", { id: ids.loanPayment, ownerId: OWNER_A, loanId: ids.loan, amount: money("500.0000"), principalComponent: money("400.0000"), interestComponent: money("100.0000"), paidOn: "2040-02-01" }],
  ["taxProfiles", { id: ids.taxProfile, ownerId: OWNER_A, jurisdiction: "Example", currency: "USD" }],
  ["taxRecords", { id: ids.taxRecord, ownerId: OWNER_A, taxProfileId: ids.taxProfile, financialYear: "2040-41", recordType: "estimated", amount: money("100.0000"), recordedOn: "2040-04-01" }],
  ["insurancePolicies", { id: ids.insurance, ownerId: OWNER_A, name: "Home cover", policyType: "property", premium: money("100.0000"), premiumFrequency: "yearly", coverageAmount: money("300000.0000"), startsOn: "2040-01-01", renewsOn: "2041-01-01" }],
  ["financialGoals", { id: ids.goal, ownerId: OWNER_A, name: "Emergency fund", targetAmount: money("10000.0000"), recordedProgressAmount: money("2500.0000"), targetDate: "2041-01-01" }],
  ["financialImports", { id: ids.financialImport, ownerId: OWNER_A, fileName: "transactions.csv" }],
  ["financialImportRows", { id: ids.importRow, ownerId: OWNER_A, financialImportId: ids.financialImport, rowNumber: 1, fields: { amount: "12.34" } }],
  ["financialDocuments", { id: ids.document, ownerId: OWNER_A, title: "Statement", documentType: "bank_statement", documentDate: "2040-01-01" }],
  ["calculatorScenarios", { id: ids.scenario, ownerId: OWNER_A, calculatorId: "sip", calculatorVersion: "1.0.0", name: "Baseline", input: { contributionCount: 12 } }],
];

const databases: Array<Awaited<ReturnType<typeof createTestDatabase>>["database"]> = [];
afterEach(async () => Promise.all(databases.splice(0).map((database) => database.close())));

describe("Finance PostgreSQL repository contract", () => {
  it("persists every aggregate contract with decimal fidelity and owner isolation", async () => {
    const testDatabase = await createTestDatabase();
    databases.push(testDatabase.database);
    const finance = createFinancePostgresRepository(testDatabase.executor, { now: () => CREATED_AT });
    const runtime = finance as unknown as Readonly<Record<string, RuntimeRepository>>;

    for (const [key, input] of fixtures) {
      const repository = runtime[key]!;
      const created = await repository.create(structuredClone(input));
      expect(created).toMatchObject({ ...input, source: "manual", createdAt: CREATED_AT, updatedAt: CREATED_AT });
      expect(await repository.findById(created.id, OWNER_A)).toEqual(created);
      expect(await repository.findById(created.id, OWNER_B)).toBeNull();
      expect((await repository.findMany({ ownerId: OWNER_A })).items).toContainEqual(created);
      expect(await repository.update(created.id, OWNER_A, {})).toEqual(created);
    }

    const transaction = await finance.transactions.findById(ids.transaction, OWNER_A);
    expect(transaction?.amount.amount).toBe("12.3400");
    expect((await createFinancePostgresRepository(testDatabase.executor).calculatorScenarios.findById(ids.scenario, OWNER_A))?.input).toEqual({ contributionCount: 12 });
    await runtime.calculatorScenarios!.delete(ids.scenario, OWNER_A);
    expect(await runtime.calculatorScenarios!.findById(ids.scenario, OWNER_A)).toBeNull();
  });

  it("keeps date filtering and pagination consistent and rejects stale cursors", async () => {
    const testDatabase = await createTestDatabase();
    databases.push(testDatabase.database);
    const finance = createFinancePostgresRepository(testDatabase.executor, { now: () => CREATED_AT });
    const account = await finance.accounts.create(fixtures[0]![1] as never);
    await finance.transactions.create(fixtures[2]![1] as never).catch(async () => {
      await finance.categories.create(fixtures[1]![1] as never);
      await finance.transactions.create(fixtures[2]![1] as never);
    });
    await finance.transactions.create({ ...fixtures[2]![1], id: identifier(330), occurredAt: "2040-02-02T10:00:00.000Z" } as never);

    expect((await finance.transactions.findMany({ ownerId: OWNER_A, range: { startsOn: "2040-01-01", endsOn: "2040-01-31" } })).items).toHaveLength(1);
    const first = await finance.transactions.findMany({ ownerId: OWNER_A, limit: 1 });
    expect(first.nextCursor).toBeTypeOf("string");
    await finance.transactions.update(first.items[0]!.id, OWNER_A, { description: "Changed" });
    await expect(finance.transactions.findMany({ ownerId: OWNER_A, limit: 1, cursor: first.nextCursor })).rejects.toMatchObject({ code: "postgres-invalid-query" });
    expect(account.id).toBe(ids.account);
  });

  it("rolls back multi-record work and maps database failures to stable errors", async () => {
    const testDatabase = await createTestDatabase();
    databases.push(testDatabase.database);
    await expect(runInPostgresTransaction(testDatabase.executor, async ({ finance }) => {
      await finance.accounts.create({ id: identifier(340), ownerId: OWNER_A, name: "Transactional A", accountType: "bank", currency: "USD" });
      await finance.accounts.create({ id: identifier(341), ownerId: OWNER_A, name: "Transactional B", accountType: "bank", currency: "USD" });
      throw new Error("synthetic rollback");
    })).rejects.toThrow("synthetic rollback");
    expect((await createFinancePostgresRepository(testDatabase.executor).accounts.findMany({ ownerId: OWNER_A })).items).toEqual([]);

    const finance = createFinancePostgresRepository(testDatabase.executor, { now: () => CREATED_AT });
    await expect(finance.transactions.create({ ...fixtures[2]![1], accountId: identifier(399), categoryId: undefined } as never)).rejects.toMatchObject({ code: "postgres-foreign-key-violation" });
  });

  it("rejects corrupted database payloads during defensive mapping", async () => {
    const testDatabase = await createTestDatabase();
    databases.push(testDatabase.database);
    const finance = createFinancePostgresRepository(testDatabase.executor, { now: () => CREATED_AT });
    await finance.accounts.create(fixtures[0]![1] as never);
    await testDatabase.executor.query("update finance.accounts set payload = '{\"unexpected\":true}'::jsonb where id = $1", [ids.account]);
    await expect(finance.accounts.findById(ids.account, OWNER_A)).rejects.toBeInstanceOf(PostgresRepositoryError);
    await expect(finance.accounts.findById(ids.account, OWNER_A)).rejects.toMatchObject({ code: "postgres-invalid-entity" });
  });

  it("selects memory or durable adapters only at the composition boundary", async () => {
    const testDatabase = await createTestDatabase();
    databases.push(testDatabase.database);
    expect(Object.keys(createRepositorySet({ mode: "memory" }))).toEqual(["education", "health", "finance"]);
    expect(Object.keys(createRepositorySet({ mode: "postgres", database: testDatabase.executor }))).toEqual(["education", "health", "finance"]);
  });
});
