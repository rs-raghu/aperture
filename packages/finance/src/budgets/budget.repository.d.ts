import type { CrudRepository } from "../repositories/repository.types.js";
import type { BudgetLineListQuery, BudgetListQuery, CreateBudgetInput, CreateBudgetLineInput, UpdateBudgetInput, UpdateBudgetLineInput } from "./budget.contracts.js";
import type { BudgetLine, BudgetLineId } from "./budget-line.types.js";
import type { Budget, BudgetId } from "./budget.types.js";
export interface BudgetRepository extends CrudRepository<Budget, BudgetId, CreateBudgetInput, UpdateBudgetInput, BudgetListQuery> {}
export interface BudgetLineRepository extends CrudRepository<BudgetLine, BudgetLineId, CreateBudgetLineInput, UpdateBudgetLineInput, BudgetLineListQuery> {}
