import type { CrudRepository } from "../repositories/repository.types.js";
import type { RecordRecoveryEntryInput, RecoveryEntryListQuery, UpdateRecoveryEntryInput } from "./recovery-entry.contracts.js";
import type { RecoveryEntry, RecoveryEntryId } from "./recovery-entry.types.js";

export interface RecoveryEntryRepository
  extends CrudRepository<RecoveryEntry, RecoveryEntryId, RecordRecoveryEntryInput, UpdateRecoveryEntryInput, RecoveryEntryListQuery> {}
