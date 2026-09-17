export const financeCalculationFoundationExamples = {
  simpleInterest: {
    principal: { amount: "1000", currency: "USD" },
    rate: { value: "5", representation: "human_percentage", period: "year", compoundingFrequency: "yearly" },
    periodCount: 2,
  },
  annuityDue: {
    payment: { amount: "100", currency: "USD" },
    periodicRate: { value: "1", representation: "human_percentage", period: "month", compoundingFrequency: "monthly" },
    paymentCount: 12,
    timing: "beginning_of_period",
  },
  xirr: {
    timeline: {
      currency: "USD",
      dayCountConvention: "actual_365_fixed",
      cashFlows: [
        { date: "2026-01-01", amount: { amount: "-1000", currency: "USD" } },
        { date: "2027-01-01", amount: { amount: "1100", currency: "USD" } },
      ],
    },
  },
} as const;
