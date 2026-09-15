import type { CrudRepository } from "../repositories/repository.types.js";
import type { PersonalRecordListQuery } from "./personal-record.contracts.js";
import type { PersonalRecord, PersonalRecordId } from "./personal-record.types.js";

export interface PersonalRecordRepository
  extends CrudRepository<PersonalRecord, PersonalRecordId, PersonalRecordListQuery> {}
