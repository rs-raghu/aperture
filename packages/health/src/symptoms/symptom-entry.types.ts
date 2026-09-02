import type { EntityMetadata, IsoDateTimeString } from "../health.types.js";

export type SymptomEntryId = string;

export interface SymptomSeverity {
  readonly value: number;
  readonly scale: "zero_to_ten";
}

export interface SymptomEntry extends EntityMetadata {
  readonly id: SymptomEntryId;
  readonly observation: string;
  readonly severity?: SymptomSeverity;
  readonly observedAt: IsoDateTimeString;
}
