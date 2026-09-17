import { z } from "@aperture/validation";

import {
  cashFlowTimingSchema,
  compoundingFrequencySchema,
  currencyCodeSchema,
  financialPeriodSchema,
  interestRateSchema,
  isoDateSchema,
  moneySchema,
  percentageSchema,
} from "../../generated/finance.schemas.js";
import { financeDecimalStringSchema } from "../../finance.validation.js";

export const roundingModeSchema = z.enum(["half_up", "half_even", "down", "up"]);
export type RoundingMode = Readonly<z.infer<typeof roundingModeSchema>>;

export const roundingOptionsSchema = z.strictObject({
  decimalPlaces: z.number().int().min(0).max(18),
  mode: roundingModeSchema,
}).readonly();
export type RoundingOptions = Readonly<z.infer<typeof roundingOptionsSchema>>;

export const roundedDecimalSchema = z.strictObject({
  exact: financeDecimalStringSchema,
  rounded: financeDecimalStringSchema,
}).readonly();
export type RoundedDecimal = Readonly<z.infer<typeof roundedDecimalSchema>>;

export const rateKindSchema = z.enum(["nominal", "effective"]);
export type RateKind = Readonly<z.infer<typeof rateKindSchema>>;

export const interestRateConversionInputSchema = z.strictObject({
  rate: interestRateSchema,
  sourceKind: rateKindSchema,
  targetKind: rateKindSchema,
  targetPeriod: financialPeriodSchema,
  targetCompoundingFrequency: compoundingFrequencySchema,
}).readonly();
export type InterestRateConversionInput = Readonly<z.infer<typeof interestRateConversionInputSchema>>;

export const interestAmountInputSchema = z.strictObject({
  principal: moneySchema,
  rate: interestRateSchema,
  periodCount: z.number().int().positive(),
}).readonly();
export type InterestAmountInput = Readonly<z.infer<typeof interestAmountInputSchema>>;

export const interestAmountResultSchema = z.strictObject({
  interest: moneySchema,
  total: moneySchema,
}).readonly();
export type InterestAmountResult = Readonly<z.infer<typeof interestAmountResultSchema>>;

export const timeValueInputSchema = z.strictObject({
  value: moneySchema,
  periodicRate: interestRateSchema,
  periodCount: z.number().int().nonnegative(),
}).readonly();
export type TimeValueInput = Readonly<z.infer<typeof timeValueInputSchema>>;

export const annuityInputSchema = z.strictObject({
  payment: moneySchema,
  periodicRate: interestRateSchema,
  paymentCount: z.number().int().positive(),
  timing: cashFlowTimingSchema,
}).readonly();
export type AnnuityInput = Readonly<z.infer<typeof annuityInputSchema>>;

export const foundationDatedCashFlowSchema = z.strictObject({
  date: isoDateSchema,
  amount: moneySchema,
}).readonly();
export type FoundationDatedCashFlow = Readonly<z.infer<typeof foundationDatedCashFlowSchema>>;

export const dayCountConventionSchema = z.literal("actual_365_fixed");
export type DayCountConvention = Readonly<z.infer<typeof dayCountConventionSchema>>;

export const cashFlowTimelineInputSchema = z.strictObject({
  cashFlows: z.array(foundationDatedCashFlowSchema).min(1).readonly(),
  dayCountConvention: dayCountConventionSchema,
}).readonly();
export type CashFlowTimelineInput = Readonly<z.infer<typeof cashFlowTimelineInputSchema>>;

export const cashFlowTimelineSchema = z.strictObject({
  currency: currencyCodeSchema,
  cashFlows: z.array(foundationDatedCashFlowSchema).min(1).readonly(),
  dayCountConvention: dayCountConventionSchema,
}).readonly();
export type CashFlowTimeline = Readonly<z.infer<typeof cashFlowTimelineSchema>>;

export const netPresentValueInputSchema = z.strictObject({
  timeline: cashFlowTimelineSchema,
  annualRate: percentageSchema,
}).readonly();
export type NetPresentValueInput = Readonly<z.infer<typeof netPresentValueInputSchema>>;

export const roiFoundationInputSchema = z.strictObject({
  initialValue: moneySchema,
  finalValue: moneySchema,
}).readonly();
export type RoiFoundationInput = Readonly<z.infer<typeof roiFoundationInputSchema>>;

export const roiFoundationResultSchema = z.strictObject({
  returnAmount: moneySchema,
  returnPercentage: percentageSchema,
}).readonly();
export type RoiFoundationResult = Readonly<z.infer<typeof roiFoundationResultSchema>>;

export const cagrFoundationInputSchema = z.strictObject({
  initialValue: moneySchema,
  finalValue: moneySchema,
  periodCount: z.number().int().positive(),
}).readonly();
export type CagrFoundationInput = Readonly<z.infer<typeof cagrFoundationInputSchema>>;

export const xirrFoundationInputSchema = z.strictObject({
  timeline: cashFlowTimelineSchema,
  maximumIterations: z.number().int().min(1).max(512).default(256),
  tolerance: financeDecimalStringSchema.default("0.000000000000000000000001"),
}).readonly();
export type XirrFoundationInput = Readonly<z.input<typeof xirrFoundationInputSchema>>;

export const inflationAdjustmentDirectionSchema = z.enum(["inflate", "deflate"]);
export const inflationFoundationInputSchema = z.strictObject({
  value: moneySchema,
  inflationRate: percentageSchema,
  periodCount: z.number().int().nonnegative(),
  direction: inflationAdjustmentDirectionSchema,
}).readonly();
export type InflationFoundationInput = Readonly<z.infer<typeof inflationFoundationInputSchema>>;

export const amortizedPaymentInputSchema = z.strictObject({
  principal: moneySchema,
  periodicRate: interestRateSchema,
  paymentCount: z.number().int().positive(),
  timing: cashFlowTimingSchema,
}).readonly();
export type AmortizedPaymentInput = Readonly<z.infer<typeof amortizedPaymentInputSchema>>;

export const amortizationEntrySchema = z.strictObject({
  period: z.number().int().positive(),
  openingBalance: moneySchema,
  payment: moneySchema,
  interest: moneySchema,
  principal: moneySchema,
  closingBalance: moneySchema,
}).readonly();
export type AmortizationEntry = Readonly<z.infer<typeof amortizationEntrySchema>>;

export const amortizationScheduleSchema = z.strictObject({
  payment: moneySchema,
  totalInterest: moneySchema,
  totalPayment: moneySchema,
  entries: z.array(amortizationEntrySchema).readonly(),
}).readonly();
export type AmortizationSchedule = Readonly<z.infer<typeof amortizationScheduleSchema>>;

export const periodicCashFlowValueInputSchema = z.strictObject({
  startingValue: moneySchema,
  periodicAmount: moneySchema,
  periodicRate: interestRateSchema,
  periodCount: z.number().int().nonnegative(),
  timing: cashFlowTimingSchema,
}).readonly();
export type PeriodicCashFlowValueInput = Readonly<z.infer<typeof periodicCashFlowValueInputSchema>>;

export const roundMoneyInputSchema = z.strictObject({
  money: moneySchema,
  rounding: roundingOptionsSchema,
}).readonly();
export type RoundMoneyInput = Readonly<z.infer<typeof roundMoneyInputSchema>>;

export const roundDecimalInputSchema = z.strictObject({
  value: financeDecimalStringSchema,
  rounding: roundingOptionsSchema,
}).readonly();
export type RoundDecimalInput = Readonly<z.infer<typeof roundDecimalInputSchema>>;
