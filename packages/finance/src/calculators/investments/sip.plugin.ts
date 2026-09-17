import { futureValueWithContributions } from "../foundation/foundation.calculate.js";
import { sipInputSchema, sipResultSchema } from "../../generated/finance.schemas.js";
import type { SipInput, SipResult } from "./sip.contracts.js";
import { asMoney, calculatorExampleContext, decimal, defineInvestmentPlugin, ensureNonNegative, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "./plugin.helpers.js";

export const sipManifest = investmentManifest({ id: "sip", title: "SIP", description: "Projects level periodic contributions with explicit timing.", formula: "annuity future value", isEstimate: true, ratePolicy: "required_user_input", governmentScheme: false });

export function calculateSip(input: SipInput): SipResult {
  const parsed = parseCalculatorInput(sipInputSchema, input);
  const contribution = decimal(parsed.periodicContribution.amount);
  ensureNonNegative(contribution, "Periodic contribution");
  return parseCalculatorResult(sipResultSchema, {
    investedAmount: asMoney(contribution.times(parsed.contributionCount), parsed.periodicContribution.currency),
    estimatedValue: futureValueWithContributions({ startingValue: asMoney(decimal(0), parsed.periodicContribution.currency), periodicAmount: parsed.periodicContribution, periodicRate: parsed.expectedReturn, periodCount: parsed.contributionCount, timing: parsed.contributionTiming }),
    metadata: resultMetadata(parsed, "sip", true),
  });
}

const exampleInput = { ...calculatorExampleContext, periodicContribution: { amount: "100", currency: "USD" }, expectedReturn: { value: "1", representation: "human_percentage", period: "month", compoundingFrequency: "monthly" }, contributionCount: 2, contributionTiming: "end_of_period" } as const;
export const sipPlugin = defineInvestmentPlugin({ manifest: sipManifest, inputSchema: sipInputSchema, outputSchema: sipResultSchema, calculate: calculateSip, examples: [{ name: "two monthly contributions", input: exampleInput, expected: calculateSip(exampleInput) }] });
