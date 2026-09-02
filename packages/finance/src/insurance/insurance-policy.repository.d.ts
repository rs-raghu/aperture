import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateInsurancePolicyInput, InsurancePolicyListQuery, UpdateInsurancePolicyInput } from "./insurance-policy.contracts.js";
import type { InsurancePolicy, InsurancePolicyId } from "./insurance-policy.types.js";
export interface InsurancePolicyRepository extends CrudRepository<InsurancePolicy, InsurancePolicyId, CreateInsurancePolicyInput, UpdateInsurancePolicyInput, InsurancePolicyListQuery> {}
