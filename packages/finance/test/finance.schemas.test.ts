import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  createBudgetInputSchema,
  financeDeclarationInventory,
  financeSchemas,
  fiscalYearIdSchema,
  interestRateSchema,
  isoDateSchema,
  isoDateTimeSchema,
  moneySchema,
  ownerQuerySchema,
  pageRequestSchema,
  pageResultSchema,
  sipInputSchema,
  updateFinancialAccountInputSchema,
} from "@aperture/finance";
import { financeSchemaFixtures } from "./generated/finance.fixtures.js";

describe("generated Finance declaration schemas", () => {
  it("accepts a generated valid fixture for every declared runtime model", () => {
    expect(Object.keys(financeSchemas)).toHaveLength(283);
    expect(Object.keys(financeSchemaFixtures).sort()).toEqual(Object.keys(financeSchemas).sort());

    for (const [name, schema] of Object.entries(financeSchemas)) {
      const fixture = financeSchemaFixtures[name];
      expect(fixture, `${name} is missing a fixture`).toBeTypeOf("function");
      const result = schema.safeParse(fixture?.());
      expect(result.success, `${name}: ${result.error?.message ?? "unknown validation error"}`).toBe(true);
    }
  });

  it("keeps the generated declaration inventory complete and unique", () => {
    expect(financeDeclarationInventory.repositories).toHaveLength(30);
    expect(financeDeclarationInventory.operations).toHaveLength(183);
    expect(new Set(financeDeclarationInventory.schemas)).toHaveLength(283);
    expect(new Set(financeDeclarationInventory.repositories.map(({ name }) => name))).toHaveLength(30);
    expect(new Set(financeDeclarationInventory.operations.map(({ name }) => name))).toHaveLength(183);
  });

  it("rejects unknown fields on object boundaries", () => {
    expect(ownerQuerySchema.safeParse({ ownerId: "owner-1", credential: "secret" }).success).toBe(false);
    expect(moneySchema.safeParse({ amount: "1.00", currency: "USD", floatAmount: 1 }).success).toBe(false);
  });
});

describe("financial boundary conventions", () => {
  it.each(["0", "-0", "123456789012345678901234567890.123456789", "-42.50"])("accepts the decimal string %s", (amount) => {
    expect(moneySchema.parse({ amount, currency: "USD" })).toEqual({ amount, currency: "USD" });
  });

  it.each(["", "01", ".5", "1.", "1e3", "NaN", "Infinity", "+1"])("rejects the non-canonical decimal %s", (amount) => {
    expect(moneySchema.safeParse({ amount, currency: "USD" }).success).toBe(false);
  });

  it("requires decimal money and an explicit uppercase currency", () => {
    expect(moneySchema.safeParse({ amount: 12.5, currency: "USD" }).success).toBe(false);
    expect(moneySchema.safeParse({ amount: "12.5" }).success).toBe(false);
    expect(moneySchema.safeParse({ amount: "12.5", currency: "usd" }).success).toBe(false);
    expect(moneySchema.safeParse({ amount: "12.5", currency: "US" }).success).toBe(false);
  });

  it("validates real ISO dates and offset-bearing timestamps without losing nanoseconds", () => {
    expect(isoDateSchema.safeParse("2024-02-29").success).toBe(true);
    expect(isoDateSchema.safeParse("2023-02-29").success).toBe(false);
    expect(isoDateTimeSchema.safeParse("2026-01-15T12:00:00.123456789+05:30").success).toBe(true);
    expect(isoDateTimeSchema.safeParse("2026-01-15T12:00:00").success).toBe(false);
  });

  it("validates consecutive fiscal-year identifiers", () => {
    expect(fiscalYearIdSchema.safeParse("2026-27").success).toBe(true);
    expect(fiscalYearIdSchema.safeParse("2026-28").success).toBe(false);
    expect(fiscalYearIdSchema.safeParse("FY2026").success).toBe(false);
  });

  it("requires explicit rate period and compounding frequency", () => {
    const rate = { value: "8.5", representation: "human_percentage", period: "year", compoundingFrequency: "monthly" };
    expect(interestRateSchema.safeParse(rate).success).toBe(true);
    expect(interestRateSchema.safeParse({ ...rate, compoundingFrequency: undefined }).success).toBe(false);
    expect(interestRateSchema.safeParse({ ...rate, representation: "fraction" }).success).toBe(false);
  });

  it("requires contribution timing and versioned assumptions for periodic calculators", () => {
    const input = financeSchemaFixtures.SipInput?.();
    expect(sipInputSchema.safeParse(input).success).toBe(true);
    if (typeof input !== "object" || input === null) throw new Error("Expected SIP fixture object");
    const withoutTiming = Object.fromEntries(Object.entries(input).filter(([key]) => key !== "contributionTiming"));
    expect(sipInputSchema.safeParse(withoutTiming).success).toBe(false);
    expect(sipInputSchema.safeParse({ ...input, version: "" }).success).toBe(false);
  });

  it("orders ranges and entity timestamps exactly", () => {
    expect(createBudgetInputSchema.safeParse({ ownerId: "owner-1", name: "Plan", currency: "USD", period: "month", startsOn: "2026-02-01", endsOn: "2026-01-31" }).success).toBe(false);
    const asset = financeSchemaFixtures.Asset?.();
    if (typeof asset !== "object" || asset === null) throw new Error("Expected Asset fixture object");
    expect(financeSchemas.Asset.safeParse({ ...asset, createdAt: "2026-01-01T00:00:00.000000002Z", updatedAt: "2026-01-01T00:00:00.000000001Z" }).success).toBe(false);
  });

  it("requires at least one field for updates and bounds pagination", () => {
    expect(updateFinancialAccountInputSchema.safeParse({}).success).toBe(false);
    expect(updateFinancialAccountInputSchema.safeParse({ name: "Cash" }).success).toBe(true);
    expect(pageRequestSchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(pageRequestSchema.safeParse({ limit: 101 }).success).toBe(false);
    expect(pageRequestSchema.safeParse({ limit: 100 }).success).toBe(true);
  });

  it("validates generic page results with defensive readonly output", () => {
    const schema = pageResultSchema(moneySchema);
    const parsed = schema.parse({ items: [{ amount: "1.00", currency: "USD" }] });
    expect(parsed.items).toEqual([{ amount: "1.00", currency: "USD" }]);
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Object.isFrozen(parsed.items)).toBe(true);
  });
});

describe("credential and monetary surface audit", () => {
  const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");
  const declarationText = fs.readdirSync(sourceRoot, { recursive: true, encoding: "utf8" })
    .filter((entry) => entry.endsWith(".d.ts"))
    .map((entry) => fs.readFileSync(path.join(sourceRoot, entry), "utf8"))
    .join("\n");

  it("declares no credential, password, PIN, or OTP fields", () => {
    expect(declarationText).not.toMatch(/readonly\s+(?:bankCredentials|credentials|password|pin|otp)\b/i);
  });

  it("keeps the public money amount on the decimal-string boundary", () => {
    expect(declarationText).toMatch(/interface Money[\s\S]*readonly amount: MoneyAmount/);
    expect(declarationText).not.toMatch(/readonly\s+(?:amount|balance|principal|value):\s*number\b/);
  });
});
