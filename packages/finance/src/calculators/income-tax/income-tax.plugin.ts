import { incomeTaxInputSchema, incomeTaxResultSchema } from "../../generated/finance.schemas.js";
import type { IncomeTaxInput, IncomeTaxResult } from "./income-tax.contracts.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import { asMoney, calculatorExampleContext, decimal, ensureNonNegative, ensureSameCurrency, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRegulatedPlugin, disclosureWarnings, regulatedManifest } from "../regulated-plugin.helpers.js";

export const incomeTaxManifest = regulatedManifest({ id: "income-tax", title: "Income Tax", category: "income_tax", description: "Applies a complete caller-supplied, effective-dated tax rule set.", formula: "progressive slabs less rebate plus surcharge and cess", isEstimate: true, disclaimers: ["This is an estimate from supplied rules and is not personalized tax advice.", "The calculator does not claim that supplied slabs, deductions, rebates, cess, or surcharge are current law."] });

export function calculateIncomeTax(input: IncomeTaxInput): IncomeTaxResult {
  const parsed = parseCalculatorInput(incomeTaxInputSchema, input);
  if (parsed.slabs.length === 0) throw new FinanceCalculationError("invalid-calculation-input", "At least one tax slab is required.");
  const slabMoney = parsed.slabs.flatMap(({ startsAt, endsAt }) => endsAt === undefined ? [startsAt] : [startsAt, endsAt]);
  const currency = ensureSameCurrency(parsed.taxableIncome, parsed.deductions, parsed.rebateThreshold, parsed.rebateAmount, ...slabMoney);
  const taxableIncome = decimal(parsed.taxableIncome.amount);
  const deductions = decimal(parsed.deductions.amount);
  ensureNonNegative(taxableIncome, "Taxable income");
  ensureNonNegative(deductions, "Deductions");
  if (deductions.gt(taxableIncome)) throw new FinanceCalculationError("invalid-calculation-input", "Deductions must not exceed taxable income.");
  const assessableIncome = taxableIncome.minus(deductions);
  const slabs = [...parsed.slabs].sort((left, right) => decimal(left.startsAt.amount).cmp(decimal(right.startsAt.amount)));
  if (!decimal(slabs[0]?.startsAt.amount ?? "-1").isZero()) throw new FinanceCalculationError("invalid-calculation-input", "Tax slabs must begin at zero.");
  let expectedStart = decimal(0);
  let tax = decimal(0);
  for (const [index, slab] of slabs.entries()) {
    const start = decimal(slab.startsAt.amount);
    const end = slab.endsAt === undefined ? undefined : decimal(slab.endsAt.amount);
    const rate = decimal(slab.rate.value).dividedBy(100);
    if (!start.eq(expectedStart)) throw new FinanceCalculationError("invalid-calculation-input", "Tax slabs must be contiguous and non-overlapping.");
    if (end !== undefined && !end.gt(start)) throw new FinanceCalculationError("invalid-calculation-input", "Each bounded tax slab must end above its start.");
    if (end === undefined && index !== slabs.length - 1) throw new FinanceCalculationError("invalid-calculation-input", "Only the final tax slab may be open-ended.");
    ensureNonNegative(rate, "Tax slab rate");
    if (rate.gt(1)) throw new FinanceCalculationError("invalid-calculation-input", "Tax slab rates must not exceed 100 percent.");
    if (assessableIncome.gt(start)) {
      const upper = end === undefined || assessableIncome.lt(end) ? assessableIncome : end;
      tax = tax.plus(upper.minus(start).times(rate));
    }
    if (end === undefined) {
      expectedStart = assessableIncome;
    } else {
      expectedStart = end;
    }
  }
  if (slabs.at(-1)?.endsAt !== undefined && assessableIncome.gt(expectedStart)) throw new FinanceCalculationError("invalid-calculation-input", "Tax slabs do not cover the assessable income.");

  const rebateThreshold = decimal(parsed.rebateThreshold.amount);
  const rebateAmount = decimal(parsed.rebateAmount.amount);
  const cessRate = decimal(parsed.cessRate.value).dividedBy(100);
  const surchargeRate = decimal(parsed.surchargeRate.value).dividedBy(100);
  for (const [value, label] of [[rebateThreshold, "Rebate threshold"], [rebateAmount, "Rebate amount"], [cessRate, "Cess rate"], [surchargeRate, "Surcharge rate"]] as const) ensureNonNegative(value, label);
  if (cessRate.gt(1) || surchargeRate.gt(1)) throw new FinanceCalculationError("invalid-calculation-input", "Cess and surcharge rates must not exceed 100 percent.");
  if (assessableIncome.lte(rebateThreshold)) tax = rebateAmount.gte(tax) ? decimal(0) : tax.minus(rebateAmount);
  const surcharge = tax.times(surchargeRate);
  const cess = tax.plus(surcharge).times(cessRate);
  const estimatedTax = tax.plus(surcharge).plus(cess);
  return parseCalculatorResult(incomeTaxResultSchema, {
    estimatedTax: asMoney(estimatedTax, currency),
    metadata: resultMetadata(parsed, "income-tax", true, disclosureWarnings(...incomeTaxManifest.disclaimers, `Rule ${parsed.taxRuleVersion} for ${parsed.financialYear}, effective ${parsed.ruleEffectiveOn}.`, `Jurisdiction: ${parsed.jurisdiction}.`, `Assessable income after supplied deductions: ${assessableIncome.toFixed()} ${currency}.`, `Tax after rebate: ${tax.toFixed()}; surcharge: ${surcharge.toFixed()}; cess: ${cess.toFixed()} ${currency}.`)),
  });
}

const exampleInput = {
  ...calculatorExampleContext,
  taxableIncome: { amount: "1000", currency: "INR" }, deductions: { amount: "0", currency: "INR" },
  financialYear: "2026-27", jurisdiction: "example", taxRuleVersion: "example-1", ruleEffectiveOn: "2026-04-01",
  slabs: [{ startsAt: { amount: "0", currency: "INR" }, rate: { value: "10", representation: "human_percentage" } }],
  rebateThreshold: { amount: "0", currency: "INR" }, rebateAmount: { amount: "0", currency: "INR" },
  cessRate: { value: "0", representation: "human_percentage" }, surchargeRate: { value: "0", representation: "human_percentage" },
} as const;
export const incomeTaxPlugin = defineRegulatedPlugin({ manifest: incomeTaxManifest, inputSchema: incomeTaxInputSchema, outputSchema: incomeTaxResultSchema, calculate: calculateIncomeTax, examples: [{ name: "caller-supplied example rules", input: exampleInput, expected: calculateIncomeTax(exampleInput) }] });
