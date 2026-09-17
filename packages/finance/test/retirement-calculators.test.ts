import { describe, expect, it } from "vitest";
import {
  FinanceCalculationError,
  allFinanceCalculatorPlugins,
  calculateApy,
  calculateEpf,
  calculateFire,
  calculateGratuity,
  calculateNps,
  calculateRetirementCorpus,
  getFinanceCalculatorPlugin,
  getRetirementCalculatorPlugin,
  retirementCalculatorPlugins,
} from "@aperture/finance";

const context = { version: "1.0.0", assumptions: [], sourceReferences: [] } as const;
const zeroAnnual = { value: "0", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" } as const;
const zeroMonthly = { value: "0", representation: "human_percentage", period: "month", compoundingFrequency: "monthly" } as const;
const zeroPercent = { value: "0", representation: "human_percentage" } as const;
const fiftyPercent = { value: "50", representation: "human_percentage" } as const;

const baselineScenario = {
  name: "baseline",
  inflationRate: zeroPercent,
  preRetirementReturn: zeroAnnual,
  preRetirementRateKind: "effective" as const,
  postRetirementReturn: zeroAnnual,
  postRetirementRateKind: "effective" as const,
  withdrawalRate: fiftyPercent,
};

const projectionInput = {
  ...context,
  currentAge: 30,
  retirementAge: 32,
  longevityAge: 34,
  annualContribution: { amount: "50", currency: "USD" },
  contributionTiming: "end_of_period" as const,
  scenarios: [baselineScenario],
};

describe("Phase 22 retirement plug-in registry", () => {
  it("discovers six retirement calculators in the generated global registry", () => {
    expect(allFinanceCalculatorPlugins).toHaveLength(36);
    expect(retirementCalculatorPlugins).toHaveLength(6);
    expect(new Set(retirementCalculatorPlugins.map(({ manifest }) => manifest.id))).toHaveLength(6);
    for (const plugin of retirementCalculatorPlugins) {
      expect(getFinanceCalculatorPlugin(plugin.manifest.id)).toBe(plugin);
      expect(getRetirementCalculatorPlugin(plugin.manifest.id)).toBe(plugin);
    }
  });

  it("executes owned examples through owned schemas with disclosures and no presets", () => {
    for (const plugin of retirementCalculatorPlugins) {
      expect("disclaimers" in plugin.manifest ? plugin.manifest.disclaimers.length : 0, plugin.manifest.id).toBeGreaterThan(0);
      expect(plugin.manifest.presets).toEqual([]);
      expect(plugin.examples.length).toBeGreaterThan(0);
      for (const example of plugin.examples) {
        expect(plugin.inputSchema.safeParse(example.input).success).toBe(true);
        expect(plugin.outputSchema.safeParse(example.expected).success).toBe(true);
        expect(Reflect.apply(plugin.calculate, undefined, [example.input])).toEqual(example.expected);
      }
    }
  });

  it("normalizes invalid runtime inputs", () => {
    for (const plugin of retirementCalculatorPlugins) {
      expect(() => Reflect.apply(plugin.calculate, undefined, [{}]), plugin.manifest.id).toThrowError(FinanceCalculationError);
    }
  });
});

describe("FIRE and retirement-income scenarios", () => {
  it("reconciles a zero-return FIRE target and contribution projection", () => {
    const result = calculateFire({ ...projectionInput, annualExpenses: { amount: "100", currency: "USD" }, existingCorpus: { amount: "100", currency: "USD" } });
    expect(result).toMatchObject({
      targetCorpus: { amount: "200" },
      inflationAdjustedAnnualExpenses: { amount: "100" },
      projectedCorpus: { amount: "200" },
      fundingGap: { amount: "0" },
    });
    expect(result.scenarios[0]).toMatchObject({ withdrawalRateTarget: { amount: "200" }, longevityTarget: { amount: "200" } });
  });

  it("exposes scenario uncertainty instead of choosing hidden defaults", () => {
    const result = calculateFire({
      ...projectionInput,
      annualExpenses: { amount: "100", currency: "USD" },
      existingCorpus: { amount: "100", currency: "USD" },
      scenarios: [baselineScenario, { ...baselineScenario, name: "higher inflation", inflationRate: { value: "10", representation: "human_percentage" } }],
    });
    expect(result.scenarios).toHaveLength(2);
    expect(result.scenarios[1]).toMatchObject({ inflationAdjustedAnnualNeed: { amount: "121" }, longevityTarget: { amount: "254.1" }, fundingGap: { amount: "54.1" } });
    expect(result.metadata.warnings.map(({ message }) => message).join(" ")).toContain("not promises");
  });

  it("uses retirement age, longevity, rate conventions, and contribution timing explicitly", () => {
    const result = calculateRetirementCorpus({
      ...projectionInput,
      currentSavings: { amount: "100", currency: "USD" },
      desiredAnnualIncome: { amount: "100", currency: "USD" },
    });
    expect(result).toMatchObject({ estimatedCorpus: { amount: "200" }, projectedSavings: { amount: "200" }, fundingGap: { amount: "0" } });
    expect(() => calculateRetirementCorpus({ ...projectionInput, currentSavings: { amount: "100", currency: "USD" }, desiredAnnualIncome: { amount: "100", currency: "USD" }, retirementAge: 30 })).toThrowError(expect.objectContaining({ code: "invalid-calculation-input" }));
    expect(() => calculateRetirementCorpus({ ...projectionInput, currentSavings: { amount: "100", currency: "USD" }, desiredAnnualIncome: { amount: "100", currency: "USD" }, longevityAge: 32 })).toThrowError(expect.objectContaining({ code: "invalid-calculation-input" }));
  });

  it("rejects missing or duplicate scenarios and currency mismatches", () => {
    const base = { ...projectionInput, annualExpenses: { amount: "100", currency: "USD" }, existingCorpus: { amount: "100", currency: "USD" } };
    expect(() => calculateFire({ ...base, scenarios: [] })).toThrowError(expect.objectContaining({ code: "invalid-calculation-input" }));
    expect(() => calculateFire({ ...base, scenarios: [baselineScenario, baselineScenario] })).toThrowError(expect.objectContaining({ code: "invalid-calculation-input" }));
    expect(() => calculateFire({ ...base, annualContribution: { amount: "50", currency: "INR" } })).toThrowError(expect.objectContaining({ code: "currency-mismatch" }));
  });
});

describe("effective-dated retirement schemes", () => {
  it("separates NPS employee, employer, annuity, lump-sum, and pension values", () => {
    const result = calculateNps({ ...context, currentBalance: { amount: "100", currency: "INR" }, contribution: { amount: "10", currency: "INR" }, employerContribution: { amount: "5", currency: "INR" }, expectedReturn: zeroMonthly, contributionCount: 2, contributionTiming: "end_of_period", annuityAllocation: { value: "40", representation: "human_percentage" }, assumedAnnuityRate: { value: "5", representation: "human_percentage" }, ruleVersion: "caller-1", ruleEffectiveOn: "2026-01-01" });
    expect(result).toMatchObject({ estimatedCorpus: { amount: "130" }, totalEmployeeContributions: { amount: "20" }, totalEmployerContributions: { amount: "10" }, estimatedAnnuityPurchase: { amount: "52" }, estimatedLumpSum: { amount: "78" }, estimatedAnnualPension: { amount: "2.6" } });
    expect(result.metadata.warnings.map(({ code }) => code)).toContain("user_supplied_rule_unverified");
    expect(result.metadata.warnings.map(({ message }) => message).join(" ")).toContain("caller-1");
  });

  it("projects EPF and APY contribution schedules without statutory presets", () => {
    const epf = calculateEpf({ ...context, currentBalance: { amount: "100", currency: "INR" }, periodicContribution: { amount: "10", currency: "INR" }, employerContribution: { amount: "5", currency: "INR" }, expectedRate: zeroMonthly, contributionCount: 2, contributionTiming: "end_of_period", ruleVersion: "caller-1", ruleEffectiveOn: "2026-01-01" });
    expect(epf).toMatchObject({ estimatedBalance: { amount: "130" }, totalEmployeeContributions: { amount: "20" }, totalEmployerContributions: { amount: "10" } });
    const apy = calculateApy({ ...context, currentBalance: { amount: "100", currency: "INR" }, periodicContribution: { amount: "10", currency: "INR" }, contributionCount: 2, assumedRate: zeroMonthly, contributionTiming: "end_of_period", ruleVersion: "caller-1", ruleEffectiveOn: "2026-01-01" });
    expect(apy).toMatchObject({ estimatedPensionValue: { amount: "120" }, totalContributions: { amount: "20" } });
  });

  it("uses a configurable effective-dated gratuity factor", () => {
    const result = calculateGratuity({ ...context, eligibleSalary: { amount: "1000", currency: "INR" }, yearsOfService: 2, benefitFactor: { value: "5", representation: "human_percentage" }, ruleVersion: "caller-1", ruleEffectiveOn: "2026-01-01" });
    expect(result.estimatedBenefit.amount).toBe("100");
    expect(result.metadata.warnings.map(({ message }) => message).join(" ")).toContain("effective 2026-01-01");
  });

  it("rejects impossible percentages and mixed currencies", () => {
    expect(() => calculateNps({ ...context, currentBalance: { amount: "100", currency: "INR" }, contribution: { amount: "10", currency: "INR" }, employerContribution: { amount: "5", currency: "USD" }, expectedReturn: zeroMonthly, contributionCount: 2, contributionTiming: "end_of_period", annuityAllocation: { value: "40", representation: "human_percentage" }, assumedAnnuityRate: { value: "5", representation: "human_percentage" }, ruleVersion: "caller-1", ruleEffectiveOn: "2026-01-01" })).toThrowError(expect.objectContaining({ code: "currency-mismatch" }));
    expect(() => calculateGratuity({ ...context, eligibleSalary: { amount: "1000", currency: "INR" }, yearsOfService: 2, benefitFactor: { value: "101", representation: "human_percentage" }, ruleVersion: "caller-1", ruleEffectiveOn: "2026-01-01" })).toThrowError(expect.objectContaining({ code: "invalid-calculation-input" }));
  });
});
