import { describe, expect, it } from "vitest";
import {
  allFinanceCalculatorPlugins,
  createFinanceApplicationService,
} from "@aperture/finance";
import type { FinanceApplicationRepositories, FinanceServiceDependencies } from "@aperture/finance";

interface StoredEntity extends Readonly<Record<string, unknown>> {
  readonly id: string;
  readonly ownerId: string;
}

interface FakeRepository {
  readonly records: Map<string, StoredEntity>;
  readonly implementation: {
    create(input: object): Promise<StoredEntity>;
    update(id: string, ownerId: string, input: object): Promise<StoredEntity>;
    delete(id: string, ownerId: string): Promise<void>;
    findById(id: string, ownerId: string): Promise<StoredEntity | null>;
    findMany(query: Readonly<Record<string, unknown>>): Promise<{ readonly items: readonly StoredEntity[] }>;
  };
}

function clone<TEntity>(value: TEntity): TEntity {
  return structuredClone(value);
}

function fakeRepository(): FakeRepository {
  const records = new Map<string, StoredEntity>();
  const implementation = {
    async create(input: object) {
      const entity = clone(input) as StoredEntity;
      records.set(entity.id, entity);
      return clone(entity);
    },
    async update(id: string, ownerId: string, input: object) {
      const current = records.get(id);
      if (!current || current.ownerId !== ownerId) throw new Error("missing fake record");
      const entity = clone({ ...current, ...input }) as StoredEntity;
      records.set(id, entity);
      return clone(entity);
    },
    async delete(id: string, ownerId: string) {
      const current = records.get(id);
      if (current?.ownerId === ownerId) records.delete(id);
    },
    async findById(id: string, ownerId: string) {
      const entity = records.get(id);
      return entity?.ownerId === ownerId ? clone(entity) : null;
    },
    async findMany(query: Readonly<Record<string, unknown>>) {
      const ignored = new Set(["cursor", "limit", "range"]);
      const items = [...records.values()].filter((entity) => Object.entries(query).every(([key, value]) => ignored.has(key) || entity[key] === value));
      return { items: clone(items) };
    },
  };
  return { records, implementation };
}

function testComposition(registry = allFinanceCalculatorPlugins) {
  const fakes = {
    accounts: fakeRepository(), transactions: fakeRepository(), categories: fakeRepository(), budgets: fakeRepository(),
    budgetLines: fakeRepository(), incomeSources: fakeRepository(), assets: fakeRepository(), liabilities: fakeRepository(),
    investmentAccounts: fakeRepository(), loans: fakeRepository(), financialGoals: fakeRepository(), calculatorScenarios: fakeRepository(),
  };
  const repositories = Object.fromEntries(Object.entries(fakes).map(([key, value]) => [key, value.implementation])) as unknown as FinanceApplicationRepositories;
  let sequence = 0;
  const dependencies: FinanceServiceDependencies = {
    repositories,
    calculatorRegistry: registry,
    clock: { now: () => "2026-09-18T10:00:00Z" },
    idGenerator: { next: (scope) => `${scope.replaceAll(" ", "-")}-${++sequence}` },
  };
  return { service: createFinanceApplicationService(dependencies), fakes, dependencies };
}

const owner = { ownerId: "owner-1" } as const;
const otherOwner = { ownerId: "owner-2" } as const;
const money = (amount: string, currency = "USD") => ({ amount, currency });

describe("Phase 23 Finance application service", () => {
  it("executes every public resource method with injected identity and owner scope", async () => {
    const { service } = testComposition();

    const account = await service.accounts.create(owner, { name: "Checking", accountType: "bank", currency: "USD" });
    expect(account).toMatchObject({ ownerId: owner.ownerId, source: "manual", status: "active" });
    expect((await service.accounts.update(owner, account.id, { name: "Primary checking" })).name).toBe("Primary checking");
    expect((await service.accounts.get(owner, account.id)).id).toBe(account.id);
    expect((await service.accounts.list(owner)).items).toHaveLength(1);
    const closable = await service.accounts.create(owner, { name: "Credit", accountType: "credit_card", currency: "USD" });
    expect((await service.accounts.close(owner, closable.id)).status).toBe("closed");
    const archivable = await service.accounts.create(owner, { name: "Cash", accountType: "cash", currency: "USD" });
    expect((await service.accounts.archive(owner, archivable.id)).status).toBe("archived");

    const expenseCategory = await service.categories.create(owner, { name: "Food", kind: "expense" });
    expect((await service.categories.update(owner, expenseCategory.id, { name: "Groceries" })).name).toBe("Groceries");
    expect((await service.categories.get(owner, expenseCategory.id)).kind).toBe("expense");
    expect((await service.categories.list(owner, { kind: "expense" })).items).toHaveLength(1);

    const transaction = await service.transactions.create(owner, { accountId: account.id, categoryId: expenseCategory.id, description: "Lunch", transactionType: "expense", amount: money("25"), occurredAt: "2026-09-18T09:00:00Z" });
    expect((await service.transactions.update(owner, transaction.id, { description: "Team lunch" })).description).toBe("Team lunch");
    expect((await service.transactions.get(owner, transaction.id)).amount.amount).toBe("25");
    expect((await service.transactions.list(owner, { accountId: account.id })).items).toHaveLength(1);

    const budget = await service.budgets.create(owner, { name: "Monthly", currency: "USD", period: "month", startsOn: "2026-09-01", endsOn: "2026-09-30" });
    expect((await service.budgets.update(owner, budget.id, { name: "September" })).name).toBe("September");
    expect((await service.budgets.get(owner, budget.id)).period).toBe("month");
    expect((await service.budgets.list(owner)).items).toHaveLength(1);
    const line = await service.budgetLines.create(owner, { budgetId: budget.id, categoryId: expenseCategory.id, allocatedAmount: money("500") });
    expect((await service.budgetLines.update(owner, line.id, { allocatedAmount: money("550") })).allocatedAmount.amount).toBe("550");
    expect((await service.budgetLines.get(owner, line.id)).budgetId).toBe(budget.id);
    expect((await service.budgetLines.list(owner, { budgetId: budget.id })).items).toHaveLength(1);

    const income = await service.incomeSources.create(owner, { name: "Salary", expectedAmount: money("5000"), frequency: "monthly" });
    expect((await service.incomeSources.update(owner, income.id, { expectedAmount: money("5100") })).expectedAmount?.amount).toBe("5100");
    expect((await service.incomeSources.get(owner, income.id)).name).toBe("Salary");
    expect((await service.incomeSources.list(owner)).items).toHaveLength(1);

    const asset = await service.assets.create(owner, { name: "Home", assetType: "property", currentValue: money("300000"), valuedOn: "2026-09-18" });
    expect((await service.assets.update(owner, asset.id, { currentValue: money("310000") })).currentValue.amount).toBe("310000");
    expect((await service.assets.get(owner, asset.id)).assetType).toBe("property");
    expect((await service.assets.list(owner)).items).toHaveLength(1);

    const liability = await service.liabilities.create(owner, { name: "Mortgage", liabilityType: "mortgage", outstandingBalance: money("200000"), valuedOn: "2026-09-18" });
    expect((await service.liabilities.update(owner, liability.id, { outstandingBalance: money("199000") })).outstandingBalance.amount).toBe("199000");
    expect((await service.liabilities.get(owner, liability.id)).liabilityType).toBe("mortgage");
    expect((await service.liabilities.list(owner)).items).toHaveLength(1);

    const investment = await service.investmentAccounts.create(owner, { financialAccountId: account.id, name: "Brokerage", currency: "USD" });
    expect((await service.investmentAccounts.update(owner, investment.id, { name: "Long term" })).name).toBe("Long term");
    expect((await service.investmentAccounts.get(owner, investment.id)).financialAccountId).toBe(account.id);
    expect((await service.investmentAccounts.list(owner)).items).toHaveLength(1);

    const loan = await service.loans.create(owner, { name: "Auto", principal: money("20000"), outstandingBalance: money("15000"), startedOn: "2026-01-01", endsOn: "2030-01-01" });
    expect((await service.loans.update(owner, loan.id, { outstandingBalance: money("14000") })).outstandingBalance.amount).toBe("14000");
    expect((await service.loans.get(owner, loan.id)).principal.amount).toBe("20000");
    expect((await service.loans.list(owner)).items).toHaveLength(1);
    expect((await service.loans.close(owner, loan.id)).status).toBe("closed");

    const goal = await service.goals.create(owner, { name: "Emergency fund", targetAmount: money("10000"), recordedProgressAmount: money("2500"), targetDate: "2027-09-18" });
    expect((await service.goals.update(owner, goal.id, { recordedProgressAmount: money("3000") })).recordedProgressAmount?.amount).toBe("3000");
    expect((await service.goals.get(owner, goal.id)).name).toBe("Emergency fund");
    expect((await service.goals.list(owner)).items).toHaveLength(1);
    expect((await service.goals.progress(owner, goal.id)).progress.value).toBe("30");
    expect((await service.goals.complete(owner, goal.id)).status).toBe("completed");
    expect((await service.goals.archive(owner, goal.id)).status).toBe("archived");

    const sipInput = { version: "1.0.0", assumptions: [], sourceReferences: [], periodicContribution: money("100"), expectedReturn: { value: "0", representation: "human_percentage", period: "month", compoundingFrequency: "monthly" }, contributionCount: 2, contributionTiming: "end_of_period" } as const;
    const scenario = await service.scenarios.create(owner, { calculatorId: "sip", calculatorVersion: "1.0.0", name: "Starter", input: sipInput });
    expect((await service.scenarios.update(owner, scenario.id, { name: "Starter updated" })).name).toBe("Starter updated");
    expect((await service.scenarios.get(owner, scenario.id)).calculatorId).toBe("sip");
    expect((await service.scenarios.list(owner, { calculatorId: "sip" })).items).toHaveLength(1);

    expect(service.calculators.list()).toHaveLength(36);
    expect(service.calculators.get("sip")?.id).toBe("sip");
    expect(service.calculators.byCategory("retirement")).toHaveLength(6);
    expect(service.calculators.search("scheduled withdrawals").map(({ id }) => id)).toContain("swp");
    expect(service.calculators.execute("sip", sipInput)).toMatchObject({ investedAmount: money("200"), estimatedValue: money("200") });

    expect(await service.summaries.transactions(owner, "USD")).toEqual({ income: money("0"), expenses: money("25"), transactionCount: 1 });
    expect(await service.summaries.netWorth(owner, "USD")).toEqual({ totalAssets: money("310000"), totalLiabilities: money("199000"), recordedNetWorth: money("111000") });

    expect((await service.categories.archive(owner, expenseCategory.id)).status).toBe("archived");
    expect((await service.budgets.archive(owner, budget.id)).status).toBe("archived");
    expect((await service.incomeSources.archive(owner, income.id)).status).toBe("archived");
    expect((await service.assets.archive(owner, asset.id)).status).toBe("archived");
    expect((await service.liabilities.archive(owner, liability.id)).status).toBe("archived");
    expect((await service.investmentAccounts.archive(owner, investment.id)).status).toBe("archived");
    await service.transactions.delete(owner, transaction.id);
    await service.budgetLines.delete(owner, line.id);
    await service.scenarios.delete(owner, scenario.id);
    expect((await service.transactions.list(owner)).items).toHaveLength(0);
    expect((await service.budgetLines.list(owner, { budgetId: budget.id })).items).toHaveLength(0);
    expect((await service.scenarios.list(owner)).items).toHaveLength(0);
  });

  it("enforces owner isolation, generated validation, duplicates, and lifecycle operations", async () => {
    const { service, fakes } = testComposition();
    await expect(service.accounts.create({ ownerId: "" }, { name: "A", accountType: "bank", currency: "USD" })).rejects.toMatchObject({ code: "finance-invalid-input" });
    await expect(service.accounts.create(owner, { ownerId: "injected", name: "A", accountType: "bank", currency: "USD" } as never)).rejects.toMatchObject({ code: "finance-invalid-input" });
    const account = await service.accounts.create(owner, { name: "Checking", accountType: "bank", currency: "USD" });
    await expect(service.accounts.get(otherOwner, account.id)).rejects.toMatchObject({ code: "finance-not-found" });
    await expect(service.accounts.create(owner, { name: " checking ", accountType: "cash", currency: "USD" })).rejects.toMatchObject({ code: "finance-conflict" });
    await expect(service.accounts.update(owner, account.id, { status: "archived" })).rejects.toMatchObject({ code: "finance-invalid-state-transition" });
    await service.accounts.close(owner, account.id);
    await expect(service.accounts.close(owner, account.id)).rejects.toMatchObject({ code: "finance-invalid-state-transition" });

    const stored = fakes.accounts.records.get(account.id);
    expect(stored).toBeDefined();
    fakes.accounts.records.set(account.id, { ...stored, ownerId: owner.ownerId, id: "wrong-id" } as StoredEntity);
    await expect(service.accounts.get(owner, account.id)).rejects.toMatchObject({ code: "finance-repository-contract-violation" });
  });

  it("rejects invalid relationships, currencies, monetary boundaries, and duplicate business records", async () => {
    const { service } = testComposition();
    const usd = await service.accounts.create(owner, { name: "USD", accountType: "bank", currency: "USD" });
    const income = await service.categories.create(owner, { name: "Salary", kind: "income" });
    const expense = await service.categories.create(owner, { name: "Food", kind: "expense" });
    await expect(service.transactions.create(owner, { accountId: usd.id, categoryId: income.id, description: "Bad", transactionType: "expense", amount: money("1"), occurredAt: "2026-09-18T09:00:00Z" })).rejects.toMatchObject({ code: "finance-relationship-invalid" });
    await expect(service.transactions.create(owner, { accountId: usd.id, categoryId: expense.id, description: "Bad", transactionType: "expense", amount: money("1", "INR"), occurredAt: "2026-09-18T09:00:00Z" })).rejects.toMatchObject({ code: "finance-relationship-invalid" });
    const transactionInput = { accountId: usd.id, categoryId: expense.id, description: "Lunch", transactionType: "expense" as const, amount: money("10"), occurredAt: "2026-09-18T09:00:00Z" };
    await service.transactions.create(owner, transactionInput);
    await expect(service.transactions.create(owner, transactionInput)).rejects.toMatchObject({ code: "finance-conflict" });

    const budget = await service.budgets.create(owner, { name: "Monthly", currency: "USD", period: "month", startsOn: "2026-09-01", endsOn: "2026-09-30" });
    await expect(service.budgetLines.create(owner, { budgetId: budget.id, categoryId: income.id, allocatedAmount: money("10") })).rejects.toMatchObject({ code: "finance-relationship-invalid" });
    await service.budgetLines.create(owner, { budgetId: budget.id, categoryId: expense.id, allocatedAmount: money("10") });
    await expect(service.budgetLines.create(owner, { budgetId: budget.id, categoryId: expense.id, allocatedAmount: money("20") })).rejects.toMatchObject({ code: "finance-conflict" });
    await expect(service.investmentAccounts.create(owner, { financialAccountId: usd.id, name: "Mismatch", currency: "INR" })).rejects.toMatchObject({ code: "finance-relationship-invalid" });
    await expect(service.loans.create(owner, { name: "Invalid", principal: money("100"), outstandingBalance: money("101") })).rejects.toMatchObject({ code: "finance-invalid-input" });
    await expect(service.goals.create(owner, { name: "Invalid", targetAmount: money("100"), recordedProgressAmount: money("1", "INR") })).rejects.toMatchObject({ code: "finance-invalid-input" });
  });

  it("uses the injected calculator registry for discovery, execution, and saved-scenario validation", async () => {
    const { service, dependencies } = testComposition();
    expect(service.calculators.get("missing")).toBeUndefined();
    expect(() => service.calculators.execute("missing", {})).toThrowError(expect.objectContaining({ code: "finance-calculator-not-found" }));
    expect(() => service.calculators.execute("sip", {})).toThrowError(expect.objectContaining({ code: "finance-invalid-input" }));
    await expect(service.scenarios.create(owner, { calculatorId: "missing", calculatorVersion: "1.0.0", name: "Missing", input: {} })).rejects.toMatchObject({ code: "finance-calculator-not-found" });
    await expect(service.scenarios.create(owner, { calculatorId: "sip", calculatorVersion: "2.0.0", name: "Wrong version", input: {} })).rejects.toMatchObject({ code: "finance-invalid-input" });
    await expect(service.scenarios.create(owner, { calculatorId: "sip", calculatorVersion: "1.0.0", name: "Bad input", input: {} })).rejects.toMatchObject({ code: "finance-invalid-input" });
    expect(() => createFinanceApplicationService({ ...dependencies, calculatorRegistry: [allFinanceCalculatorPlugins[0]!, allFinanceCalculatorPlugins[0]!] })).toThrowError(expect.objectContaining({ code: "finance-conflict" }));
  });

  it("detects a repository owner contract violation", async () => {
    const { service, fakes } = testComposition();
    const account = await service.accounts.create(owner, { name: "Checking", accountType: "bank", currency: "USD" });
    fakes.accounts.implementation.findById = async () => ({ ...account, ownerId: "intruder" });
    await expect(service.accounts.get(owner, account.id)).rejects.toMatchObject({ code: "finance-owner-mismatch" });
  });
});
