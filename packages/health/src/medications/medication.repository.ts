import type { CrudRepository } from "../repositories/repository.types.js";
import type {
  CreateMedicationInput,
  MedicationListQuery,
  MedicationLogListQuery,
  RecordMedicationLogInput,
  UpdateMedicationInput,
  UpdateMedicationLogInput,
} from "./medication.contracts.js";
import type { MedicationLog, MedicationLogId } from "./medication-log.types.js";
import type { Medication, MedicationId } from "./medication.types.js";

export interface MedicationRepository
  extends CrudRepository<Medication, MedicationId, CreateMedicationInput, UpdateMedicationInput, MedicationListQuery> {}

export interface MedicationLogRepository
  extends CrudRepository<MedicationLog, MedicationLogId, RecordMedicationLogInput, UpdateMedicationLogInput, MedicationLogListQuery> {}
