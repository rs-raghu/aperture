import type { FinancialStatus, IsoDate, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { FinancialDocument, FinancialDocumentId } from "./financial-document.types.js";
export interface CreateFinancialDocumentInput { readonly ownerId: OwnerId; readonly title: string; readonly documentType: string; readonly documentDate?: IsoDate; }
export interface UpdateFinancialDocumentInput { readonly title?: string; readonly documentType?: string; readonly documentDate?: IsoDate; readonly status?: FinancialStatus; }
export interface FinancialDocumentListQuery extends OwnerQuery { readonly documentType?: string; }
export declare function createFinancialDocument(input: CreateFinancialDocumentInput): Promise<FinancialDocument>;
export declare function updateFinancialDocument(id: FinancialDocumentId, ownerId: OwnerId, input: UpdateFinancialDocumentInput): Promise<FinancialDocument>;
export declare function archiveFinancialDocument(id: FinancialDocumentId, ownerId: OwnerId): Promise<FinancialDocument>;
export declare function getFinancialDocument(id: FinancialDocumentId, ownerId: OwnerId): Promise<FinancialDocument | null>;
export declare function listFinancialDocuments(query: FinancialDocumentListQuery): Promise<PageResult<FinancialDocument>>;
