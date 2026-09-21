import { describe, expect, it } from "vitest";
import {
  FinanceCalculationError,
  calculateBrokerage,
  calculateCagr,
  calculateFd,
  calculateLumpsum,
  calculateMargin,
  calculateMutualFundReturns,
  calculateNsc,
  calculatePostOfficeMis,
  calculatePpf,
  calculateRd,
  calculateRoi,
  calculateScss,
  calculateSip,
  calculateSsy,
  calculateStepUpSip,
  calculateStockAverage,
  calculateSwp,
  calculateXirr,
  getInvestmentCalculatorPlugin,
  investmentCalculatorPlugins,
  roundDecimal,
} from "@aperture/finance";

const context = { version: "1.0.0", assumptions: [], sourceReferences: [] } as const;
const zeroMonthly = { value: "0", representation: "human_percentage", period: "month", compoundingFrequency: "monthly" } as const;
const tenAnnual = { value: "10", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" } as const;

describe("investment calculator plug-in discovery", () => {
  it("discovers all 18 independent modules with unique stable identifiers", () => {
    const expectedIds = [
      "brokerage", "cagr", "fd", "lumpsum", "margin", "mutual-fund-returns", "nsc", "post-office-mis", "ppf",
      "rd", "roi", "scss", "sip", "ssy", "step-up-sip", "stock-average", "swp", "xirr",
    ];
    expect(investmentCalculatorPlugins.map(({ manifest }) => manifest.id).sort()).toEqual(expectedIds);
    expect(new Set(expectedIds)).toHaveLength(18);
    for (const plugin of investmentCalculatorPlugins) expect(getInvestmentCalculatorPlugin(plugin.manifest.id)).toBe(plugin);
    expect(getInvestmentCalculatorPlugin("unknown")).toBeUndefined();
  });

  it("executes every owned example through its input and output schemas", () => {
    for (const plugin of investmentCalculatorPlugins) {
      expect(plugin.examples.length, `${plugin.manifest.id} has no example`).toBeGreaterThan(0);
      for (const example of plugin.examples) {
        expect(plugin.inputSchema.safeParse(example.input).success, `${plugin.manifest.id} input`).toBe(true);
        expect(plugin.outputSchema.safeParse(example.expected).success, `${plugin.manifest.id} output`).toBe(true);
        expect(Reflect.apply(plugin.calculate, undefined, [example.input])).toEqual(example.expected);
      }
    }
  });

  it("normalizes invalid input for every calculator", () => {
    for (const plugin of investmentCalculatorPlugins) {
      expect(() => Reflect.apply(plugin.calculate, undefined, [{}]), plugin.manifest.id).toThrowError(FinanceCalculationError);
    }
  });
});

describe("investment calculator reference results", () => {
  it("calculates SIP, step-up SIP, lumpsum, and SWP", () => {
    expect(calculateSip({ ...context, periodicContribution: { amount: "100", currency: "USD" }, expectedReturn: { ...zeroMonthly, value: "1" }, contributionCount: 2, contributionTiming: "end_of_period" })).toMatchObject({ investedAmount: { amount: "200", currency: "USD" }, estimatedValue: { amount: "201", currency: "USD" } });
    expect(calculateStepUpSip({ ...context, initialContribution: { amount: "100", currency: "USD" }, stepUpRate: { value: "10", representation: "human_percentage" }, expectedReturn: zeroMonthly, contributionCount: 2, contributionTiming: "end_of_period" })).toMatchObject({ investedAmount: { amount: "210", currency: "USD" }, estimatedValue: { amount: "210", currency: "USD" } });
    expect(calculateLumpsum({ ...context, principal: { amount: "100", currency: "USD" }, expectedReturn: tenAnnual, periodCount: 2 }).estimatedValue.amount).toBe("121");
    expect(calculateSwp({ ...context, initialInvestment: { amount: "1000", currency: "USD" }, periodicWithdrawal: { amount: "100", currency: "USD" }, expectedReturn: zeroMonthly, withdrawalCount: 3, withdrawalTiming: "end_of_period" })).toMatchObject({ estimatedEndingValue: { amount: "700" }, totalWithdrawals: { amount: "300" } });
  });

  it("separates mutual-fund gains, stock cost, brokerage, and margin", () => {
    expect(calculateMutualFundReturns({ ...context, investedAmount: { amount: "100", currency: "USD" }, currentValue: { amount: "125", currency: "USD" } })).toMatchObject({ absoluteReturn: { amount: "25" }, returnPercentage: { value: "25" } });
    expect(calculateStockAverage({ ...context, lots: [{ quantity: "2", unitPrice: { amount: "10", currency: "USD" } }, { quantity: "1", unitPrice: { amount: "16", currency: "USD" } }] })).toMatchObject({ totalQuantity: "3", averageUnitPrice: { amount: "12" } });
    expect(calculateBrokerage({ ...context, tradeValue: { amount: "1000", currency: "USD" }, brokerageRate: { value: "1", representation: "human_percentage" }, additionalCharges: { amount: "5", currency: "USD" } })).toMatchObject({ estimatedCharges: { amount: "15" }, estimatedNetAmount: { amount: "985" } });
    expect(calculateMargin({ ...context, positionValue: { amount: "1000", currency: "USD" }, contributedCapital: { amount: "400", currency: "USD" } })).toMatchObject({ borrowedAmount: { amount: "600" }, marginPercentage: { value: "40" } });
  });

  it("wraps foundation ROI, CAGR, and XIRR without duplicating formulas", () => {
    expect(calculateRoi({ ...context, initialValue: { amount: "100", currency: "USD" }, finalValue: { amount: "125", currency: "USD" } })).toMatchObject({ returnAmount: { amount: "25" }, returnPercentage: { value: "25" } });
    expect(calculateCagr({ ...context, initialValue: { amount: "100", currency: "USD" }, finalValue: { amount: "121", currency: "USD" }, periodCount: 2 }).annualizedRate.value).toBe("10");
    const xirr = calculateXirr({ ...context, cashFlows: [{ date: "2026-01-01", amount: { amount: "-1000", currency: "USD" } }, { date: "2027-01-01", amount: { amount: "1100", currency: "USD" } }] });
    expect(roundDecimal({ value: xirr.annualizedRate.value, rounding: { decimalPlaces: 10, mode: "half_even" } }).rounded).toBe("10.0000000000");
  });

  it("calculates user-supplied deposit and government-scheme assumptions", () => {
    expect(calculateFd({ ...context, principal: { amount: "100", currency: "USD" }, assumedRate: tenAnnual, periodCount: 1 }).estimatedMaturityValue.amount).toBe("110");
    expect(calculateNsc({ ...context, principal: { amount: "100", currency: "INR" }, assumedRate: tenAnnual, periodCount: 1 }).estimatedMaturityValue.amount).toBe("110");
    expect(calculatePpf({ ...context, contribution: { amount: "100", currency: "INR" }, assumedRate: { ...tenAnnual, value: "0" }, periodCount: 2, contributionTiming: "end_of_period" }).estimatedMaturityValue.amount).toBe("200");
    expect(calculateSsy({ ...context, contribution: { amount: "100", currency: "INR" }, assumedRate: { ...tenAnnual, value: "0" }, periodCount: 2, contributionTiming: "end_of_period" }).estimatedMaturityValue.amount).toBe("200");
    expect(calculateRd({ ...context, periodicContribution: { amount: "100", currency: "INR" }, assumedRate: zeroMonthly, contributionCount: 2, contributionTiming: "end_of_period" }).estimatedMaturityValue.amount).toBe("200");
    expect(calculatePostOfficeMis({ ...context, deposit: { amount: "1200", currency: "INR" }, assumedRate: { ...tenAnnual, value: "12" }, paymentCount: 12 }).estimatedPeriodicIncome.amount).toBe("12");
    expect(calculateScss({ ...context, principal: { amount: "1200", currency: "INR" }, assumedRate: { ...tenAnnual, value: "12" }, paymentCount: 12 }).estimatedPeriodicIncome.amount).toBe("12");
  });
});

describe("investment boundaries and government-rate policy", () => {
  it("publishes no unverified government rate presets", () => {
    const schemes = investmentCalculatorPlugins.filter((plugin) => "governmentScheme" in plugin.manifest && plugin.manifest.governmentScheme);
    expect(schemes.map(({ manifest }) => manifest.id).sort()).toEqual(["nsc", "post-office-mis", "ppf", "scss", "ssy"]);
    for (const { manifest, examples } of schemes) {
      expect("ratePolicy" in manifest ? manifest.ratePolicy : undefined).toBe("required_user_input");
      expect(manifest.presets).toEqual([]);
      const result = Reflect.apply(getInvestmentCalculatorPlugin(manifest.id)?.calculate ?? (() => undefined), undefined, [examples[0]?.input]);
      expect(result.metadata.warnings).toEqual(expect.arrayContaining([expect.objectContaining({ code: "user_supplied_rate_unverified" })]));
    }
  });

  it("requires contribution timing and explicit rates", () => {
    const sip = getInvestmentCalculatorPlugin("sip");
    expect(sip?.inputSchema.safeParse({ ...context, periodicContribution: { amount: "100", currency: "USD" }, contributionCount: 2 }).success).toBe(false);
  });

  it("rejects mixed currencies and impossible positions", () => {
    expect(() => calculateStockAverage({ ...context, lots: [{ quantity: "1", unitPrice: { amount: "10", currency: "USD" } }, { quantity: "1", unitPrice: { amount: "10", currency: "EUR" } }] })).toThrowError(expect.objectContaining({ code: "currency-mismatch" }));
    expect(() => calculateMargin({ ...context, positionValue: { amount: "100", currency: "USD" }, contributedCapital: { amount: "101", currency: "USD" } })).toThrowError(expect.objectContaining({ code: "invalid-calculation-input" }));
    expect(() => calculateBrokerage({ ...context, tradeValue: { amount: "10", currency: "USD" }, brokerageRate: { value: "100", representation: "human_percentage" }, additionalCharges: { amount: "1", currency: "USD" } })).toThrowError(expect.objectContaining({ code: "invalid-calculation-input" }));
  });
});
