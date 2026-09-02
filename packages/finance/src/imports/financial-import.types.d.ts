import type { FinancialMetadata, FinancialStatus } from "../finance.types.js";

export type FinancialImportId = string;
export type FinancialImportRowId = string;

export interface FinancialImport extends FinancialMetadata {
  readonly id: FinancialImportId;
  readonly fileName: string;
  readonly status: FinancialStatus;
  readonly rowCount?: number;
}

export interface FinancialImportRow extends FinancialMetadata {
  readonly id: FinancialImportRowId;
  readonly financialImportId: FinancialImportId;
  readonly rowNumber: number;
  readonly status: "pending" | "accepted" | "rejected";
  readonly fields: Readonly<Record<string, string>>;
  readonly messages: readonly string[];
}
