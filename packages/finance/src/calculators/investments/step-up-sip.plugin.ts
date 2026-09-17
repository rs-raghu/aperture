import { stepUpSipInputSchema, stepUpSipResultSchema } from "../../generated/finance.schemas.js";
import type { StepUpSipInput, StepUpSipResult } from "./step-up-sip.contracts.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import { asMoney, calculatorExampleContext, decimal, defineInvestmentPlugin, ensureNonNegative, investmentManifest, parseCalculatorInput, parseCalculatorResult, rateFraction, resultMetadata } from "./plugin.helpers.js";

export const stepUpSipManifest = investmentManifest({ id: "step-up-sip", title: "Step Up SIP", description: "Projects contributions that grow by an explicit step-up rate.", formula: "periodic stepped cash-flow accumulation", isEstimate: true, ratePolicy: "required_user_input", governmentScheme: false });

export function calculateStepUpSip(input: StepUpSipInput): StepUpSipResult {
  const parsed = parseCalculatorInput(stepUpSipInputSchema, input);
  let contribution = decimal(parsed.initialContribution.amount);
  ensureNonNegative(contribution, "Initial contribution");
  const step = decimal(parsed.stepUpRate.value).dividedBy(100);
  if (step.lte(-1)) throw new FinanceCalculationError("invalid-calculation-input", "Step-up rate must be greater than -100 percent.");
  const growth = decimal(1).plus(rateFraction(parsed.expectedReturn));
  let invested = decimal(0);
  let value = decimal(0);
  for (let period = 0; period < parsed.contributionCount; period += 1) {
    invested = invested.plus(contribution);
    value = parsed.contributionTiming === "beginning_of_period" ? value.plus(contribution).times(growth) : value.times(growth).plus(contribution);
    contribution = contribution.times(decimal(1).plus(step));
  }
  return parseCalculatorResult(stepUpSipResultSchema, {
    investedAmount: asMoney(invested, parsed.initialContribution.currency),
    estimatedValue: asMoney(value, parsed.initialContribution.currency),
    metadata: resultMetadata(parsed, "step-up-sip", true),
  });
}

const exampleInput = { ...calculatorExampleContext, initialContribution: { amount: "100", currency: "USD" }, stepUpRate: { value: "10", representation: "human_percentage" }, expectedReturn: { value: "0", representation: "human_percentage", period: "month", compoundingFrequency: "monthly" }, contributionCount: 2, contributionTiming: "end_of_period" } as const;
export const stepUpSipPlugin = defineInvestmentPlugin({ manifest: stepUpSipManifest, inputSchema: stepUpSipInputSchema, outputSchema: stepUpSipResultSchema, calculate: calculateStepUpSip, examples: [{ name: "two stepped contributions", input: exampleInput, expected: calculateStepUpSip(exampleInput) }] });
