import type { CurrencyCode, IsoDate, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { NetWorthSnapshot, NetWorthSnapshotId } from "./net-worth-snapshot.types.js";
export interface CreateNetWorthSnapshotInput { readonly ownerId: OwnerId; readonly snapshotDate: IsoDate; readonly totalAssets: Money; readonly totalLiabilities: Money; readonly netWorth: Money; }
export interface UpdateNetWorthSnapshotInput { readonly snapshotDate?: IsoDate; readonly totalAssets?: Money; readonly totalLiabilities?: Money; readonly netWorth?: Money; }
export interface NetWorthSnapshotListQuery extends OwnerQuery {}
export interface NetWorthSummary { readonly currency: CurrencyCode; readonly latestSnapshot?: NetWorthSnapshot; }
export declare function createNetWorthSnapshot(input: CreateNetWorthSnapshotInput): Promise<NetWorthSnapshot>;
export declare function getNetWorthSnapshot(id: NetWorthSnapshotId, ownerId: OwnerId): Promise<NetWorthSnapshot | null>;
export declare function listNetWorthSnapshots(query: NetWorthSnapshotListQuery): Promise<PageResult<NetWorthSnapshot>>;
export declare function getLatestNetWorthSnapshot(ownerId: OwnerId): Promise<NetWorthSnapshot | null>;
export declare function getNetWorthSummary(ownerId: OwnerId, currency: CurrencyCode): Promise<NetWorthSummary>;
