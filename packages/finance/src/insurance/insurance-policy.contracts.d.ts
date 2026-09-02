import type { FinancialFrequency, FinancialStatus, IsoDate, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { InsurancePolicy, InsurancePolicyId } from "./insurance-policy.types.js";
export interface CreateInsurancePolicyInput { readonly ownerId: OwnerId; readonly name: string; readonly policyType: string; readonly premium?: Money; readonly premiumFrequency?: FinancialFrequency; readonly coverageAmount?: Money; readonly startsOn?: IsoDate; readonly renewsOn?: IsoDate; }
export interface UpdateInsurancePolicyInput { readonly name?: string; readonly premium?: Money; readonly coverageAmount?: Money; readonly renewsOn?: IsoDate; readonly status?: FinancialStatus; }
export interface InsurancePolicyListQuery extends OwnerQuery { readonly status?: FinancialStatus; }
export interface UpcomingInsuranceRenewalsQuery extends OwnerQuery { readonly before?: IsoDate; }
export declare function createInsurancePolicy(input: CreateInsurancePolicyInput): Promise<InsurancePolicy>;
export declare function updateInsurancePolicy(id: InsurancePolicyId, ownerId: OwnerId, input: UpdateInsurancePolicyInput): Promise<InsurancePolicy>;
export declare function renewInsurancePolicy(id: InsurancePolicyId, ownerId: OwnerId, renewsOn: IsoDate): Promise<InsurancePolicy>;
export declare function archiveInsurancePolicy(id: InsurancePolicyId, ownerId: OwnerId): Promise<InsurancePolicy>;
export declare function getInsurancePolicy(id: InsurancePolicyId, ownerId: OwnerId): Promise<InsurancePolicy | null>;
export declare function listInsurancePolicies(query: InsurancePolicyListQuery): Promise<PageResult<InsurancePolicy>>;
export declare function listUpcomingInsuranceRenewals(query: UpcomingInsuranceRenewalsQuery): Promise<PageResult<InsurancePolicy>>;
