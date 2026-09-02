import type { CrudRepository } from "../repositories/repository.types.js";
import type { CalculatorScenarioId, CreateSavedCalculatorScenarioInput, SavedCalculatorScenario, SavedCalculatorScenarioListQuery, UpdateSavedCalculatorScenarioInput } from "./calculator.types.js";
export interface CalculatorScenarioRepository extends CrudRepository<SavedCalculatorScenario, CalculatorScenarioId, CreateSavedCalculatorScenarioInput, UpdateSavedCalculatorScenarioInput, SavedCalculatorScenarioListQuery> {}
