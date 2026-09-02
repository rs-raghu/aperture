import type { DecimalString } from "./finance.types.js";

/** Human percentage string: `"8.5"` means 8.5%, never the fraction `"0.085"`. */
export type PercentageValue = DecimalString;

export interface Percentage {
  readonly value: PercentageValue;
  readonly representation: "human_percentage";
}
