import type { FinancialStatus, IsoDate, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { Liability, LiabilityId, LiabilityType } from "./liability.types.js";
export interface CreateLiabilityInput { readonly ownerId: OwnerId; readonly name: string; readonly liabilityType: LiabilityType; readonly outstandingBalance: Money; readonly valuedOn: IsoDate; }
export interface UpdateLiabilityInput { readonly name?: string; readonly outstandingBalance?: Money; readonly valuedOn?: IsoDate; readonly status?: FinancialStatus; }
export interface LiabilityListQuery extends OwnerQuery { readonly liabilityType?: LiabilityType; }
export declare function createLiability(input: CreateLiabilityInput): Promise<Liability>;
export declare function updateLiability(id: LiabilityId, ownerId: OwnerId, input: UpdateLiabilityInput): Promise<Liability>;
export declare function archiveLiability(id: LiabilityId, ownerId: OwnerId): Promise<Liability>;
export declare function getLiability(id: LiabilityId, ownerId: OwnerId): Promise<Liability | null>;
export declare function listLiabilities(query: LiabilityListQuery): Promise<PageResult<Liability>>;
