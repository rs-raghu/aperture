import type { Decimal } from "decimal.js";

import { convertInterestRate, futureValueWithContributions } from "../foundation/foundation.calculate.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import type { CalculatorWarning } from "../calculator.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { RetirementProjectionScenario, RetirementScenarioResult } from "./retirement-scenario.contracts.js";
import type { RetirementCalculatorManifest, RetirementCalculatorPlugin } from "./retirement-plugin.types.js";
import { asMoney, decimal, ensureNonNegative, ensureSameCurrency, rateFraction } from "../investments/plugin.helpers.js";

export function defineRetirementPlugin<TInput, TOutput>(plugin: RetirementCalculatorPlugin<TInput, TOutput>): RetirementCalculatorPlugin<TInput, TOutput> {
  return Object.freeze(plugin);
}

export function retirementManifest(
  manifest: Omit<RetirementCalculatorManifest, "category" | "version" | "isEstimate" | "ratePolicy" | "presets">,
): RetirementCalculatorManifest {
  return { ...manifest, category: "retirement", version: "1.0.0", isEstimate: true, ratePolicy: "required_user_input", presets: [] };
}

export function annualEffectiveRate(rate: InterestRate, kind: "nominal" | "effective"): InterestRate {
  return convertInterestRate({
    rate,
    sourceKind: kind,
    targetKind: "effective",
    targetPeriod: "year",
    targetCompoundingFrequency: "yearly",
  });
}

export function boundedPercentage(value: Percentage, label: string, allowZero = true): Decimal {
  const fraction = decimal(value.value).dividedBy(100);
  const invalidLower = allowZero ? fraction.isNegative() : fraction.lte(0);
  if (invalidLower || fraction.gt(1)) {
    throw new FinanceCalculationError("invalid-calculation-input", `${label} must be ${allowZero ? "between 0 and 100" : "greater than 0 and no more than 100"} percent.`);
  }
  return fraction;
}

export function schemeWarnings(
  sourceReferenceCount: number,
  manifest: RetirementCalculatorManifest,
  ruleVersion?: string,
  ruleEffectiveOn?: string,
): readonly CalculatorWarning[] {
  const warnings: CalculatorWarning[] = manifest.disclaimers.map((message, index) => ({ code: `retirement_disclosure_${index + 1}`, message }));
  if (manifest.governmentScheme && sourceReferenceCount === 0) {
    warnings.push({ code: "user_supplied_rule_unverified", message: "The calculation uses caller-supplied scheme rules and rates and does not claim they are current official values." });
  }
  if (ruleVersion && ruleEffectiveOn) {
    warnings.push({ code: "effective_dated_rule", message: `Rule ${ruleVersion}, effective ${ruleEffectiveOn}.` });
  }
  return warnings;
}

interface RetirementProjectionInput {
  readonly annualNeed: Money;
  readonly currentAge: number;
  readonly retirementAge: number;
  readonly longevityAge: number;
  readonly existingCorpus: Money;
  readonly annualContribution: Money;
  readonly contributionTiming: "beginning_of_period" | "end_of_period";
  readonly scenarios: readonly RetirementProjectionScenario[];
}

function inflationFraction(value: Percentage): Decimal {
  const fraction = decimal(value.value).dividedBy(100);
  if (fraction.lte(-1)) throw new FinanceCalculationError("invalid-calculation-input", "Inflation must be greater than -100 percent.");
  return fraction;
}

export function projectRetirementScenarios(input: RetirementProjectionInput): readonly RetirementScenarioResult[] {
  const currency = ensureSameCurrency(input.annualNeed, input.existingCorpus, input.annualContribution);
  const need = decimal(input.annualNeed.amount);
  const corpus = decimal(input.existingCorpus.amount);
  const contribution = decimal(input.annualContribution.amount);
  ensureNonNegative(need, "Annual need");
  ensureNonNegative(corpus, "Existing corpus");
  ensureNonNegative(contribution, "Annual contribution");
  if (input.retirementAge <= input.currentAge) throw new FinanceCalculationError("invalid-calculation-input", "Retirement age must be greater than current age.");
  if (input.longevityAge <= input.retirementAge) throw new FinanceCalculationError("invalid-calculation-input", "Longevity age must be greater than retirement age.");
  if (input.scenarios.length === 0) throw new FinanceCalculationError("invalid-calculation-input", "At least one retirement scenario is required.");
  if (new Set(input.scenarios.map(({ name }) => name.toLocaleLowerCase())).size !== input.scenarios.length) {
    throw new FinanceCalculationError("invalid-calculation-input", "Retirement scenario names must be unique.");
  }

  const yearsToRetirement = input.retirementAge - input.currentAge;
  const retirementYears = input.longevityAge - input.retirementAge;
  return input.scenarios.map((scenario) => {
    const inflation = inflationFraction(scenario.inflationRate);
    const withdrawalRate = boundedPercentage(scenario.withdrawalRate, "Withdrawal rate", false);
    const preRetirementRate = annualEffectiveRate(scenario.preRetirementReturn, scenario.preRetirementRateKind);
    const postRetirementRate = annualEffectiveRate(scenario.postRetirementReturn, scenario.postRetirementRateKind);
    const postReturn = rateFraction(postRetirementRate);
    const annualNeedAtRetirement = need.times(decimal(1).plus(inflation).pow(yearsToRetirement));
    const withdrawalRateTarget = annualNeedAtRetirement.dividedBy(withdrawalRate);
    let longevityTarget = decimal(0);
    for (let year = 0; year < retirementYears; year += 1) {
      const needForYear = annualNeedAtRetirement.times(decimal(1).plus(inflation).pow(year));
      longevityTarget = longevityTarget.plus(needForYear.dividedBy(decimal(1).plus(postReturn).pow(year)));
    }
    const target = withdrawalRateTarget.gt(longevityTarget) ? withdrawalRateTarget : longevityTarget;
    const projected = decimal(futureValueWithContributions({
      startingValue: input.existingCorpus,
      periodicAmount: input.annualContribution,
      periodicRate: preRetirementRate,
      periodCount: yearsToRetirement,
      timing: input.contributionTiming,
    }).amount);
    const gap = target.minus(projected);
    return {
      name: scenario.name,
      inflationAdjustedAnnualNeed: asMoney(annualNeedAtRetirement, currency),
      withdrawalRateTarget: asMoney(withdrawalRateTarget, currency),
      longevityTarget: asMoney(longevityTarget, currency),
      targetCorpus: asMoney(target, currency),
      projectedCorpus: asMoney(projected, currency),
      fundingGap: asMoney(gap.isNegative() ? decimal(0) : gap, currency),
    };
  });
}
