import type { FinancialMetadata, FinancialStatus, IsoDate } from "../finance.types.js";

export type FinancialDocumentId = string;

export interface FinancialDocument extends FinancialMetadata {
  readonly id: FinancialDocumentId;
  readonly title: string;
  readonly documentType: string;
  readonly documentDate?: IsoDate;
  readonly status: FinancialStatus;
}
