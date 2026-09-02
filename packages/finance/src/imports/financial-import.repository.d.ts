import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateFinancialImportInput, CreateFinancialImportRowInput, FinancialImportListQuery, FinancialImportRowListQuery, UpdateFinancialImportInput, UpdateFinancialImportRowInput } from "./financial-import.contracts.js";
import type { FinancialImport, FinancialImportId, FinancialImportRow, FinancialImportRowId } from "./financial-import.types.js";
export interface FinancialImportRepository extends CrudRepository<FinancialImport, FinancialImportId, CreateFinancialImportInput, UpdateFinancialImportInput, FinancialImportListQuery> {}
export interface FinancialImportRowRepository extends CrudRepository<FinancialImportRow, FinancialImportRowId, CreateFinancialImportRowInput, UpdateFinancialImportRowInput, FinancialImportRowListQuery> {}
