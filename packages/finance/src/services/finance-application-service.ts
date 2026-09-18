import { Decimal } from "decimal.js";

import type { Money } from "../money.types.js";
import type { CalculatorCategory, CreateSavedCalculatorScenarioInput, SavedCalculatorScenario, SavedCalculatorScenarioListQuery, UpdateSavedCalculatorScenarioInput } from "../calculators/calculator.types.js";
import type { CreateFinancialAccountInput, FinancialAccountListQuery, UpdateFinancialAccountInput } from "../accounts/financial-account.contracts.js";
import type { FinancialAccount } from "../accounts/financial-account.types.js";
import type { CreateTransactionInput, TransactionListQuery, UpdateTransactionInput } from "../transactions/transaction.contracts.js";
import type { Transaction } from "../transactions/transaction.types.js";
import type { CreateTransactionCategoryInput, TransactionCategoryListQuery, UpdateTransactionCategoryInput } from "../categories/transaction-category.contracts.js";
import type { TransactionCategory } from "../categories/transaction-category.types.js";
import type { BudgetLineListQuery, BudgetListQuery, CreateBudgetInput, CreateBudgetLineInput, UpdateBudgetInput, UpdateBudgetLineInput } from "../budgets/budget.contracts.js";
import type { Budget } from "../budgets/budget.types.js";
import type { BudgetLine } from "../budgets/budget-line.types.js";
import type { CreateIncomeSourceInput, IncomeSourceListQuery, UpdateIncomeSourceInput } from "../income/income-source.contracts.js";
import type { IncomeSource } from "../income/income-source.types.js";
import type { AssetListQuery, CreateAssetInput, UpdateAssetInput } from "../assets/asset.contracts.js";
import type { Asset } from "../assets/asset.types.js";
import type { CreateLiabilityInput, LiabilityListQuery, UpdateLiabilityInput } from "../liabilities/liability.contracts.js";
import type { Liability } from "../liabilities/liability.types.js";
import type { CreateInvestmentAccountInput, InvestmentAccountListQuery, UpdateInvestmentAccountInput } from "../investments/investment-account.contracts.js";
import type { InvestmentAccount } from "../investments/investment-account.types.js";
import type { CreateLoanInput, LoanListQuery, UpdateLoanInput } from "../loans/loan.contracts.js";
import type { Loan } from "../loans/loan.types.js";
import type { CreateFinancialGoalInput, FinancialGoalListQuery, UpdateFinancialGoalInput } from "../financial-goals/financial-goal.contracts.js";
import type { FinancialGoal } from "../financial-goals/financial-goal.types.js";
import {
  assetListQuerySchema, assetSchema, budgetLineListQuerySchema, budgetLineSchema, budgetListQuerySchema, budgetSchema,
  createAssetInputSchema, createBudgetInputSchema, createBudgetLineInputSchema, createFinancialAccountInputSchema,
  createFinancialGoalInputSchema, createIncomeSourceInputSchema, createInvestmentAccountInputSchema, createLiabilityInputSchema,
  createLoanInputSchema, createSavedCalculatorScenarioInputSchema, createTransactionCategoryInputSchema, createTransactionInputSchema,
  financialAccountListQuerySchema, financialAccountSchema, financialGoalListQuerySchema, financialGoalSchema,
  incomeSourceListQuerySchema, incomeSourceSchema, investmentAccountListQuerySchema, investmentAccountSchema,
  liabilityListQuerySchema, liabilitySchema, loanListQuerySchema, loanSchema, savedCalculatorScenarioListQuerySchema,
  savedCalculatorScenarioSchema, transactionCategoryListQuerySchema, transactionCategorySchema, transactionListQuerySchema,
  transactionSchema, updateAssetInputSchema, updateBudgetInputSchema, updateBudgetLineInputSchema,
  updateFinancialAccountInputSchema, updateFinancialGoalInputSchema, updateIncomeSourceInputSchema,
  updateInvestmentAccountInputSchema, updateLiabilityInputSchema, updateLoanInputSchema,
  updateSavedCalculatorScenarioInputSchema, updateTransactionCategoryInputSchema, updateTransactionInputSchema,
} from "../generated/finance.schemas.js";
import { collectAll, createCrudUseCases, validateContext } from "../application/crud-use-cases.js";
import { FinanceApplicationError } from "../application/application.errors.js";
import type { FinanceOperationContext, FinanceServiceDependencies } from "../application/application.types.js";

function normalizeName(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function decimalAmount(money: Money, label: string, positive = false): Decimal {
  const value = new Decimal(money.amount);
  if ((positive && !value.gt(0)) || (!positive && value.isNegative())) {
    throw new FinanceApplicationError("finance-invalid-input", `${label} must ${positive ? "be greater than zero" : "not be negative"}.`);
  }
  return value;
}

function sameCurrency(label: string, ...values: readonly Money[]): string {
  const currency = values[0]?.currency;
  if (!currency || values.some((value) => value.currency !== currency)) {
    throw new FinanceApplicationError("finance-invalid-input", `${label} must use one currency.`);
  }
  return currency;
}

function conflict(entityType: string, name: string): never {
  throw new FinanceApplicationError("finance-conflict", `${entityType} already exists.`, { entityType, name });
}

async function assertUniqueName<TEntity extends { readonly id: string; readonly name: string }>(
  items: Promise<readonly TEntity[]>, entityType: string, name: string, excludeId?: string,
): Promise<void> {
  const normalized = normalizeName(name);
  if ((await items).some((item) => item.id !== excludeId && normalizeName(item.name) === normalized)) conflict(entityType, name);
}

export function createFinanceApplicationService(dependencies: FinanceServiceDependencies) {
  const { repositories } = dependencies;
  const ids = new Set<string>();
  for (const plugin of dependencies.calculatorRegistry) {
    if (ids.has(plugin.manifest.id)) throw new FinanceApplicationError("finance-conflict", "Calculator registry contains a duplicate identifier.", { calculatorId: plugin.manifest.id });
    ids.add(plugin.manifest.id);
  }

  const accountsCrud = createCrudUseCases<FinancialAccount, string, CreateFinancialAccountInput, UpdateFinancialAccountInput, FinancialAccountListQuery>(dependencies, repositories.accounts, {
    entityType: "financial account", createSchema: createFinancialAccountInputSchema, updateSchema: updateFinancialAccountInputSchema,
    querySchema: financialAccountListQuerySchema, entitySchema: financialAccountSchema, defaults: { status: "active" }, managedStatus: true,
    hooks: {
      beforeCreate: async (input, context) => assertUniqueName(collectAll(repositories.accounts, context, {}), "financial account", input.name),
      beforeUpdate: async (existing, input, context) => input.name === undefined ? undefined : assertUniqueName(collectAll(repositories.accounts, context, {}), "financial account", input.name, existing.id),
    },
  });

  const categoriesCrud = createCrudUseCases<TransactionCategory, string, CreateTransactionCategoryInput, UpdateTransactionCategoryInput, TransactionCategoryListQuery>(dependencies, repositories.categories, {
    entityType: "transaction category", createSchema: createTransactionCategoryInputSchema, updateSchema: updateTransactionCategoryInputSchema,
    querySchema: transactionCategoryListQuerySchema, entitySchema: transactionCategorySchema, defaults: { status: "active", systemCategory: false }, managedStatus: true,
    hooks: {
      beforeCreate: async (input, context) => {
        const items = await collectAll(repositories.categories, context, {});
        if (items.some((item) => normalizeName(item.name) === normalizeName(input.name) && item.kind === input.kind)) conflict("transaction category", input.name);
      },
      beforeUpdate: async (existing, input, context) => {
        if (input.name === undefined && input.kind === undefined) return;
        const name = input.name ?? existing.name;
        const kind = input.kind ?? existing.kind;
        const items = await collectAll(repositories.categories, context, {});
        if (items.some((item) => item.id !== existing.id && normalizeName(item.name) === normalizeName(name) && item.kind === kind)) conflict("transaction category", name);
      },
    },
  });

  const validateTransactionRelationships = async (context: FinanceOperationContext, accountId: string, categoryId: string | undefined, transactionType: string, amount: Money) => {
    const account = await accountsCrud.requireOwned(context, accountId);
    decimalAmount(amount, "Transaction amount", true);
    if (account.currency !== amount.currency) throw new FinanceApplicationError("finance-relationship-invalid", "Transaction currency must match its account.", { accountId });
    if (categoryId !== undefined) {
      const category = await categoriesCrud.requireOwned(context, categoryId);
      if (category.kind !== transactionType) throw new FinanceApplicationError("finance-relationship-invalid", "Transaction category kind must match transaction type.", { categoryId, transactionType });
    }
  };

  const transactionsCrud = createCrudUseCases<Transaction, string, CreateTransactionInput, UpdateTransactionInput, TransactionListQuery>(dependencies, repositories.transactions, {
    entityType: "transaction", createSchema: createTransactionInputSchema, updateSchema: updateTransactionInputSchema,
    querySchema: transactionListQuerySchema, entitySchema: transactionSchema, defaults: { status: "active", reviewed: false },
    hooks: {
      beforeCreate: async (input, context) => {
        await validateTransactionRelationships(context, input.accountId, input.categoryId, input.transactionType, input.amount);
        const items = await collectAll(repositories.transactions, context, { accountId: input.accountId });
        if (items.some((item) => item.transactionType === input.transactionType && item.amount.amount === input.amount.amount && item.amount.currency === input.amount.currency && item.occurredAt === input.occurredAt && normalizeName(item.description) === normalizeName(input.description))) {
          throw new FinanceApplicationError("finance-conflict", "A matching transaction already exists.", { accountId: input.accountId, occurredAt: input.occurredAt });
        }
      },
      beforeUpdate: async (existing, input, context) => validateTransactionRelationships(context, existing.accountId, input.categoryId ?? existing.categoryId, existing.transactionType, input.amount ?? existing.amount),
    },
  });

  const budgetsCrud = createCrudUseCases<Budget, string, CreateBudgetInput, UpdateBudgetInput, BudgetListQuery>(dependencies, repositories.budgets, {
    entityType: "budget", createSchema: createBudgetInputSchema, updateSchema: updateBudgetInputSchema,
    querySchema: budgetListQuerySchema, entitySchema: budgetSchema, defaults: { status: "draft" }, managedStatus: true,
    hooks: {
      beforeCreate: async (input, context) => assertUniqueName(collectAll(repositories.budgets, context, {}), "budget", input.name),
      beforeUpdate: async (existing, input, context) => input.name === undefined ? undefined : assertUniqueName(collectAll(repositories.budgets, context, {}), "budget", input.name, existing.id),
    },
  });

  const budgetLinesCrud = createCrudUseCases<BudgetLine, string, CreateBudgetLineInput, UpdateBudgetLineInput, BudgetLineListQuery>(dependencies, repositories.budgetLines, {
    entityType: "budget line", createSchema: createBudgetLineInputSchema, updateSchema: updateBudgetLineInputSchema,
    querySchema: budgetLineListQuerySchema, entitySchema: budgetLineSchema,
    hooks: {
      beforeCreate: async (input, context) => {
        const budget = await budgetsCrud.requireOwned(context, input.budgetId);
        const category = await categoriesCrud.requireOwned(context, input.categoryId);
        if (category.kind !== "expense") throw new FinanceApplicationError("finance-relationship-invalid", "Budget lines require an expense category.", { categoryId: category.id });
        if (budget.currency !== input.allocatedAmount.currency) throw new FinanceApplicationError("finance-relationship-invalid", "Budget line currency must match its budget.", { budgetId: budget.id });
        decimalAmount(input.allocatedAmount, "Allocated amount");
        const lines = await collectAll(repositories.budgetLines, context, { budgetId: input.budgetId });
        if (lines.some((line) => line.categoryId === input.categoryId)) throw new FinanceApplicationError("finance-conflict", "A budget line already exists for this category.", { budgetId: input.budgetId, categoryId: input.categoryId });
      },
      beforeUpdate: async (existing, input, context) => {
        const budget = await budgetsCrud.requireOwned(context, existing.budgetId);
        const categoryId = input.categoryId ?? existing.categoryId;
        const category = await categoriesCrud.requireOwned(context, categoryId);
        if (category.kind !== "expense") throw new FinanceApplicationError("finance-relationship-invalid", "Budget lines require an expense category.", { categoryId });
        const amount = input.allocatedAmount ?? existing.allocatedAmount;
        if (amount.currency !== budget.currency) throw new FinanceApplicationError("finance-relationship-invalid", "Budget line currency must match its budget.", { budgetId: budget.id });
        decimalAmount(amount, "Allocated amount");
        const lines = await collectAll(repositories.budgetLines, context, { budgetId: existing.budgetId });
        if (lines.some((line) => line.id !== existing.id && line.categoryId === categoryId)) throw new FinanceApplicationError("finance-conflict", "A budget line already exists for this category.", { budgetId: existing.budgetId, categoryId });
      },
    },
  });

  const incomeSourcesCrud = createCrudUseCases<IncomeSource, string, CreateIncomeSourceInput, UpdateIncomeSourceInput, IncomeSourceListQuery>(dependencies, repositories.incomeSources, {
    entityType: "income source", createSchema: createIncomeSourceInputSchema, updateSchema: updateIncomeSourceInputSchema,
    querySchema: incomeSourceListQuerySchema, entitySchema: incomeSourceSchema, defaults: { status: "active" }, managedStatus: true,
    hooks: {
      beforeCreate: async (input, context) => { await assertUniqueName(collectAll(repositories.incomeSources, context, {}), "income source", input.name); if (input.expectedAmount) decimalAmount(input.expectedAmount, "Expected income"); },
      beforeUpdate: async (existing, input, context) => { if (input.name) await assertUniqueName(collectAll(repositories.incomeSources, context, {}), "income source", input.name, existing.id); if (input.expectedAmount) decimalAmount(input.expectedAmount, "Expected income"); },
    },
  });

  const assetsCrud = createCrudUseCases<Asset, string, CreateAssetInput, UpdateAssetInput, AssetListQuery>(dependencies, repositories.assets, {
    entityType: "asset", createSchema: createAssetInputSchema, updateSchema: updateAssetInputSchema, querySchema: assetListQuerySchema,
    entitySchema: assetSchema, defaults: { status: "active" }, managedStatus: true,
    hooks: {
      beforeCreate: async (input, context) => { await assertUniqueName(collectAll(repositories.assets, context, {}), "asset", input.name); decimalAmount(input.currentValue, "Asset value"); },
      beforeUpdate: async (existing, input, context) => { if (input.name) await assertUniqueName(collectAll(repositories.assets, context, {}), "asset", input.name, existing.id); if (input.currentValue) decimalAmount(input.currentValue, "Asset value"); },
    },
  });

  const liabilitiesCrud = createCrudUseCases<Liability, string, CreateLiabilityInput, UpdateLiabilityInput, LiabilityListQuery>(dependencies, repositories.liabilities, {
    entityType: "liability", createSchema: createLiabilityInputSchema, updateSchema: updateLiabilityInputSchema, querySchema: liabilityListQuerySchema,
    entitySchema: liabilitySchema, defaults: { status: "active" }, managedStatus: true,
    hooks: {
      beforeCreate: async (input, context) => { await assertUniqueName(collectAll(repositories.liabilities, context, {}), "liability", input.name); decimalAmount(input.outstandingBalance, "Outstanding balance"); },
      beforeUpdate: async (existing, input, context) => { if (input.name) await assertUniqueName(collectAll(repositories.liabilities, context, {}), "liability", input.name, existing.id); if (input.outstandingBalance) decimalAmount(input.outstandingBalance, "Outstanding balance"); },
    },
  });

  const investmentAccountsCrud = createCrudUseCases<InvestmentAccount, string, CreateInvestmentAccountInput, UpdateInvestmentAccountInput, InvestmentAccountListQuery>(dependencies, repositories.investmentAccounts, {
    entityType: "investment account", createSchema: createInvestmentAccountInputSchema, updateSchema: updateInvestmentAccountInputSchema,
    querySchema: investmentAccountListQuerySchema, entitySchema: investmentAccountSchema, defaults: { status: "active" }, managedStatus: true,
    hooks: {
      beforeCreate: async (input, context) => {
        await assertUniqueName(collectAll(repositories.investmentAccounts, context, {}), "investment account", input.name);
        if (input.financialAccountId) {
          const account = await accountsCrud.requireOwned(context, input.financialAccountId);
          if (account.currency !== input.currency) throw new FinanceApplicationError("finance-relationship-invalid", "Investment account currency must match its linked financial account.", { financialAccountId: account.id });
        }
      },
      beforeUpdate: async (existing, input, context) => input.name === undefined ? undefined : assertUniqueName(collectAll(repositories.investmentAccounts, context, {}), "investment account", input.name, existing.id),
    },
  });

  const loansCrud = createCrudUseCases<Loan, string, CreateLoanInput, UpdateLoanInput, LoanListQuery>(dependencies, repositories.loans, {
    entityType: "loan", createSchema: createLoanInputSchema, updateSchema: updateLoanInputSchema, querySchema: loanListQuerySchema,
    entitySchema: loanSchema, defaults: { status: "active" }, managedStatus: true,
    hooks: {
      beforeCreate: async (input, context) => {
        await assertUniqueName(collectAll(repositories.loans, context, {}), "loan", input.name);
        sameCurrency("Loan principal and outstanding balance", input.principal, input.outstandingBalance);
        const principal = decimalAmount(input.principal, "Loan principal", true);
        const outstanding = decimalAmount(input.outstandingBalance, "Outstanding balance");
        if (outstanding.gt(principal)) throw new FinanceApplicationError("finance-invalid-input", "Outstanding balance must not exceed principal at creation.");
      },
      beforeUpdate: async (existing, input, context) => {
        if (input.name) await assertUniqueName(collectAll(repositories.loans, context, {}), "loan", input.name, existing.id);
        if (input.outstandingBalance) {
          sameCurrency("Loan balance", existing.principal, input.outstandingBalance);
          decimalAmount(input.outstandingBalance, "Outstanding balance");
        }
      },
    },
  });

  const goalsCrud = createCrudUseCases<FinancialGoal, string, CreateFinancialGoalInput, UpdateFinancialGoalInput, FinancialGoalListQuery>(dependencies, repositories.financialGoals, {
    entityType: "financial goal", createSchema: createFinancialGoalInputSchema, updateSchema: updateFinancialGoalInputSchema,
    querySchema: financialGoalListQuerySchema, entitySchema: financialGoalSchema, defaults: { status: "active" }, managedStatus: true,
    hooks: {
      beforeCreate: async (input, context) => {
        await assertUniqueName(collectAll(repositories.financialGoals, context, {}), "financial goal", input.name);
        decimalAmount(input.targetAmount, "Goal target", true);
        if (input.recordedProgressAmount) { sameCurrency("Goal amounts", input.targetAmount, input.recordedProgressAmount); decimalAmount(input.recordedProgressAmount, "Goal progress"); }
      },
      beforeUpdate: async (existing, input, context) => {
        if (input.name) await assertUniqueName(collectAll(repositories.financialGoals, context, {}), "financial goal", input.name, existing.id);
        const target = input.targetAmount ?? existing.targetAmount;
        const progress = input.recordedProgressAmount ?? existing.recordedProgressAmount;
        decimalAmount(target, "Goal target", true);
        if (progress) { sameCurrency("Goal amounts", target, progress); decimalAmount(progress, "Goal progress"); }
      },
    },
  });

  const findPlugin = (calculatorId: string) => dependencies.calculatorRegistry.find(({ manifest }) => manifest.id === calculatorId);
  const validateScenario = (input: CreateSavedCalculatorScenarioInput | (UpdateSavedCalculatorScenarioInput & { readonly calculatorId: string; readonly calculatorVersion: string; readonly input: Readonly<Record<string, unknown>> })) => {
    const plugin = findPlugin(input.calculatorId);
    if (!plugin) throw new FinanceApplicationError("finance-calculator-not-found", "Calculator was not found.", { calculatorId: input.calculatorId });
    if (plugin.manifest.version !== input.calculatorVersion) throw new FinanceApplicationError("finance-invalid-input", "Saved scenario version must match the calculator version.", { calculatorId: input.calculatorId });
    const validation = plugin.inputSchema.safeParse(input.input);
    if (!validation.success) throw new FinanceApplicationError("finance-invalid-input", "Saved scenario input is invalid for its calculator.", { calculatorId: input.calculatorId, issues: validation.error.issues });
  };

  const scenariosCrud = createCrudUseCases<SavedCalculatorScenario, string, CreateSavedCalculatorScenarioInput, UpdateSavedCalculatorScenarioInput, SavedCalculatorScenarioListQuery>(dependencies, repositories.calculatorScenarios, {
    entityType: "calculator scenario", createSchema: createSavedCalculatorScenarioInputSchema, updateSchema: updateSavedCalculatorScenarioInputSchema,
    querySchema: savedCalculatorScenarioListQuerySchema, entitySchema: savedCalculatorScenarioSchema,
    hooks: {
      beforeCreate: async (input, context) => {
        validateScenario(input);
        const scenarios = await collectAll(repositories.calculatorScenarios, context, { calculatorId: input.calculatorId });
        if (scenarios.some((scenario) => normalizeName(scenario.name) === normalizeName(input.name))) conflict("calculator scenario", input.name);
      },
      beforeUpdate: async (existing, input, context) => {
        validateScenario({ ...input, calculatorId: existing.calculatorId, calculatorVersion: existing.calculatorVersion, input: input.input ?? existing.input });
        if (input.name) {
          const name = input.name;
          const scenarios = await collectAll(repositories.calculatorScenarios, context, { calculatorId: existing.calculatorId });
          if (scenarios.some((scenario) => scenario.id !== existing.id && normalizeName(scenario.name) === normalizeName(name))) conflict("calculator scenario", name);
        }
      },
    },
  });

  const service = {
    accounts: Object.freeze({ create: accountsCrud.create, update: accountsCrud.update, get: accountsCrud.get, list: accountsCrud.list, archive: (context: FinanceOperationContext, id: string) => accountsCrud.transition(context, id, ["active", "paused", "closed"], "archived"), close: (context: FinanceOperationContext, id: string) => accountsCrud.transition(context, id, ["active", "paused"], "closed") }),
    transactions: Object.freeze({ create: transactionsCrud.create, update: transactionsCrud.update, get: transactionsCrud.get, list: transactionsCrud.list, delete: transactionsCrud.delete }),
    categories: Object.freeze({ create: categoriesCrud.create, update: categoriesCrud.update, get: categoriesCrud.get, list: categoriesCrud.list, archive: (context: FinanceOperationContext, id: string) => categoriesCrud.transition(context, id, ["active", "paused"], "archived") }),
    budgets: Object.freeze({ create: budgetsCrud.create, update: budgetsCrud.update, get: budgetsCrud.get, list: budgetsCrud.list, archive: (context: FinanceOperationContext, id: string) => budgetsCrud.transition(context, id, ["draft", "active", "paused", "completed"], "archived") }),
    budgetLines: Object.freeze({ create: budgetLinesCrud.create, update: budgetLinesCrud.update, get: budgetLinesCrud.get, list: budgetLinesCrud.list, delete: budgetLinesCrud.delete }),
    incomeSources: Object.freeze({ create: incomeSourcesCrud.create, update: incomeSourcesCrud.update, get: incomeSourcesCrud.get, list: incomeSourcesCrud.list, archive: (context: FinanceOperationContext, id: string) => incomeSourcesCrud.transition(context, id, ["active", "paused"], "archived") }),
    assets: Object.freeze({ create: assetsCrud.create, update: assetsCrud.update, get: assetsCrud.get, list: assetsCrud.list, archive: (context: FinanceOperationContext, id: string) => assetsCrud.transition(context, id, ["active", "paused"], "archived") }),
    liabilities: Object.freeze({ create: liabilitiesCrud.create, update: liabilitiesCrud.update, get: liabilitiesCrud.get, list: liabilitiesCrud.list, archive: (context: FinanceOperationContext, id: string) => liabilitiesCrud.transition(context, id, ["active", "paused"], "archived") }),
    investmentAccounts: Object.freeze({ create: investmentAccountsCrud.create, update: investmentAccountsCrud.update, get: investmentAccountsCrud.get, list: investmentAccountsCrud.list, archive: (context: FinanceOperationContext, id: string) => investmentAccountsCrud.transition(context, id, ["active", "paused"], "archived") }),
    loans: Object.freeze({ create: loansCrud.create, update: loansCrud.update, get: loansCrud.get, list: loansCrud.list, close: (context: FinanceOperationContext, id: string) => loansCrud.transition(context, id, ["active", "paused"], "closed") }),
    goals: Object.freeze({
      create: goalsCrud.create, update: goalsCrud.update, get: goalsCrud.get, list: goalsCrud.list,
      complete: (context: FinanceOperationContext, id: string) => goalsCrud.transition(context, id, ["active", "paused"], "completed"),
      archive: (context: FinanceOperationContext, id: string) => goalsCrud.transition(context, id, ["draft", "active", "paused", "completed"], "archived"),
      progress: async (context: FinanceOperationContext, id: string) => {
        const goal = await goalsCrud.requireOwned(context, id);
        const recorded = goal.recordedProgressAmount ?? { amount: "0", currency: goal.targetAmount.currency };
        const percentage = new Decimal(recorded.amount).dividedBy(goal.targetAmount.amount).times(100);
        return { financialGoalId: goal.id, recordedAmount: recorded, targetAmount: goal.targetAmount, progress: { value: percentage.toFixed(), representation: "human_percentage" as const } };
      },
    }),
    scenarios: Object.freeze({ create: scenariosCrud.create, update: scenariosCrud.update, get: scenariosCrud.get, list: scenariosCrud.list, delete: scenariosCrud.delete }),
    calculators: Object.freeze({
      list: () => dependencies.calculatorRegistry.map(({ manifest }) => manifest),
      get: (calculatorId: string) => findPlugin(calculatorId)?.manifest,
      byCategory: (category: CalculatorCategory) => dependencies.calculatorRegistry.filter(({ manifest }) => manifest.category === category).map(({ manifest }) => manifest),
      search: (query: string) => {
        const term = query.trim().toLocaleLowerCase();
        if (!term) return dependencies.calculatorRegistry.map(({ manifest }) => manifest);
        return dependencies.calculatorRegistry.filter(({ manifest }) => `${manifest.id} ${manifest.title} ${manifest.description}`.toLocaleLowerCase().includes(term)).map(({ manifest }) => manifest);
      },
      execute: (calculatorId: string, input: unknown): unknown => {
        const plugin = findPlugin(calculatorId);
        if (!plugin) throw new FinanceApplicationError("finance-calculator-not-found", "Calculator was not found.", { calculatorId });
        const validation = plugin.inputSchema.safeParse(input);
        if (!validation.success) throw new FinanceApplicationError("finance-invalid-input", "Calculator input is invalid.", { calculatorId, issues: validation.error.issues });
        return Reflect.apply(plugin.calculate, undefined, [validation.data]);
      },
    }),
    summaries: Object.freeze({
      transactions: async (context: FinanceOperationContext, currency: string, range?: { readonly startsOn: string; readonly endsOn: string }) => {
        const owned = validateContext(context);
        const items = await collectAll(repositories.transactions, owned, range === undefined ? {} : { range });
        let income = new Decimal(0);
        let expenses = new Decimal(0);
        for (const item of items) {
          if (item.amount.currency !== currency) continue;
          if (item.transactionType === "income") income = income.plus(item.amount.amount);
          if (item.transactionType === "expense") expenses = expenses.plus(item.amount.amount);
        }
        return { income: { amount: income.toFixed(), currency }, expenses: { amount: expenses.toFixed(), currency }, transactionCount: items.filter(({ amount }) => amount.currency === currency).length };
      },
      netWorth: async (context: FinanceOperationContext, currency: string) => {
        const owned = validateContext(context);
        const [assets, liabilities] = await Promise.all([collectAll(repositories.assets, owned, {}), collectAll(repositories.liabilities, owned, {})]);
        const totalAssets = assets.filter(({ currentValue }) => currentValue.currency === currency).reduce((total, { currentValue }) => total.plus(currentValue.amount), new Decimal(0));
        const totalLiabilities = liabilities.filter(({ outstandingBalance }) => outstandingBalance.currency === currency).reduce((total, { outstandingBalance }) => total.plus(outstandingBalance.amount), new Decimal(0));
        return { totalAssets: { amount: totalAssets.toFixed(), currency }, totalLiabilities: { amount: totalLiabilities.toFixed(), currency }, recordedNetWorth: { amount: totalAssets.minus(totalLiabilities).toFixed(), currency } };
      },
    }),
  };

  return Object.freeze(service);
}

export type FinanceApplicationService = ReturnType<typeof createFinanceApplicationService>;
