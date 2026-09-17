import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import { amortizationSchedule, convertInterestRate } from "../foundation/foundation.calculate.js";
import { FinanceCalculationError } from "../foundation/foundation.errors.js";
import type { RateKind } from "../foundation/foundation.schemas.js";

export function monthlyLoanRate(annualRate: InterestRate, sourceKind: RateKind): InterestRate {
  if (annualRate.period !== "year") {
    throw new FinanceCalculationError("unsupported-rate-convention", "Loan interest rates must identify an annual period.");
  }
  return convertInterestRate({
    rate: annualRate,
    sourceKind,
    targetKind: "effective",
    targetPeriod: "month",
    targetCompoundingFrequency: "monthly",
  });
}

export function loanSchedule(principal: Money, annualRate: InterestRate, sourceKind: RateKind, paymentCount: number) {
  return amortizationSchedule({
    principal,
    periodicRate: monthlyLoanRate(annualRate, sourceKind),
    paymentCount,
    timing: "end_of_period",
  });
}
