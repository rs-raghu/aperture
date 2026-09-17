import { netSalaryInputSchema, netSalaryResultSchema } from "../../generated/finance.schemas.js";
import type { NetSalaryInput, NetSalaryResult } from "./salary.contracts.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import { asMoney, calculatorExampleContext, decimal, ensureNonNegative, ensureSameCurrency, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRegulatedPlugin, disclosureWarnings, regulatedManifest } from "../regulated-plugin.helpers.js";

export const netSalaryManifest = regulatedManifest({ id: "net-salary", title: "Salary and Net Take-home", category: "income_tax", description: "Subtracts explicitly itemized recorded deductions from itemized earnings.", formula: "gross earnings − recorded deductions", isEstimate: true, disclaimers: ["The result uses only supplied components and does not infer tax, benefits, or payroll rules."] });
export function calculateNetSalary(input: NetSalaryInput): NetSalaryResult {
  const parsed = parseCalculatorInput(netSalaryInputSchema, input);
  if (parsed.earnings.length === 0) throw new FinanceCalculationError("invalid-calculation-input", "At least one earning component is required.");
  const currency = ensureSameCurrency(parsed.grossSalary, parsed.recordedDeductions, ...parsed.earnings.map(({ amount }) => amount), ...parsed.deductions.map(({ amount }) => amount));
  const gross = decimal(parsed.grossSalary.amount);
  const recordedDeductions = decimal(parsed.recordedDeductions.amount);
  ensureNonNegative(gross, "Gross salary");
  ensureNonNegative(recordedDeductions, "Recorded deductions");
  const componentGross = parsed.earnings.reduce((total, { amount }) => total.plus(decimal(amount.amount)), decimal(0));
  const componentDeductions = parsed.deductions.reduce((total, { amount }) => total.plus(decimal(amount.amount)), decimal(0));
  if (!componentGross.eq(gross) || !componentDeductions.eq(recordedDeductions)) throw new FinanceCalculationError("invalid-calculation-input", "Salary component totals must reconcile with the recorded gross and deduction totals.");
  if (recordedDeductions.gt(gross)) throw new FinanceCalculationError("invalid-calculation-input", "Recorded deductions must not exceed gross salary.");
  return parseCalculatorResult(netSalaryResultSchema, { estimatedNetSalary: asMoney(gross.minus(recordedDeductions), currency), metadata: resultMetadata(parsed, "net-salary", true, disclosureWarnings(...netSalaryManifest.disclaimers)) });
}
const exampleInput = { ...calculatorExampleContext, grossSalary: { amount: "1000", currency: "INR" }, recordedDeductions: { amount: "200", currency: "INR" }, earnings: [{ name: "base", amount: { amount: "1000", currency: "INR" } }], deductions: [{ name: "recorded", amount: { amount: "200", currency: "INR" } }] } as const;
export const netSalaryPlugin = defineRegulatedPlugin({ manifest: netSalaryManifest, inputSchema: netSalaryInputSchema, outputSchema: netSalaryResultSchema, calculate: calculateNetSalary, examples: [{ name: "itemized salary", input: exampleInput, expected: calculateNetSalary(exampleInput) }] });
