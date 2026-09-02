import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateFinancialDocumentInput, FinancialDocumentListQuery, UpdateFinancialDocumentInput } from "./financial-document.contracts.js";
import type { FinancialDocument, FinancialDocumentId } from "./financial-document.types.js";
export interface FinancialDocumentRepository extends CrudRepository<FinancialDocument, FinancialDocumentId, CreateFinancialDocumentInput, UpdateFinancialDocumentInput, FinancialDocumentListQuery> {}
