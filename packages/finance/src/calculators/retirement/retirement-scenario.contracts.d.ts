import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";

export interface RetirementProjectionScenario {
  readonly name: string;
  readonly inflationRate: Percentage;
  readonly preRetirementReturn: InterestRate;
  readonly preRetirementRateKind: "nominal" | "effective";
  readonly postRetirementReturn: InterestRate;
  readonly postRetirementRateKind: "nominal" | "effective";
  readonly withdrawalRate: Percentage;
}

export interface RetirementScenarioResult {
  readonly name: string;
  readonly inflationAdjustedAnnualNeed: Money;
  readonly withdrawalRateTarget: Money;
  readonly longevityTarget: Money;
  readonly targetCorpus: Money;
  readonly projectedCorpus: Money;
  readonly fundingGap: Money;
}
