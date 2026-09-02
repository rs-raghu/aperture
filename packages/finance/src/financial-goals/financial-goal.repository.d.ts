import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateFinancialGoalInput, FinancialGoalListQuery, UpdateFinancialGoalInput } from "./financial-goal.contracts.js";
import type { FinancialGoal, FinancialGoalId } from "./financial-goal.types.js";
export interface FinancialGoalRepository extends CrudRepository<FinancialGoal, FinancialGoalId, CreateFinancialGoalInput, UpdateFinancialGoalInput, FinancialGoalListQuery> {}
