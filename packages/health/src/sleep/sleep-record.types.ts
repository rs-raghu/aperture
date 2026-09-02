import type { EntityMetadata, IsoDateTimeString } from "../health.types.js";
import type { DurationValue } from "../health-units.types.js";

export type SleepRecordId = string;
export type SleepQuality = "poor" | "fair" | "good" | "excellent";

export interface SleepRecord extends EntityMetadata {
  readonly id: SleepRecordId;
  readonly startedAt: IsoDateTimeString;
  readonly endedAt: IsoDateTimeString;
  readonly duration?: DurationValue;
  readonly quality?: SleepQuality;
}
