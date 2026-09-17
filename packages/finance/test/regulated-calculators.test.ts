import { describe, expect, it } from "vitest";
import {
  FinanceCalculationError,
  allFinanceCalculatorPlugins,
  amortizationSchedule,
  calculateCarLoanEmi,
  calculateCompoundInterest,
  calculateEmi,
  calculateGst,
  calculateHomeLoanEmi,
  calculateHra,
  calculateIncomeTax,
  calculateInflationAdjustedValue,
  calculateNetSalary,
  calculateSimpleInterest,
  calculateTds,
  compareFlatAndReducingRate,
  convertInterestRate,
  economicCalculatorPlugins,
  getFinanceCalculatorPlugin,
  incomeTaxCalculatorPlugins,
  loanCalculatorPlugins,
  roundMoney,
} from "@aperture/finance";

const context = { version: "1.0.0", assumptions: [], sourceReferences: [] } as const;
const zeroAnnual = { value: "0", representation: "human_percentage", period: "year", compoundingFrequency: "monthly" } as const;

describe("Phase 21 plug-in registry", () => {
  it("discovers 30 calculators including all 12 regulated modules", () => {
    expect(allFinanceCalculatorPlugins).toHaveLength(30);
    expect(loanCalculatorPlugins).toHaveLength(6);
    expect(incomeTaxCalculatorPlugins).toHaveLength(5);
    expect(economicCalculatorPlugins).toHaveLength(1);
    expect(new Set(allFinanceCalculatorPlugins.map(({ manifest }) => manifest.id))).toHaveLength(30);
    for (const plugin of allFinanceCalculatorPlugins) expect(getFinanceCalculatorPlugin(plugin.manifest.id)).toBe(plugin);
  });

  it("executes every regulated example through owned schemas", () => {
    for (const plugin of [...loanCalculatorPlugins, ...incomeTaxCalculatorPlugins, ...economicCalculatorPlugins]) {
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
    for (const plugin of [...loanCalculatorPlugins, ...incomeTaxCalculatorPlugins, ...economicCalculatorPlugins]) {
      expect(() => Reflect.apply(plugin.calculate, undefined, [{}]), plugin.manifest.id).toThrowError(FinanceCalculationError);
    }
  });
});

describe("loan and interest reference calculations", () => {
  it("reconciles generic, home, and car EMI totals", () => {
    const input = { ...context, principal: { amount: "1200", currency: "USD" }, annualInterestRate: zeroAnnual, annualRateKind: "nominal" as const, paymentCount: 12 };
    expect(calculateEmi(input)).toMatchObject({ estimatedPeriodicPayment: { amount: "100" }, estimatedTotalPayment: { amount: "1200" }, estimatedInterest: { amount: "0" } });
    expect(calculateHomeLoanEmi(input)).toMatchObject({ estimatedPeriodicPayment: { amount: "100" }, estimatedTotalPayment: { amount: "1200" } });
    expect(calculateCarLoanEmi(input)).toMatchObject({ estimatedPeriodicPayment: { amount: "100" }, estimatedTotalPayment: { amount: "1200" } });
  });

  it("uses explicit nominal annual conversion and closes the last payment", () => {
    const annualRate = { value: "12", representation: "human_percentage", period: "year", compoundingFrequency: "monthly" } as const;
    const result = calculateEmi({ ...context, principal: { amount: "1000", currency: "USD" }, annualInterestRate: annualRate, annualRateKind: "nominal", paymentCount: 12 });
    expect(roundMoney({ money: result.estimatedPeriodicPayment, rounding: { decimalPlaces: 2, mode: "half_even" } }).amount).toBe("88.85");
    const monthlyRate = convertInterestRate({ rate: annualRate, sourceKind: "nominal", targetKind: "effective", targetPeriod: "month", targetCompoundingFrequency: "monthly" });
    const schedule = amortizationSchedule({ principal: { amount: "1000", currency: "USD" }, periodicRate: monthlyRate, paymentCount: 12, timing: "end_of_period" });
    expect(schedule.entries.at(-1)?.closingBalance.amount).toBe("0");
    expect(schedule.totalPayment.amount).toBe(result.estimatedTotalPayment.amount);
  });

  it("calculates simple and compound interest with matching frequency", () => {
    expect(calculateSimpleInterest({ ...context, principal: { amount: "1000", currency: "USD" }, interestRate: { value: "5", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, periodCount: 2 })).toMatchObject({ estimatedInterest: { amount: "100" }, estimatedTotal: { amount: "1100" } });
    const compound = calculateCompoundInterest({ ...context, principal: { amount: "1000", currency: "USD" }, interestRate: { value: "12", representation: "human_percentage", period: "year", compoundingFrequency: "monthly" }, periodCount: 1, compoundingCount: 12 });
    expect(roundMoney({ money: compound.estimatedTotal, rounding: { decimalPlaces: 2, mode: "half_even" } }).amount).toBe("1126.83");
    expect(() => calculateCompoundInterest({ ...context, principal: { amount: "1000", currency: "USD" }, interestRate: { value: "12", representation: "human_percentage", period: "year", compoundingFrequency: "monthly" }, periodCount: 1, compoundingCount: 4 })).toThrowError(expect.objectContaining({ code: "invalid-calculation-input" }));
  });

  it("discloses and compares flat and reducing assumptions", () => {
    const result = compareFlatAndReducingRate({ ...context, principal: { amount: "1200", currency: "USD" }, flatRate: { value: "12", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" }, flatRateKind: "nominal", reducingRate: { value: "12", representation: "human_percentage", period: "year", compoundingFrequency: "monthly" }, reducingRateKind: "nominal", paymentCount: 12 });
    expect(result.estimatedFlatTotal.amount).toBe("1344");
    expect(result.metadata.warnings.map(({ message }) => message).join(" ")).toContain("monthly");
    expect(result.metadata.warnings.map(({ message }) => message).join(" ")).toContain("Flat rate convention");
  });
});

describe("salary and configurable tax calculations", () => {
  it("requires salary components to reconcile", () => {
    const result = calculateNetSalary({ ...context, grossSalary: { amount: "1000", currency: "INR" }, recordedDeductions: { amount: "200", currency: "INR" }, earnings: [{ name: "base", amount: { amount: "1000", currency: "INR" } }], deductions: [{ name: "recorded", amount: { amount: "200", currency: "INR" } }] });
    expect(result.estimatedNetSalary.amount).toBe("800");
    expect(() => calculateNetSalary({ ...context, grossSalary: { amount: "1000", currency: "INR" }, recordedDeductions: { amount: "200", currency: "INR" }, earnings: [{ name: "base", amount: { amount: "999", currency: "INR" } }], deductions: [{ name: "recorded", amount: { amount: "200", currency: "INR" } }] })).toThrowError(expect.objectContaining({ code: "invalid-calculation-input" }));
  });

  it("applies supplied slabs, deductions, rebate, surcharge, and cess", () => {
    const result = calculateIncomeTax({
      ...context, taxableIncome: { amount: "1000", currency: "INR" }, deductions: { amount: "100", currency: "INR" },
      financialYear: "2026-27", jurisdiction: "example", taxRuleVersion: "rules-1", ruleEffectiveOn: "2026-04-01",
      slabs: [
        { startsAt: { amount: "0", currency: "INR" }, endsAt: { amount: "500", currency: "INR" }, rate: { value: "0", representation: "human_percentage" } },
        { startsAt: { amount: "500", currency: "INR" }, rate: { value: "10", representation: "human_percentage" } },
      ],
      rebateThreshold: { amount: "0", currency: "INR" }, rebateAmount: { amount: "0", currency: "INR" },
      cessRate: { value: "10", representation: "human_percentage" }, surchargeRate: { value: "20", representation: "human_percentage" },
    });
    expect(result.estimatedTax.amount).toBe("52.8");
    expect(result.metadata.warnings.map(({ message }) => message).join(" ")).toContain("rules-1");
  });

  it("rejects incomplete tax slabs and mismatched financial rules", () => {
    expect(() => calculateIncomeTax({
      ...context, taxableIncome: { amount: "1000", currency: "INR" }, deductions: { amount: "0", currency: "INR" },
      financialYear: "2026-27", jurisdiction: "example", taxRuleVersion: "rules-1", ruleEffectiveOn: "2026-04-01",
      slabs: [{ startsAt: { amount: "100", currency: "INR" }, rate: { value: "10", representation: "human_percentage" } }],
      rebateThreshold: { amount: "0", currency: "INR" }, rebateAmount: { amount: "0", currency: "INR" }, cessRate: { value: "0", representation: "human_percentage" }, surchargeRate: { value: "0", representation: "human_percentage" },
    })).toThrowError(expect.objectContaining({ code: "invalid-calculation-input" }));
  });

  it("labels TDS as withholding rather than final liability", () => {
    const result = calculateTds({ ...context, paymentAmount: { amount: "1000", currency: "INR" }, withholdingRate: { value: "10", representation: "human_percentage" } });
    expect(result).toMatchObject({ estimatedWithholding: { amount: "100" }, estimatedNetPayment: { amount: "900" } });
    expect(result.metadata.warnings.map(({ message }) => message).join(" ")).toContain("not a calculation of final tax liability");
  });

  it("uses transparent HRA percentages", () => {
    const result = calculateHra({ ...context, basicSalary: { amount: "1000", currency: "INR" }, hraReceived: { amount: "500", currency: "INR" }, rentPaid: { amount: "400", currency: "INR" }, locationCategory: "example", salaryRate: { value: "50", representation: "human_percentage" }, rentOffsetRate: { value: "10", representation: "human_percentage" }, ruleVersion: "example-1", ruleEffectiveOn: "2026-01-01" });
    expect(result.estimatedExemption.amount).toBe("300");
  });

  it("supports exclusive and inclusive GST", () => {
    const exclusive = calculateGst({ ...context, amount: { amount: "100", currency: "INR" }, taxRate: { value: "18", representation: "human_percentage" }, pricingMode: "exclusive" });
    expect(exclusive).toMatchObject({ estimatedTax: { amount: "18" }, estimatedNetAmount: { amount: "100" }, estimatedGrossAmount: { amount: "118" } });
    const inclusive = calculateGst({ ...context, amount: { amount: "118", currency: "INR" }, taxRate: { value: "18", representation: "human_percentage" }, pricingMode: "inclusive" });
    expect(inclusive).toMatchObject({ estimatedTax: { amount: "18" }, estimatedNetAmount: { amount: "100" }, estimatedGrossAmount: { amount: "118" } });
  });

  it("projects inflation without claiming a forecast", () => {
    expect(calculateInflationAdjustedValue({ ...context, presentValue: { amount: "100", currency: "USD" }, inflationRate: { value: "10", representation: "human_percentage" }, periodCount: 2 }).estimatedAdjustedValue.amount).toBe("121");
  });
});
