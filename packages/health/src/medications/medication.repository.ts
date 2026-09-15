import type { CrudRepository } from "../repositories/repository.types.js";
import type { MedicationListQuery, MedicationLogListQuery } from "./medication.contracts.js";
import type { MedicationLog, MedicationLogId } from "./medication-log.types.js";
import type { Medication, MedicationId } from "./medication.types.js";

export interface MedicationRepository
  extends CrudRepository<Medication, MedicationId, MedicationListQuery> {}

export interface MedicationLogRepository
  extends CrudRepository<MedicationLog, MedicationLogId, MedicationLogListQuery> {}
