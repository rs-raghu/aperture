import { postOfficeMisInputSchema, postOfficeMisResultSchema } from "../../generated/finance.schemas.js";
import type { PostOfficeMisInput, PostOfficeMisResult } from "./post-office-mis.contracts.js";
import { asMoney, calculatorExampleContext, decimal, defineInvestmentPlugin, ensurePositive, governmentRateWarnings, investmentManifest, parseCalculatorInput, parseCalculatorResult, rateFraction, resultMetadata } from "./plugin.helpers.js";

export const postOfficeMisManifest = investmentManifest({ id: "post-office-mis", title: "Post Office MIS", description: "Estimates periodic income from user-supplied scheme assumptions.", formula: "deposit × rate ÷ payment count", isEstimate: true, ratePolicy: "required_user_input", governmentScheme: true });
export function calculatePostOfficeMis(input: PostOfficeMisInput): PostOfficeMisResult {
  const parsed = parseCalculatorInput(postOfficeMisInputSchema, input);
  const deposit = decimal(parsed.deposit.amount);
  ensurePositive(deposit, "Deposit");
  const income = deposit.times(rateFraction(parsed.assumedRate)).dividedBy(parsed.paymentCount);
  return parseCalculatorResult(postOfficeMisResultSchema, { estimatedPeriodicIncome: asMoney(income, parsed.deposit.currency), metadata: resultMetadata(parsed, "post-office-mis", true, governmentRateWarnings(parsed)) });
}
const exampleInput = { ...calculatorExampleContext, deposit: { amount: "1200", currency: "INR" }, assumedRate: { value: "12", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, paymentCount: 12 } as const;
export const postOfficeMisPlugin = defineInvestmentPlugin({ manifest: postOfficeMisManifest, inputSchema: postOfficeMisInputSchema, outputSchema: postOfficeMisResultSchema, calculate: calculatePostOfficeMis, examples: [{ name: "twelve income payments", input: exampleInput, expected: calculatePostOfficeMis(exampleInput) }] });
