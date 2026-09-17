import { describe, expect, it } from "vitest";
import { Decimal } from "decimal.js";
import {
  FinanceCalculationError,
  amortizationSchedule,
  amortizedPayment,
  compoundAnnualGrowthRate,
  compoundInterest,
  convertInterestRate,
  createCashFlowTimeline,
  financeCalculationFoundationExamples,
  financeCalculationFoundationManifest,
  futureValue,
  futureValueAfterWithdrawals,
  futureValueAnnuity,
  futureValueWithContributions,
  inflationAdjustedValue,
  netPresentValue,
  presentValue,
  presentValueAnnuity,
  returnOnInvestment,
  roundDecimal,
  roundMoney,
  simpleInterest,
  xirr,
} from "@aperture/finance";
import type { CompoundingFrequency, FinancialPeriod, InterestRate, Money } from "@aperture/finance";

function money(amount: string, currency = "USD"): Money {
  return { amount, currency };
}

function rate(value: string, period: FinancialPeriod = "year", compoundingFrequency: CompoundingFrequency = "yearly"): InterestRate {
  return { value, representation: "human_percentage", period, compoundingFrequency };
}

function rounded(value: string, decimalPlaces = 10): string {
  return roundDecimal({ value, rounding: { decimalPlaces, mode: "half_even" } }).rounded;
}

describe("interest and rate primitives", () => {
  it("calculates simple interest without floating-point money", () => {
    expect(simpleInterest({ principal: money("1000"), rate: rate("5"), periodCount: 2 })).toEqual({
      interest: money("100"),
      total: money("1100"),
    });
  });

  it("compounds according to the explicit rate frequency", () => {
    const result = compoundInterest({ principal: money("1000"), rate: rate("12", "year", "monthly"), periodCount: 1 });
    expect(roundMoney({ money: result.total, rounding: { decimalPlaces: 2, mode: "half_even" } }).amount).toBe("1126.83");
    expect(roundMoney({ money: result.interest, rounding: { decimalPlaces: 2, mode: "half_even" } }).amount).toBe("126.83");
  });

  it("rejects compounding frequencies that cannot divide the stated rate period", () => {
    expect(() => compoundInterest({ principal: money("1000"), rate: rate("1", "month", "yearly"), periodCount: 1 }))
      .toThrowError(expect.objectContaining({ code: "unsupported-rate-convention" }));
  });

  it("converts nominal and effective rates with explicit conventions", () => {
    const effective = convertInterestRate({
      rate: rate("12", "year", "monthly"), sourceKind: "nominal", targetKind: "effective",
      targetPeriod: "year", targetCompoundingFrequency: "yearly",
    });
    expect(rounded(effective.value, 8)).toBe("12.68250301");

    const nominal = convertInterestRate({
      rate: effective, sourceKind: "effective", targetKind: "nominal",
      targetPeriod: "year", targetCompoundingFrequency: "monthly",
    });
    expect(rounded(nominal.value, 8)).toBe("12.00000000");
  });

  it("rejects an ambiguous nominal non-annual rate", () => {
    expect(() => convertInterestRate({
      rate: rate("1", "month", "monthly"), sourceKind: "nominal", targetKind: "effective",
      targetPeriod: "year", targetCompoundingFrequency: "yearly",
    })).toThrowError(expect.objectContaining({ code: "unsupported-rate-convention" }));
  });
});

describe("time value and annuities", () => {
  it("round-trips present and future value", () => {
    for (const value of ["0", "1.01", "999999999999999999.999"]) {
      for (const periodCount of [0, 1, 24]) {
        const future = futureValue({ value: money(value), periodicRate: rate("0.5", "month", "monthly"), periodCount });
        const restored = presentValue({ value: future, periodicRate: rate("0.5", "month", "monthly"), periodCount });
        expect(rounded(restored.amount, 18)).toBe(rounded(value, 18));
      }
    }
  });

  it("handles zero-rate annuities and explicit timing", () => {
    const ordinary = futureValueAnnuity({ payment: money("100"), periodicRate: rate("0"), paymentCount: 12, timing: "end_of_period" });
    const due = futureValueAnnuity({ payment: money("100"), periodicRate: rate("1", "month", "monthly"), paymentCount: 12, timing: "beginning_of_period" });
    const end = futureValueAnnuity({ payment: money("100"), periodicRate: rate("1", "month", "monthly"), paymentCount: 12, timing: "end_of_period" });
    expect(ordinary.amount).toBe("1200");
    expect(new Decimal(due.amount).gt(end.amount)).toBe(true);
    expect(presentValueAnnuity({ payment: money("100"), periodicRate: rate("0"), paymentCount: 12, timing: "end_of_period" }).amount).toBe("1200");
  });
});

describe("cash-flow timelines and returns", () => {
  const timeline = createCashFlowTimeline({
    dayCountConvention: "actual_365_fixed",
    cashFlows: [
      { date: "2027-01-01", amount: money("1100") },
      { date: "2026-01-01", amount: money("-1000") },
    ],
  });

  it("sorts cash flows and documents their shared currency", () => {
    expect(timeline.currency).toBe("USD");
    expect(timeline.cashFlows.map(({ date }) => date)).toEqual(["2026-01-01", "2027-01-01"]);
    expect(() => createCashFlowTimeline({
      dayCountConvention: "actual_365_fixed",
      cashFlows: [
        { date: "2026-01-01", amount: money("-1", "USD") },
        { date: "2027-01-01", amount: money("1", "EUR") },
      ],
    })).toThrowError(expect.objectContaining({ code: "currency-mismatch" }));
  });

  it("uses Actual/365 Fixed for NPV", () => {
    const result = netPresentValue({ timeline, annualRate: { value: "10", representation: "human_percentage" } });
    expect(rounded(result.amount, 18)).toBe("0.000000000000000000");
  });

  it("calculates ROI and rejects mixed currencies", () => {
    expect(returnOnInvestment({ initialValue: money("100"), finalValue: money("125") })).toEqual({
      returnAmount: money("25"),
      returnPercentage: { value: "25", representation: "human_percentage" },
    });
    expect(() => returnOnInvestment({ initialValue: money("100", "USD"), finalValue: money("125", "EUR") }))
      .toThrowError(expect.objectContaining({ code: "currency-mismatch" }));
  });

  it("calculates CAGR and protects its domain", () => {
    expect(rounded(compoundAnnualGrowthRate({ initialValue: money("100"), finalValue: money("121"), periodCount: 2 }).value, 12)).toBe("10.000000000000");
    expect(() => compoundAnnualGrowthRate({ initialValue: money("0"), finalValue: money("121"), periodCount: 2 }))
      .toThrowError(expect.objectContaining({ code: "invalid-calculation-input" }));
  });
});

describe("bounded XIRR", () => {
  it("finds the deterministic annual root", () => {
    const result = xirr({ timeline: createCashFlowTimeline({
      dayCountConvention: "actual_365_fixed",
      cashFlows: [
        { date: "2026-01-01", amount: money("-1000") },
        { date: "2027-01-01", amount: money("1100") },
      ],
    }) });
    expect(rounded(result.value, 10)).toBe("10.0000000000");
  });

  it("rejects absent or ambiguous sign transitions", () => {
    const invalidTimeline = createCashFlowTimeline({
      dayCountConvention: "actual_365_fixed",
      cashFlows: [
        { date: "2026-01-01", amount: money("-1000") },
        { date: "2026-06-01", amount: money("1500") },
        { date: "2027-01-01", amount: money("-100") },
      ],
    });
    expect(() => xirr({ timeline: invalidTimeline })).toThrowError(expect.objectContaining({ code: "invalid-calculation-input" }));
  });

  it("fails deterministically when its iteration bound is exhausted", () => {
    expect(() => xirr({
      timeline: createCashFlowTimeline({
        dayCountConvention: "actual_365_fixed",
        cashFlows: [
          { date: "2026-01-01", amount: money("-1000") },
          { date: "2027-01-01", amount: money("1100") },
        ],
      }),
      maximumIterations: 1,
      tolerance: "0.000000000000000000000000000001",
    })).toThrowError(expect.objectContaining({ code: "non-convergent" }));
  });
});

describe("inflation, amortization, timing, and rounding", () => {
  it("inflates and deflates through inverse operations", () => {
    const inflated = inflationAdjustedValue({ value: money("100"), inflationRate: { value: "10", representation: "human_percentage" }, periodCount: 2, direction: "inflate" });
    expect(inflated.amount).toBe("121");
    expect(inflationAdjustedValue({ value: inflated, inflationRate: { value: "10", representation: "human_percentage" }, periodCount: 2, direction: "deflate" }).amount).toBe("100");
  });

  it("creates an exact zero-closing amortization schedule", () => {
    const input = { principal: money("1000"), periodicRate: rate("1", "month", "monthly"), paymentCount: 12, timing: "end_of_period" as const };
    expect(roundMoney({ money: amortizedPayment(input), rounding: { decimalPlaces: 2, mode: "half_even" } }).amount).toBe("88.85");
    const schedule = amortizationSchedule(input);
    expect(schedule.entries).toHaveLength(12);
    expect(schedule.entries.at(-1)?.closingBalance.amount).toBe("0");
    expect(new Decimal(schedule.totalPayment.amount).minus(schedule.totalInterest.amount).eq("1000")).toBe(true);
  });

  it("handles zero-rate amortization", () => {
    expect(amortizedPayment({ principal: money("100"), periodicRate: rate("0", "month", "monthly"), paymentCount: 4, timing: "end_of_period" }).amount).toBe("25");
  });

  it("models contribution and withdrawal timing explicitly", () => {
    expect(futureValueWithContributions({ startingValue: money("0"), periodicAmount: money("100"), periodicRate: rate("0", "month", "monthly"), periodCount: 12, timing: "end_of_period" }).amount).toBe("1200");
    expect(futureValueAfterWithdrawals({ startingValue: money("1000"), periodicAmount: money("100"), periodicRate: rate("0", "month", "monthly"), periodCount: 5, timing: "end_of_period" }).amount).toBe("500");
    const due = futureValueWithContributions({ startingValue: money("0"), periodicAmount: money("100"), periodicRate: rate("1", "month", "monthly"), periodCount: 12, timing: "beginning_of_period" });
    const ordinary = futureValueWithContributions({ startingValue: money("0"), periodicAmount: money("100"), periodicRate: rate("1", "month", "monthly"), periodCount: 12, timing: "end_of_period" });
    expect(new Decimal(due.amount).gt(ordinary.amount)).toBe(true);
  });

  it("supports explicit half-up and half-even rounding without locale formatting", () => {
    expect(roundDecimal({ value: "2.345", rounding: { decimalPlaces: 2, mode: "half_up" } })).toEqual({ exact: "2.345", rounded: "2.35" });
    expect(roundDecimal({ value: "2.345", rounding: { decimalPlaces: 2, mode: "half_even" } })).toEqual({ exact: "2.345", rounded: "2.34" });
    expect(roundMoney({ money: money("2.3"), rounding: { decimalPlaces: 2, mode: "half_even" } })).toEqual(money("2.30"));
  });

  it("publishes stable manifest assumptions and executable examples", () => {
    expect(financeCalculationFoundationManifest.dayCountConvention).toBe("actual_365_fixed");
    expect(simpleInterest(financeCalculationFoundationExamples.simpleInterest)).toEqual({ interest: money("100"), total: money("1100") });
  });

  it("normalizes runtime validation failures", () => {
    expect(() => Reflect.apply(simpleInterest, undefined, [{}])).toThrowError(FinanceCalculationError);
    expect(() => Reflect.apply(simpleInterest, undefined, [{}])).toThrowError(expect.objectContaining({ code: "invalid-calculation-input" }));
  });
});
