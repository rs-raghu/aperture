import type { IsoDateString, IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { MedicationLog, MedicationLogId } from "./medication-log.types.js";
import type { Medication, MedicationId, MedicationStatus } from "./medication.types.js";

export interface CreateMedicationInput {
  readonly ownerId: OwnerId;
  readonly name: string;
  readonly startedOn?: IsoDateString;
  readonly endedOn?: IsoDateString;
}
export interface UpdateMedicationInput {
  readonly name?: string;
  readonly status?: MedicationStatus;
  readonly startedOn?: IsoDateString;
  readonly endedOn?: IsoDateString;
}
export interface MedicationListQuery extends OwnerQuery {
  readonly status?: MedicationStatus;
}
export interface RecordMedicationLogInput {
  readonly ownerId: OwnerId;
  readonly medicationId: MedicationId;
  readonly scheduledAt?: IsoDateTimeString;
  readonly recordedAt: IsoDateTimeString;
}
export interface UpdateMedicationLogInput {
  readonly scheduledAt?: IsoDateTimeString;
  readonly recordedAt?: IsoDateTimeString;
}
export interface MedicationLogListQuery extends OwnerQuery {
  readonly medicationId?: MedicationId;
}

export declare function createMedication(input: CreateMedicationInput): Promise<Medication>;
export declare function updateMedication(id: MedicationId, ownerId: OwnerId, input: UpdateMedicationInput): Promise<Medication>;
export declare function archiveMedication(id: MedicationId, ownerId: OwnerId): Promise<Medication>;
export declare function getMedication(id: MedicationId, ownerId: OwnerId): Promise<Medication | null>;
export declare function listMedications(query: MedicationListQuery): Promise<PageResult<Medication>>;
export declare function recordMedicationTaken(input: RecordMedicationLogInput): Promise<MedicationLog>;
export declare function recordMedicationSkipped(input: RecordMedicationLogInput): Promise<MedicationLog>;
export declare function updateMedicationLog(id: MedicationLogId, ownerId: OwnerId, input: UpdateMedicationLogInput): Promise<MedicationLog>;
export declare function listMedicationLogs(query: MedicationLogListQuery): Promise<PageResult<MedicationLog>>;
