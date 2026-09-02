import type { DecimalString } from "../health.types.js";
import type { EnergyValue } from "../health-units.types.js";

export interface ActivityFactorValue {
  readonly value: DecimalString;
  readonly unit: "ratio";
}

/** Input energy is per day and the factor is a ratio. No formula is implemented in Phase 2. */
export interface TdeeInput {
  readonly basalEnergy: EnergyValue;
  readonly basalEnergyPeriod: "day";
  readonly activityFactor: ActivityFactorValue;
}

/** TDEE output is energy per day and is explicitly an estimate. */
export interface TdeeResult {
  readonly energy: EnergyValue;
  readonly period: "day";
  readonly isEstimate: true;
}

export declare function calculateTdee(input: TdeeInput): TdeeResult;
