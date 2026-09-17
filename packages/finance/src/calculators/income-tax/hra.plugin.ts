import { hraInputSchema, hraResultSchema } from "../../generated/finance.schemas.js";
import type { HraInput, HraResult } from "./hra.contracts.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import { asMoney, calculatorExampleContext, decimal, ensureNonNegative, ensureSameCurrency, parseCalculatorInput, parseCalculatorResult, resultMetadata } from "../investments/plugin.helpers.js";
import { defineRegulatedPlugin, disclosureWarnings, regulatedManifest } from "../regulated-plugin.helpers.js";

export const hraManifest = regulatedManifest({ id: "hra", title: "HRA", category: "income_tax", description: "Estimates an HRA exemption using explicit salary and rent percentages.", formula: "minimum of HRA received, rent less salary offset, and salary percentage", isEstimate: true, disclaimers: ["Location category is descriptive; supplied rule percentages control the formula.", "Eligibility, evidence, payroll periods, and filing treatment require professional review."] });
export function calculateHra(input: HraInput): HraResult {
  const parsed = parseCalculatorInput(hraInputSchema, input);
  const currency = ensureSameCurrency(parsed.basicSalary, parsed.hraReceived, parsed.rentPaid);
  const salary = decimal(parsed.basicSalary.amount);
  const received = decimal(parsed.hraReceived.amount);
  const rent = decimal(parsed.rentPaid.amount);
  const salaryRate = decimal(parsed.salaryRate.value).dividedBy(100);
  const offsetRate = decimal(parsed.rentOffsetRate.value).dividedBy(100);
  for (const [value, label] of [[salary, "Basic salary"], [received, "HRA received"], [rent, "Rent paid"], [salaryRate, "Salary rate"], [offsetRate, "Rent offset rate"]] as const) ensureNonNegative(value, label);
  if (salaryRate.gt(1) || offsetRate.gt(1)) throw new FinanceCalculationError("invalid-calculation-input", "HRA rule percentages must not exceed 100 percent.");
  const rentLessSalaryOffset = rent.minus(salary.times(offsetRate));
  const rentLessOffset = rentLessSalaryOffset.isNegative() ? decimal(0) : rentLessSalaryOffset;
  const salaryLimit = salary.times(salaryRate);
  const exemption = [rentLessOffset, salaryLimit].reduce((lowest, candidate) => candidate.lt(lowest) ? candidate : lowest, received);
  return parseCalculatorResult(hraResultSchema, { estimatedExemption: asMoney(exemption, currency), metadata: resultMetadata(parsed, "hra", true, disclosureWarnings(...hraManifest.disclaimers, `Rule version ${parsed.ruleVersion} effective ${parsed.ruleEffectiveOn}.`, `Location category: ${parsed.locationCategory}.`)) });
}
const exampleInput = { ...calculatorExampleContext, basicSalary: { amount: "1000", currency: "INR" }, hraReceived: { amount: "500", currency: "INR" }, rentPaid: { amount: "400", currency: "INR" }, locationCategory: "example", salaryRate: { value: "50", representation: "human_percentage" }, rentOffsetRate: { value: "10", representation: "human_percentage" }, ruleVersion: "example-1", ruleEffectiveOn: "2026-01-01" } as const;
export const hraPlugin = defineRegulatedPlugin({ manifest: hraManifest, inputSchema: hraInputSchema, outputSchema: hraResultSchema, calculate: calculateHra, examples: [{ name: "explicit HRA assumptions", input: exampleInput, expected: calculateHra(exampleInput) }] });
