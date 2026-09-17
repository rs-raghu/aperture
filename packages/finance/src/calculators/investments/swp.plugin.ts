import { futureValueAfterWithdrawals } from "../foundation/foundation.calculate.js";
import { swpInputSchema, swpResultSchema } from "../../generated/finance.schemas.js";
import type { SwpInput, SwpResult } from "./swp.contracts.js";
import { asMoney, calculatorExampleContext, decimal, defineInvestmentPlugin, ensureNonNegative, ensureSameCurrency, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "./plugin.helpers.js";

export const swpManifest = investmentManifest({ id: "swp", title: "SWP", description: "Projects scheduled withdrawals with explicit timing.", formula: "future value less withdrawal annuity", isEstimate: true, ratePolicy: "required_user_input", governmentScheme: false });
export function calculateSwp(input: SwpInput): SwpResult {
  const parsed = parseCalculatorInput(swpInputSchema, input);
  const currency = ensureSameCurrency(parsed.initialInvestment, parsed.periodicWithdrawal);
  const withdrawal = decimal(parsed.periodicWithdrawal.amount);
  ensureNonNegative(withdrawal, "Periodic withdrawal");
  return parseCalculatorResult(swpResultSchema, {
    estimatedEndingValue: futureValueAfterWithdrawals({ startingValue: parsed.initialInvestment, periodicAmount: parsed.periodicWithdrawal, periodicRate: parsed.expectedReturn, periodCount: parsed.withdrawalCount, timing: parsed.withdrawalTiming }),
    totalWithdrawals: asMoney(withdrawal.times(parsed.withdrawalCount), currency),
    metadata: resultMetadata(parsed, "swp", true),
  });
}
const exampleInput = { ...calculatorExampleContext, initialInvestment: { amount: "1000", currency: "USD" }, periodicWithdrawal: { amount: "100", currency: "USD" }, expectedReturn: { value: "0", representation: "human_percentage", period: "month", compoundingFrequency: "monthly" }, withdrawalCount: 3, withdrawalTiming: "end_of_period" } as const;
export const swpPlugin = defineInvestmentPlugin({ manifest: swpManifest, inputSchema: swpInputSchema, outputSchema: swpResultSchema, calculate: calculateSwp, examples: [{ name: "three withdrawals", input: exampleInput, expected: calculateSwp(exampleInput) }] });
