import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateTaxProfileInput, CreateTaxRecordInput, TaxProfileListQuery, TaxRecordListQuery, UpdateTaxProfileInput, UpdateTaxRecordInput } from "./tax-record.contracts.js";
import type { TaxProfile, TaxProfileId } from "./tax-profile.types.js";
import type { TaxRecord, TaxRecordId } from "./tax-record.types.js";
export interface TaxProfileRepository extends CrudRepository<TaxProfile, TaxProfileId, CreateTaxProfileInput, UpdateTaxProfileInput, TaxProfileListQuery> {}
export interface TaxRecordRepository extends CrudRepository<TaxRecord, TaxRecordId, CreateTaxRecordInput, UpdateTaxRecordInput, TaxRecordListQuery> {}
