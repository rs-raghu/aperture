import type { CrudRepository } from "../repositories/repository.types.js";
import type { RecordVitalReadingInput, UpdateVitalReadingInput, VitalReadingListQuery } from "./vital-reading.contracts.js";
import type { VitalReading, VitalReadingId } from "./vital-reading.types.js";

export interface VitalReadingRepository
  extends CrudRepository<VitalReading, VitalReadingId, RecordVitalReadingInput, UpdateVitalReadingInput, VitalReadingListQuery> {}
