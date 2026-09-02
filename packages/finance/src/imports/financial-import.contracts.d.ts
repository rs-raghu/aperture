import type { OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { FinancialImport, FinancialImportId, FinancialImportRow, FinancialImportRowId } from "./financial-import.types.js";
export interface CreateFinancialImportInput { readonly ownerId: OwnerId; readonly fileName: string; }
export interface UpdateFinancialImportInput { readonly fileName?: string; }
export interface FinancialImportListQuery extends OwnerQuery {}
export interface FinancialImportRowListQuery extends OwnerQuery { readonly financialImportId: FinancialImportId; }
export interface CreateFinancialImportRowInput { readonly ownerId: OwnerId; readonly financialImportId: FinancialImportId; readonly rowNumber: number; readonly fields: Readonly<Record<string, string>>; }
export interface UpdateFinancialImportRowInput { readonly status?: "pending" | "accepted" | "rejected"; readonly messages?: readonly string[]; }
export interface FinancialImportValidation { readonly financialImportId: FinancialImportId; readonly acceptedRowCount: number; readonly rejectedRowCount: number; }
export interface FinancialImportPreview { readonly financialImportId: FinancialImportId; readonly rows: readonly FinancialImportRow[]; }
export declare function createFinancialImport(input: CreateFinancialImportInput): Promise<FinancialImport>;
export declare function validateFinancialImport(id: FinancialImportId, ownerId: OwnerId): Promise<FinancialImportValidation>;
export declare function previewFinancialImport(id: FinancialImportId, ownerId: OwnerId): Promise<FinancialImportPreview>;
export declare function commitFinancialImport(id: FinancialImportId, ownerId: OwnerId): Promise<FinancialImport>;
export declare function cancelFinancialImport(id: FinancialImportId, ownerId: OwnerId): Promise<FinancialImport>;
export declare function getFinancialImport(id: FinancialImportId, ownerId: OwnerId): Promise<FinancialImport | null>;
export declare function listFinancialImports(query: FinancialImportListQuery): Promise<PageResult<FinancialImport>>;
export declare function listRejectedImportRows(query: FinancialImportRowListQuery): Promise<PageResult<FinancialImportRow>>;
