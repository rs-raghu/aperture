import { describe, expect, it } from "vitest";
import { modelCases } from "./model-fixtures.js";

function without(value: Readonly<Record<string, unknown>>, keys: readonly string[]) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
}

describe.each(modelCases)("$name public model contract", (model) => {
  it("accepts every declared field without changing recorded values", () => {
    expect(model.schema.parse(model.full)).toEqual(model.full);
  });

  it("accepts the minimal declared shape", () => {
    const minimal = without(model.full, model.optional);
    // Partial updates need one supplied field; replacement-style updates retain required fields.
    if (model.update && Object.keys(minimal).length === 0) {
      const first = Object.entries(model.full)[0]!;
      minimal[first[0]] = first[1];
    }
    expect(model.schema.safeParse(minimal).success).toBe(true);
  });

  it.each([null, undefined, false, 1, "record", []])("rejects invalid record shape %j", (value) => {
    expect(model.schema.safeParse(value).success).toBe(false);
  });

  it("rejects unknown fields without stripping them", () => {
    const result = model.schema.safeParse({ ...model.full, undeclared: true });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.code === "unrecognized_keys")).toBe(true);
  });

  it.each(model.required)("requires declared field %s", (key) => {
    expect(model.schema.safeParse(without(model.full, [key])).success).toBe(false);
    expect(model.schema.safeParse({ ...model.full, [key]: undefined }).success).toBe(false);
  });

  it.each(Object.keys(model.full))("rejects null or the wrong primitive at %s", (key) => {
    expect(model.schema.safeParse({ ...model.full, [key]: null }).success).toBe(false);
    expect(model.schema.safeParse({ ...model.full, [key]: false }).success).toBe(false);
  });

  it.each(model.optional)("distinguishes omission from null at %s", (key) => {
    expect(model.schema.safeParse(without(model.full, [key])).success).toBe(true);
    expect(model.schema.safeParse({ ...model.full, [key]: null }).success).toBe(false);
  });

  it("does not mutate the input or share nested parsed objects", () => {
    const input = structuredClone(model.full);
    const result = model.schema.parse(input);
    expect(input).toEqual(model.full);
    expect(result).not.toBe(input);
    expect(Object.isFrozen(result)).toBe(true);
  });

  if (model.update) {
    it("requires a defined update", () => {
      expect(model.schema.safeParse({}).success).toBe(false);
      expect(model.schema.safeParse(Object.fromEntries(Object.keys(model.full).map((key) => [key, undefined]))).success).toBe(false);
    });
    it.each(["id", "ownerId", "createdAt", "updatedAt"])("rejects immutable metadata %s", (key) => {
      expect(model.schema.safeParse({ ...model.full, [key]: "synthetic-id-2" }).success).toBe(false);
    });
  }

  for (const [key, value] of Object.entries(model.full)) {
    if (key === "id" || key.endsWith("Id")) {
      it(`rejects malformed identifier at ${key}`, () => {
        for (const bad of ["", " ", "bad id", "bad/id", "id\n"]) {
          expect(model.schema.safeParse({ ...model.full, [key]: bad }).success).toBe(false);
        }
      });
    }
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      it(`rejects invalid or zone-free timestamp at ${key}`, () => {
        for (const bad of ["2040-02-30T12:00:00Z", "2040-02-29T12:00:00", "2040-02-29T24:00:00Z"]) {
          expect(model.schema.safeParse({ ...model.full, [key]: bad }).success).toBe(false);
        }
      });
    }
    if (typeof value === "object" && value !== null && "unit" in value) {
      it(`rejects unsupported units and quantities at ${key}`, () => {
        // Laboratory units are caller-defined strings in the Phase 2 contract.
        const invalidUnit = "kind" in value ? " " : "unsupported";
        expect(model.schema.safeParse({ ...model.full, [key]: { ...value, unit: invalidUnit } }).success).toBe(false);
        expect(model.schema.safeParse({ ...model.full, [key]: { ...value, value: "NaN" } }).success).toBe(false);
      });
    }
  }
});
