import type { CrudRepository } from "../repositories/repository.types.js";
import type { HealthMeasurementListQuery, RecordHealthMeasurementInput, UpdateHealthMeasurementInput } from "./health-measurement.contracts.js";
import type { HealthMeasurement, HealthMeasurementId } from "./health-measurement.types.js";

export interface HealthMeasurementRepository
  extends CrudRepository<HealthMeasurement, HealthMeasurementId, RecordHealthMeasurementInput, UpdateHealthMeasurementInput, HealthMeasurementListQuery> {}
