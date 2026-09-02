import type { EntityMetadata, IsoDateTimeString } from "../health.types.js";
import type { MedicationId } from "./medication.types.js";

export type MedicationLogId = string;
export type MedicationLogStatus = "taken" | "skipped";

export interface MedicationLog extends EntityMetadata {
  readonly id: MedicationLogId;
  readonly medicationId: MedicationId;
  readonly status: MedicationLogStatus;
  readonly scheduledAt?: IsoDateTimeString;
  readonly recordedAt: IsoDateTimeString;
}
