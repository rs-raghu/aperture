import type { DecimalString, EntityMetadata, IsoDateTimeString } from "../health.types.js";

export type LaboratoryResultId = string;
export type LaboratoryResultValue =
  | { readonly kind: "numeric"; readonly value: DecimalString; readonly unit: string }
  | { readonly kind: "text"; readonly value: string };

export interface LaboratoryResult extends EntityMetadata {
  readonly id: LaboratoryResultId;
  readonly testName: string;
  readonly result: LaboratoryResultValue;
  readonly collectedAt: IsoDateTimeString;
}
