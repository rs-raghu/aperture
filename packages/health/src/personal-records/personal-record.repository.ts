import type { CrudRepository } from "../repositories/repository.types.js";
import type { PersonalRecordListQuery, RecordPersonalRecordInput, UpdatePersonalRecordInput } from "./personal-record.contracts.js";
import type { PersonalRecord, PersonalRecordId } from "./personal-record.types.js";

export interface PersonalRecordRepository
  extends CrudRepository<PersonalRecord, PersonalRecordId, RecordPersonalRecordInput, UpdatePersonalRecordInput, PersonalRecordListQuery> {}
