import type { EntityMetadata, IsoDateTimeString } from "../health.types.js";
import type { HydrationVolumeValue } from "../health-units.types.js";

export type HydrationEntryId = string;

export interface HydrationEntry extends EntityMetadata {
  readonly id: HydrationEntryId;
  readonly volume: HydrationVolumeValue;
  readonly consumedAt: IsoDateTimeString;
}
