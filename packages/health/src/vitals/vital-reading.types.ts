import type { EntityMetadata, IsoDateTimeString } from "../health.types.js";
import type {
  BloodGlucoseValue,
  BloodPressureValue,
  HeartRateValue,
  OxygenSaturationValue,
  TemperatureValue,
} from "../health-units.types.js";

export type VitalReadingId = string;
export type VitalReadingValue =
  | { readonly type: "resting_heart_rate"; readonly value: HeartRateValue }
  | { readonly type: "blood_pressure"; readonly value: BloodPressureValue }
  | { readonly type: "blood_glucose"; readonly value: BloodGlucoseValue }
  | { readonly type: "oxygen_saturation"; readonly value: OxygenSaturationValue }
  | { readonly type: "body_temperature"; readonly value: TemperatureValue };
export type VitalReadingType = VitalReadingValue["type"];

export interface VitalReading extends EntityMetadata {
  readonly id: VitalReadingId;
  readonly reading: VitalReadingValue;
  readonly observedAt: IsoDateTimeString;
}
