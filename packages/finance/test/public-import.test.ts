import { expect, expectTypeOf, it } from "vitest";
import * as finance from "@aperture/finance";
import type { FinanceRepository, FinanceService, InterestRate, Money, SipInput } from "@aperture/finance";

function schemaVariable(name: string): string {
  const words = name.match(/[A-Z]+(?=[A-Z][a-z]|$)|[A-Z]?[a-z]+|\d+/g) ?? [name];
  return `${words.map((word, index) => index === 0 ? word.toLowerCase() : `${word[0]?.toUpperCase()}${word.slice(1).toLowerCase()}`).join("")}Schema`;
}

it("exposes every generated schema through the built package", () => {
  const publicExports: Readonly<Record<string, unknown>> = finance;
  expect(Object.keys(finance.financeSchemas)).toHaveLength(281);
  for (const [name, schema] of Object.entries(finance.financeSchemas)) {
    expect(publicExports[schemaVariable(name)], `${name} schema is not public`).toBe(schema);
  }
  expect(finance.pageResultSchema).toBeTypeOf("function");
});

it("retains the complete deferred contract types", () => {
  expectTypeOf<ReturnType<typeof finance.moneySchema.parse>>().toMatchTypeOf<Money>();
  expectTypeOf<ReturnType<typeof finance.interestRateSchema.parse>>().toMatchTypeOf<InterestRate>();
  expectTypeOf<ReturnType<typeof finance.sipInputSchema.parse>>().toHaveProperty("contributionTiming");
  expectTypeOf<SipInput>().toHaveProperty("contributionTiming");
  expectTypeOf<FinanceRepository>().toHaveProperty("accounts");
  expectTypeOf<FinanceService>().toHaveProperty("getFinanceOverview");
});
