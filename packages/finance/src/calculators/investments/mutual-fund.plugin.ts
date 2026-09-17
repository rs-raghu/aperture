import { returnOnInvestment } from "../foundation/foundation.calculate.js";
import { mutualFundReturnsInputSchema, mutualFundReturnsResultSchema } from "../../generated/finance.schemas.js";
import type { MutualFundReturnsInput, MutualFundReturnsResult } from "./mutual-fund.contracts.js";
import { calculatorExampleContext, defineInvestmentPlugin, investmentManifest, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "./plugin.helpers.js";

export const mutualFundReturnsManifest = investmentManifest({ id: "mutual-fund-returns", title: "Mutual Fund Returns", description: "Compares recorded investment cost and current value.", formula: "return on investment", isEstimate: false, ratePolicy: "not_applicable", governmentScheme: false });
export function calculateMutualFundReturns(input: MutualFundReturnsInput): MutualFundReturnsResult {
  const parsed = parseCalculatorInput(mutualFundReturnsInputSchema, input);
  const result = returnOnInvestment({ initialValue: parsed.investedAmount, finalValue: parsed.currentValue });
  return parseCalculatorResult(mutualFundReturnsResultSchema, { absoluteReturn: result.returnAmount, returnPercentage: result.returnPercentage, metadata: resultMetadata(parsed, "mutual-fund-returns", false) });
}
const exampleInput = { ...calculatorExampleContext, investedAmount: { amount: "100", currency: "USD" }, currentValue: { amount: "125", currency: "USD" } } as const;
export const mutualFundReturnsPlugin = defineInvestmentPlugin({ manifest: mutualFundReturnsManifest, inputSchema: mutualFundReturnsInputSchema, outputSchema: mutualFundReturnsResultSchema, calculate: calculateMutualFundReturns, examples: [{ name: "recorded gain", input: exampleInput, expected: calculateMutualFundReturns(exampleInput) }] });
