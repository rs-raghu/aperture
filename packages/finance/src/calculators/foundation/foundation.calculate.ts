import { Decimal } from "decimal.js";
import { validateInput } from "@aperture/validation";

import type { ValidationSchema } from "@aperture/validation";
import type { CompoundingFrequency, FinancialPeriod } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import { FinanceCalculationError } from "./foundation.errors.js";
import {
  amortizationScheduleSchema,
  amortizedPaymentInputSchema,
  annuityInputSchema,
  cashFlowTimelineInputSchema,
  cashFlowTimelineSchema,
  cagrFoundationInputSchema,
  inflationFoundationInputSchema,
  interestAmountInputSchema,
  interestAmountResultSchema,
  interestRateConversionInputSchema,
  netPresentValueInputSchema,
  periodicCashFlowValueInputSchema,
  roiFoundationInputSchema,
  roiFoundationResultSchema,
  roundDecimalInputSchema,
  roundedDecimalSchema,
  roundMoneyInputSchema,
  timeValueInputSchema,
  xirrFoundationInputSchema,
} from "./foundation.schemas.js";
import type {
  AmortizationEntry,
  AmortizationSchedule,
  AmortizedPaymentInput,
  AnnuityInput,
  CashFlowTimeline,
  CashFlowTimelineInput,
  CagrFoundationInput,
  InflationFoundationInput,
  InterestAmountInput,
  InterestAmountResult,
  InterestRateConversionInput,
  NetPresentValueInput,
  PeriodicCashFlowValueInput,
  RoiFoundationInput,
  RoiFoundationResult,
  RoundDecimalInput,
  RoundedDecimal,
  RoundingMode,
  RoundMoneyInput,
  TimeValueInput,
  XirrFoundationInput,
} from "./foundation.schemas.js";

const FinancialDecimal = Decimal.clone({ precision: 50, rounding: Decimal.ROUND_HALF_EVEN, toExpNeg: -1_000_000, toExpPos: 1_000_000 });
const ONE_HUNDRED = new FinancialDecimal(100);
const DAYS_PER_YEAR = new FinancialDecimal(365);
const MILLISECONDS_PER_DAY = 86_400_000;

const roundingModes: Readonly<Record<RoundingMode, Decimal.Rounding>> = {
  half_up: Decimal.ROUND_HALF_UP,
  half_even: Decimal.ROUND_HALF_EVEN,
  down: Decimal.ROUND_DOWN,
  up: Decimal.ROUND_UP,
};

const annualPeriods: Readonly<Record<Exclude<FinancialPeriod, "custom">, number>> = {
  day: 365,
  week: 52,
  month: 12,
  quarter: 4,
  year: 1,
};

const annualCompounds: Readonly<Record<CompoundingFrequency, number>> = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  yearly: 1,
};

function parseInput<T>(schema: ValidationSchema<T>, input: unknown): T {
  const result = validateInput(schema, input);
  if (result.success) return result.value;
  throw new FinanceCalculationError(
    "invalid-calculation-input",
    result.issues.map((issue) => issue.message).join("; "),
    result.issues,
  );
}

function parseResult<T>(schema: ValidationSchema<unknown>, result: T): T {
  const validation = validateInput(schema, result);
  if (validation.success) return result;
  throw new FinanceCalculationError("invalid-calculation-result", "The calculation produced an invalid result.", validation.issues);
}

function decimal(value: string | number): Decimal {
  try {
    return new FinancialDecimal(value);
  } catch {
    throw new FinanceCalculationError("calculation-failed", "A validated decimal value could not be processed.");
  }
}

function serialized(value: Decimal): string {
  if (!value.isFinite()) throw new FinanceCalculationError("calculation-failed", "The calculation did not produce a finite result.");
  return value.isZero() ? "0" : value.toFixed();
}

function money(amount: Decimal, currency: string): Money {
  return { amount: serialized(amount), currency };
}

function percentage(value: Decimal) {
  return { value: serialized(value), representation: "human_percentage" as const };
}

function rateFraction(rate: InterestRate): Decimal {
  const value = decimal(rate.value).dividedBy(ONE_HUNDRED);
  if (value.lte(-1)) {
    throw new FinanceCalculationError("invalid-calculation-input", "A rate must be greater than -100 percent.");
  }
  return value;
}

function periodsPerYear(period: FinancialPeriod): number {
  if (period === "custom") {
    throw new FinanceCalculationError("unsupported-rate-convention", "Custom rate periods require an explicit duration and cannot be converted automatically.");
  }
  return annualPeriods[period];
}

function ensureSameCurrency(...values: readonly Money[]): string {
  const currency = values[0]?.currency;
  if (!currency || values.some((value) => value.currency !== currency)) {
    throw new FinanceCalculationError("currency-mismatch", "All monetary inputs must use the same currency.");
  }
  return currency;
}

function ensurePositive(value: Decimal, label: string): void {
  if (!value.gt(0)) throw new FinanceCalculationError("invalid-calculation-input", `${label} must be greater than zero.`);
}

function periodicGrowth(rate: InterestRate, periodCount: number): Decimal {
  return decimal(1).plus(rateFraction(rate)).pow(periodCount);
}

function annuityFactor(rate: Decimal, count: number, timing: "beginning_of_period" | "end_of_period", present: boolean): Decimal {
  if (rate.isZero()) return decimal(count);
  const onePlusRate = decimal(1).plus(rate);
  const base = present
    ? decimal(1).minus(onePlusRate.pow(-count)).dividedBy(rate)
    : onePlusRate.pow(count).minus(1).dividedBy(rate);
  return timing === "beginning_of_period" ? base.times(onePlusRate) : base;
}

/** Simple interest: I = P × r × n. The supplied rate applies to each supplied period. */
export function simpleInterest(input: InterestAmountInput): InterestAmountResult {
  const parsed = parseInput(interestAmountInputSchema, input);
  const principal = decimal(parsed.principal.amount);
  ensurePositive(principal, "Principal");
  const interest = principal.times(rateFraction(parsed.rate)).times(parsed.periodCount);
  return parseResult(interestAmountResultSchema, {
    interest: money(interest, parsed.principal.currency),
    total: money(principal.plus(interest), parsed.principal.currency),
  });
}

/** Compound interest derives compounding events from the explicit rate period and frequency. */
export function compoundInterest(input: InterestAmountInput): InterestAmountResult {
  const parsed = parseInput(interestAmountInputSchema, input);
  const principal = decimal(parsed.principal.amount);
  ensurePositive(principal, "Principal");
  const ratePeriods = periodsPerYear(parsed.rate.period);
  const compounds = annualCompounds[parsed.rate.compoundingFrequency];
  if (compounds < ratePeriods || compounds % ratePeriods !== 0) {
    throw new FinanceCalculationError("unsupported-rate-convention", "Compounding frequency must divide the stated rate period into a whole number of intervals.");
  }
  const eventsPerRatePeriod = compounds / ratePeriods;
  const growth = decimal(1)
    .plus(rateFraction(parsed.rate).dividedBy(eventsPerRatePeriod))
    .pow(eventsPerRatePeriod * parsed.periodCount);
  const total = principal.times(growth);
  return parseResult(interestAmountResultSchema, {
    interest: money(total.minus(principal), parsed.principal.currency),
    total: money(total, parsed.principal.currency),
  });
}

/** Converts explicitly between nominal and effective rates without assuming an annual source period. */
export function convertInterestRate(input: InterestRateConversionInput): InterestRate {
  const parsed = parseInput(interestRateConversionInputSchema, input);
  const sourceRate = rateFraction(parsed.rate);
  let effectiveAnnual: Decimal;

  if (parsed.sourceKind === "nominal") {
    if (parsed.rate.period !== "year") {
      throw new FinanceCalculationError("unsupported-rate-convention", "Nominal rates must identify an annual period.");
    }
    const compounds = annualCompounds[parsed.rate.compoundingFrequency];
    effectiveAnnual = decimal(1).plus(sourceRate.dividedBy(compounds)).pow(compounds).minus(1);
  } else {
    effectiveAnnual = decimal(1).plus(sourceRate).pow(periodsPerYear(parsed.rate.period)).minus(1);
  }

  let targetRate: Decimal;
  if (parsed.targetKind === "nominal") {
    if (parsed.targetPeriod !== "year") {
      throw new FinanceCalculationError("unsupported-rate-convention", "Nominal target rates must identify an annual period.");
    }
    const compounds = annualCompounds[parsed.targetCompoundingFrequency];
    targetRate = decimal(compounds).times(decimal(1).plus(effectiveAnnual).pow(decimal(1).dividedBy(compounds)).minus(1));
  } else {
    targetRate = decimal(1).plus(effectiveAnnual).pow(decimal(1).dividedBy(periodsPerYear(parsed.targetPeriod))).minus(1);
  }

  return {
    value: serialized(targetRate.times(ONE_HUNDRED)),
    representation: "human_percentage",
    period: parsed.targetPeriod,
    compoundingFrequency: parsed.targetCompoundingFrequency,
  };
}

/** Future value: FV = PV × (1 + r)^n. */
export function futureValue(input: TimeValueInput): Money {
  const parsed = parseInput(timeValueInputSchema, input);
  return money(decimal(parsed.value.amount).times(periodicGrowth(parsed.periodicRate, parsed.periodCount)), parsed.value.currency);
}

/** Present value: PV = FV ÷ (1 + r)^n. */
export function presentValue(input: TimeValueInput): Money {
  const parsed = parseInput(timeValueInputSchema, input);
  return money(decimal(parsed.value.amount).dividedBy(periodicGrowth(parsed.periodicRate, parsed.periodCount)), parsed.value.currency);
}

/** Future value of an ordinary annuity or annuity due. */
export function futureValueAnnuity(input: AnnuityInput): Money {
  const parsed = parseInput(annuityInputSchema, input);
  const value = decimal(parsed.payment.amount).times(annuityFactor(rateFraction(parsed.periodicRate), parsed.paymentCount, parsed.timing, false));
  return money(value, parsed.payment.currency);
}

/** Present value of an ordinary annuity or annuity due. */
export function presentValueAnnuity(input: AnnuityInput): Money {
  const parsed = parseInput(annuityInputSchema, input);
  const value = decimal(parsed.payment.amount).times(annuityFactor(rateFraction(parsed.periodicRate), parsed.paymentCount, parsed.timing, true));
  return money(value, parsed.payment.currency);
}

/** Sorts cash flows by date. Positive values are inflows and negative values are outflows. */
export function createCashFlowTimeline(input: CashFlowTimelineInput): CashFlowTimeline {
  const parsed = parseInput(cashFlowTimelineInputSchema, input);
  const currency = ensureSameCurrency(...parsed.cashFlows.map(({ amount }) => amount));
  return cashFlowTimelineSchema.parse({
    currency,
    dayCountConvention: parsed.dayCountConvention,
    cashFlows: [...parsed.cashFlows].sort((left, right) => left.date.localeCompare(right.date)),
  });
}

function dayOffset(start: string, end: string): number {
  return (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / MILLISECONDS_PER_DAY;
}

function timelineNpv(timeline: CashFlowTimeline, annualRate: Decimal): Decimal {
  if (annualRate.lte(-1)) throw new FinanceCalculationError("invalid-calculation-input", "Annual discount rate must be greater than -100 percent.");
  const firstDate = timeline.cashFlows[0]?.date;
  if (!firstDate) throw new FinanceCalculationError("invalid-calculation-input", "At least one cash flow is required.");
  return timeline.cashFlows.reduce((total, cashFlow) => {
    const years = decimal(dayOffset(firstDate, cashFlow.date)).dividedBy(DAYS_PER_YEAR);
    const discount = decimal(1).plus(annualRate).pow(years);
    return total.plus(decimal(cashFlow.amount.amount).dividedBy(discount));
  }, decimal(0));
}

/** NPV uses Actual/365 Fixed and an effective annual discount rate. */
export function netPresentValue(input: NetPresentValueInput): Money {
  const parsed = parseInput(netPresentValueInputSchema, input);
  const currency = ensureSameCurrency(...parsed.timeline.cashFlows.map(({ amount }) => amount));
  if (currency !== parsed.timeline.currency) {
    throw new FinanceCalculationError("currency-mismatch", "Timeline currency must match every cash flow.");
  }
  return money(timelineNpv(parsed.timeline, decimal(parsed.annualRate.value).dividedBy(ONE_HUNDRED)), parsed.timeline.currency);
}

/** ROI = (final − initial) ÷ initial. */
export function returnOnInvestment(input: RoiFoundationInput): RoiFoundationResult {
  const parsed = parseInput(roiFoundationInputSchema, input);
  const currency = ensureSameCurrency(parsed.initialValue, parsed.finalValue);
  const initial = decimal(parsed.initialValue.amount);
  ensurePositive(initial, "Initial value");
  const result = decimal(parsed.finalValue.amount).minus(initial);
  return parseResult(roiFoundationResultSchema, {
    returnAmount: money(result, currency),
    returnPercentage: percentage(result.dividedBy(initial).times(ONE_HUNDRED)),
  });
}

/** CAGR = (final ÷ initial)^(1 ÷ n) − 1. */
export function compoundAnnualGrowthRate(input: CagrFoundationInput) {
  const parsed = parseInput(cagrFoundationInputSchema, input);
  ensureSameCurrency(parsed.initialValue, parsed.finalValue);
  const initial = decimal(parsed.initialValue.amount);
  const final = decimal(parsed.finalValue.amount);
  ensurePositive(initial, "Initial value");
  if (final.isNegative()) throw new FinanceCalculationError("invalid-calculation-input", "Final value must not be negative.");
  return percentage(final.dividedBy(initial).pow(decimal(1).dividedBy(parsed.periodCount)).minus(1).times(ONE_HUNDRED));
}

/** XIRR uses bounded bisection, Actual/365 Fixed, and requires one cash-flow sign change. */
export function xirr(input: XirrFoundationInput) {
  const parsed = parseInput(xirrFoundationInputSchema, input);
  const timeline = createCashFlowTimeline({ cashFlows: parsed.timeline.cashFlows, dayCountConvention: parsed.timeline.dayCountConvention });
  if (timeline.currency !== parsed.timeline.currency) {
    throw new FinanceCalculationError("currency-mismatch", "Timeline currency must match every cash flow.");
  }
  if (timeline.cashFlows.length < 2 || timeline.cashFlows[0]?.date === timeline.cashFlows.at(-1)?.date) {
    throw new FinanceCalculationError("invalid-calculation-input", "XIRR requires cash flows on at least two distinct dates.");
  }
  const signs = timeline.cashFlows.map(({ amount }) => decimal(amount.amount).cmp(0)).filter((sign) => sign !== 0);
  const transitions = signs.slice(1).filter((sign, index) => sign !== signs[index]).length;
  if (transitions !== 1) {
    throw new FinanceCalculationError("invalid-calculation-input", "XIRR requires both positive and negative cash flows with exactly one sign change.");
  }

  const tolerance = decimal(parsed.tolerance ?? "0.000000000000000000000001");
  ensurePositive(tolerance, "Tolerance");
  let low = decimal("-0.999999999999");
  let high = decimal(1);
  let lowValue = timelineNpv(timeline, low);
  let highValue = timelineNpv(timeline, high);
  const maximumRate = decimal(1_000_000);
  while (lowValue.times(highValue).gt(0) && high.lt(maximumRate)) {
    high = high.times(2);
    highValue = timelineNpv(timeline, high);
  }
  if (lowValue.times(highValue).gt(0)) {
    throw new FinanceCalculationError("non-convergent", "XIRR could not bracket a rate within the supported bounds.");
  }

  const maximumIterations = parsed.maximumIterations ?? 256;
  for (let iteration = 0; iteration < maximumIterations; iteration += 1) {
    const midpoint = low.plus(high).dividedBy(2);
    const midpointValue = timelineNpv(timeline, midpoint);
    if (midpointValue.abs().lte(tolerance) || high.minus(low).abs().lte(tolerance)) {
      return percentage(midpoint.times(ONE_HUNDRED));
    }
    if (lowValue.times(midpointValue).lte(0)) {
      high = midpoint;
    } else {
      low = midpoint;
      lowValue = midpointValue;
    }
  }
  throw new FinanceCalculationError("non-convergent", `XIRR did not converge within ${maximumIterations} iterations.`);
}

/** Inflate multiplies by (1 + i)^n; deflate divides by the same factor. */
export function inflationAdjustedValue(input: InflationFoundationInput): Money {
  const parsed = parseInput(inflationFoundationInputSchema, input);
  const inflation = decimal(parsed.inflationRate.value).dividedBy(ONE_HUNDRED);
  if (inflation.lte(-1)) throw new FinanceCalculationError("invalid-calculation-input", "Inflation rate must be greater than -100 percent.");
  const factor = decimal(1).plus(inflation).pow(parsed.periodCount);
  const value = decimal(parsed.value.amount);
  return money(parsed.direction === "inflate" ? value.times(factor) : value.dividedBy(factor), parsed.value.currency);
}

/** Level payment for end-of-period or beginning-of-period amortization. */
export function amortizedPayment(input: AmortizedPaymentInput): Money {
  const parsed = parseInput(amortizedPaymentInputSchema, input);
  const principal = decimal(parsed.principal.amount);
  ensurePositive(principal, "Principal");
  const rate = rateFraction(parsed.periodicRate);
  const ordinaryPayment = rate.isZero()
    ? principal.dividedBy(parsed.paymentCount)
    : principal.times(rate).dividedBy(decimal(1).minus(decimal(1).plus(rate).pow(-parsed.paymentCount)));
  const payment = parsed.timing === "beginning_of_period" ? ordinaryPayment.dividedBy(decimal(1).plus(rate)) : ordinaryPayment;
  return money(payment, parsed.principal.currency);
}

/** Exact amortization schedule; consumers choose a rounding boundary separately. */
export function amortizationSchedule(input: AmortizedPaymentInput): AmortizationSchedule {
  const parsed = parseInput(amortizedPaymentInputSchema, input);
  const scheduledPayment = decimal(amortizedPayment(parsed).amount);
  const rate = rateFraction(parsed.periodicRate);
  let balance = decimal(parsed.principal.amount);
  let totalInterest = decimal(0);
  let totalPayment = decimal(0);
  const entries: AmortizationEntry[] = [];

  for (let period = 1; period <= parsed.paymentCount; period += 1) {
    const opening = balance;
    const interest = parsed.timing === "beginning_of_period" ? opening.minus(scheduledPayment).times(rate) : opening.times(rate);
    let payment = scheduledPayment;
    let closing = opening.plus(interest).minus(payment);
    if (period === parsed.paymentCount || closing.abs().lt("0.000000000000000000000001")) {
      payment = opening.plus(interest);
      closing = decimal(0);
    }
    const principalPaid = payment.minus(interest);
    totalInterest = totalInterest.plus(interest);
    totalPayment = totalPayment.plus(payment);
    entries.push({
      period,
      openingBalance: money(opening, parsed.principal.currency),
      payment: money(payment, parsed.principal.currency),
      interest: money(interest, parsed.principal.currency),
      principal: money(principalPaid, parsed.principal.currency),
      closingBalance: money(closing, parsed.principal.currency),
    });
    balance = closing;
  }

  return parseResult(amortizationScheduleSchema, {
    payment: money(scheduledPayment, parsed.principal.currency),
    totalInterest: money(totalInterest, parsed.principal.currency),
    totalPayment: money(totalPayment, parsed.principal.currency),
    entries,
  });
}

/** Future value with explicit contribution timing. */
export function futureValueWithContributions(input: PeriodicCashFlowValueInput): Money {
  const parsed = parseInput(periodicCashFlowValueInputSchema, input);
  const currency = ensureSameCurrency(parsed.startingValue, parsed.periodicAmount);
  const contribution = decimal(parsed.periodicAmount.amount);
  if (contribution.isNegative()) throw new FinanceCalculationError("invalid-calculation-input", "Contribution must not be negative.");
  const rate = rateFraction(parsed.periodicRate);
  const result = decimal(parsed.startingValue.amount).times(decimal(1).plus(rate).pow(parsed.periodCount))
    .plus(contribution.times(annuityFactor(rate, parsed.periodCount, parsed.timing, false)));
  return money(result, currency);
}

/** Future value after explicit beginning-of-period or end-of-period withdrawals. */
export function futureValueAfterWithdrawals(input: PeriodicCashFlowValueInput): Money {
  const parsed = parseInput(periodicCashFlowValueInputSchema, input);
  const currency = ensureSameCurrency(parsed.startingValue, parsed.periodicAmount);
  const withdrawal = decimal(parsed.periodicAmount.amount);
  if (withdrawal.isNegative()) throw new FinanceCalculationError("invalid-calculation-input", "Withdrawal must not be negative.");
  const rate = rateFraction(parsed.periodicRate);
  const result = decimal(parsed.startingValue.amount).times(decimal(1).plus(rate).pow(parsed.periodCount))
    .minus(withdrawal.times(annuityFactor(rate, parsed.periodCount, parsed.timing, false)));
  return money(result, currency);
}

/** Explicit decimal rounding boundary; exact calculation values remain available. */
export function roundDecimal(input: RoundDecimalInput): RoundedDecimal {
  const parsed = parseInput(roundDecimalInputSchema, input);
  const value = decimal(parsed.value);
  return roundedDecimalSchema.parse({
    exact: serialized(value),
    rounded: value.toDecimalPlaces(parsed.rounding.decimalPlaces, roundingModes[parsed.rounding.mode]).toFixed(parsed.rounding.decimalPlaces),
  });
}

/** Explicit monetary rounding boundary without locale or display formatting. */
export function roundMoney(input: RoundMoneyInput): Money {
  const parsed = parseInput(roundMoneyInputSchema, input);
  const rounded = decimal(parsed.money.amount)
    .toDecimalPlaces(parsed.rounding.decimalPlaces, roundingModes[parsed.rounding.mode])
    .toFixed(parsed.rounding.decimalPlaces);
  return { amount: rounded, currency: parsed.money.currency };
}
