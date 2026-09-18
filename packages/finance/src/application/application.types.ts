import type { allFinanceCalculatorPlugins } from "../calculators/calculator.registry.generated.js";
import type { FinanceRepository } from "../repositories/finance-repository.contract.js";

export interface FinanceOperationContext {
  readonly ownerId: string;
}

export type OwnerScopedInput<TInput extends { readonly ownerId: string }> = Omit<TInput, "ownerId">;
export type ContextualQuery<TQuery extends { readonly ownerId: string }> = Omit<TQuery, "ownerId">;
export type FinanceCalculatorPlugin = (typeof allFinanceCalculatorPlugins)[number];

export type FinanceApplicationRepositories = Pick<FinanceRepository,
  | "accounts"
  | "transactions"
  | "categories"
  | "budgets"
  | "budgetLines"
  | "incomeSources"
  | "assets"
  | "liabilities"
  | "investmentAccounts"
  | "loans"
  | "financialGoals"
  | "calculatorScenarios"
>;

export interface FinanceClock {
  now(): string;
}

export interface FinanceIdGenerator {
  next(scope: string): string;
}

export interface FinanceServiceDependencies {
  readonly repositories: FinanceApplicationRepositories;
  readonly clock: FinanceClock;
  readonly idGenerator: FinanceIdGenerator;
  readonly calculatorRegistry: readonly FinanceCalculatorPlugin[];
}
