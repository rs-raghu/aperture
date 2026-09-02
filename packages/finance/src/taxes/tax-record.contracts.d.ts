import type { CurrencyCode, FinancialStatus, IsoDate, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { TaxProfile, TaxProfileId } from "./tax-profile.types.js";
import type { TaxRecord, TaxRecordId } from "./tax-record.types.js";
export interface CreateTaxProfileInput { readonly ownerId: OwnerId; readonly jurisdiction: string; readonly currency: CurrencyCode; }
export interface UpdateTaxProfileInput { readonly jurisdiction?: string; readonly status?: FinancialStatus; }
export interface TaxProfileListQuery extends OwnerQuery {}
export interface CreateTaxRecordInput { readonly ownerId: OwnerId; readonly taxProfileId: TaxProfileId; readonly financialYear: string; readonly recordType: string; readonly amount: Money; readonly recordedOn: IsoDate; }
export interface UpdateTaxRecordInput { readonly financialYear?: string; readonly recordType?: string; readonly amount?: Money; readonly recordedOn?: IsoDate; }
export interface TaxRecordListQuery extends OwnerQuery { readonly taxProfileId?: TaxProfileId; readonly financialYear?: string; }
export interface TaxRecordsByFinancialYearQuery extends OwnerQuery { readonly financialYear: string; }
export declare function createTaxProfile(input: CreateTaxProfileInput): Promise<TaxProfile>;
export declare function updateTaxProfile(id: TaxProfileId, ownerId: OwnerId, input: UpdateTaxProfileInput): Promise<TaxProfile>;
export declare function getTaxProfile(id: TaxProfileId, ownerId: OwnerId): Promise<TaxProfile | null>;
export declare function createTaxRecord(input: CreateTaxRecordInput): Promise<TaxRecord>;
export declare function updateTaxRecord(id: TaxRecordId, ownerId: OwnerId, input: UpdateTaxRecordInput): Promise<TaxRecord>;
export declare function deleteTaxRecord(id: TaxRecordId, ownerId: OwnerId): Promise<void>;
export declare function getTaxRecord(id: TaxRecordId, ownerId: OwnerId): Promise<TaxRecord | null>;
export declare function listTaxRecords(query: TaxRecordListQuery): Promise<PageResult<TaxRecord>>;
export declare function listTaxRecordsByFinancialYear(query: TaxRecordsByFinancialYearQuery): Promise<PageResult<TaxRecord>>;
