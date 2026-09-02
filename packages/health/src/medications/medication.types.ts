import type { EntityMetadata, IsoDateString } from "../health.types.js";

export type MedicationId = string;
export type MedicationStatus = "active" | "archived";

export interface Medication extends EntityMetadata {
  readonly id: MedicationId;
  readonly name: string;
  readonly status: MedicationStatus;
  readonly startedOn?: IsoDateString;
  readonly endedOn?: IsoDateString;
}
