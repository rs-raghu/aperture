import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateNetWorthSnapshotInput, NetWorthSnapshotListQuery, UpdateNetWorthSnapshotInput } from "./net-worth.contracts.js";
import type { NetWorthSnapshot, NetWorthSnapshotId } from "./net-worth-snapshot.types.js";
export interface NetWorthSnapshotRepository extends CrudRepository<NetWorthSnapshot, NetWorthSnapshotId, CreateNetWorthSnapshotInput, UpdateNetWorthSnapshotInput, NetWorthSnapshotListQuery> {}
