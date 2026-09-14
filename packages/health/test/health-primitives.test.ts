import { describe, expect, it } from "vitest";
import * as health from "@aperture/health";
import { enumCases, identifierCases } from "./primitive-fixtures.js";

describe.each(identifierCases)("$name identifier", ({ schema }) => {
  it.each(["synthetic-id-1", "11111111-1111-4111-8111-111111111111", "source:entry_1.2"])("preserves %s", (value) => {
    expect(schema.parse(value)).toBe(value);
  });
  it.each(["", " ", "bad id", "bad/id", "\nid", "id\n", "id\u0000", 1, null, {}, false])("rejects %j", (value) => {
    expect(schema.safeParse(value).success).toBe(false);
  });
});

describe.each(enumCases)("$name exact literals", ({ schema, values }) => {
  it.each(values)("accepts %s", (value) => expect(schema.parse(value)).toBe(value));
  it.each(["unsupported", "", " ", 1, null, {}, false])("rejects %j", (value) => {
    expect(schema.safeParse(value).success).toBe(false);
  });
  it("does not accept aliases, casing changes, or whitespace", () => {
    for (const value of values) {
      expect(schema.safeParse(value.toUpperCase()).success).toBe(false);
      expect(schema.safeParse(` ${value}`).success).toBe(false);
      expect(schema.safeParse(`${value} `).success).toBe(false);
    }
  });
});

const decimalQuantities = [
  { schema: health.weightValueSchema, units: ["kilogram", "pound"], zero: true, signed: false },
  { schema: health.heightValueSchema, units: ["centimeter", "inch"], zero: false, signed: false },
  { schema: health.distanceValueSchema, units: ["meter", "kilometer", "foot", "mile"], zero: true, signed: false },
  { schema: health.durationValueSchema, units: ["second", "minute", "hour"], zero: true, signed: false },
  { schema: health.paceValueSchema, units: ["seconds_per_kilometer", "seconds_per_mile"], zero: false, signed: false },
  { schema: health.speedValueSchema, units: ["kilometers_per_hour", "miles_per_hour", "meters_per_second"], zero: true, signed: false },
  { schema: health.temperatureValueSchema, units: ["celsius", "fahrenheit"], zero: true, signed: true },
  { schema: health.energyValueSchema, units: ["kilocalorie", "kilojoule"], zero: true, signed: false },
  { schema: health.hydrationVolumeValueSchema, units: ["milliliter", "liter", "fluid_ounce"], zero: true, signed: false },
  { schema: health.nutritionMassValueSchema, units: ["milligram", "gram", "ounce"], zero: true, signed: false },
  { schema: health.bloodGlucoseValueSchema, units: ["milligrams_per_deciliter", "millimoles_per_liter"], zero: true, signed: false },
  { schema: health.workoutLoadValueSchema, units: ["kilogram_repetition", "pound_repetition"], zero: true, signed: false },
  { schema: health.heartRateVariabilityValueSchema, units: ["millisecond"], zero: true, signed: false },
];

for (const { schema, units, zero, signed } of decimalQuantities) {
  describe(`${units[0]} quantity`, () => {
    it.each(units)("preserves precision and unit %s", (unit) => {
      const input = { value: "0.00000000000000000000100", unit };
      expect(schema.parse(input)).toEqual(input);
      expect(schema.safeParse({ value: "9".repeat(400), unit }).success).toBe(true);
    });
    it("enforces sign and zero semantics", () => {
      expect(schema.safeParse({ value: "0", unit: units[0] }).success).toBe(zero);
      expect(schema.safeParse({ value: "0.000", unit: units[0] }).success).toBe(zero);
      expect(schema.safeParse({ value: "-0.001", unit: units[0] }).success).toBe(signed);
    });
    it.each([NaN, Infinity, -Infinity, 1, "NaN", "Infinity", "-Infinity", "1e3", "01", ".5", "1.", "1,000", "+1", " 1", "1 ", ""])("rejects invalid decimal %j", (value) => {
      expect(schema.safeParse({ value, unit: units[0] }).success).toBe(false);
    });
  });
}

describe.each([
  { name: "percentage", schema: health.percentageValueSchema },
  { name: "oxygen saturation", schema: health.oxygenSaturationValueSchema },
])("$name mathematical bounds", ({ schema }) => {
  it.each(["0", "0.00", "0.000000000001", "99.999999999999999999", "100", "100.000"])("accepts %s", (value) => {
    expect(schema.parse({ value, unit: "percent" })).toEqual({ value, unit: "percent" });
  });
  it.each(["-0.000000000000001", "100.000000000000000001", "101", "1000", "NaN", "Infinity", NaN, Infinity, -Infinity])("rejects %j", (value) => {
    expect(schema.safeParse({ value, unit: "percent" }).success).toBe(false);
  });
});

describe("numeric quantities and declared scales", () => {
  it.each([0, 1, Number.MAX_SAFE_INTEGER])("accepts integer repetitions %s", (value) => {
    expect(health.repetitionCountSchema.parse({ value, unit: "repetition" }).value).toBe(value);
  });
  it.each([-1, 0.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects repetition count %s", (value) => {
    expect(health.repetitionCountSchema.safeParse({ value, unit: "repetition" }).success).toBe(false);
  });
  it("allows structurally unusual observations without clinical ranges", () => {
    expect(health.heartRateValueSchema.parse({ value: 10000.5, unit: "beats_per_minute" }).value).toBe(10000.5);
    expect(health.bloodPressureValueSchema.safeParse({ systolic: 1, diastolic: 9000, unit: "millimeters_of_mercury" }).success).toBe(true);
  });
  it.each([-1, NaN, Infinity, -Infinity])("rejects nonfinite or negative numeric observations %s", (value) => {
    expect(health.heartRateValueSchema.safeParse({ value, unit: "beats_per_minute" }).success).toBe(false);
    for (const key of ["systolic", "diastolic"]) {
      expect(health.bloodPressureValueSchema.safeParse({ systolic: 0, diastolic: 0, unit: "millimeters_of_mercury", [key]: value }).success).toBe(false);
    }
  });
  it("requires both pressure values and the unit", () => {
    for (const input of [{ systolic: 1, unit: "millimeters_of_mercury" }, { diastolic: 1, unit: "millimeters_of_mercury" }, { systolic: 1, diastolic: 1 }]) {
      expect(health.bloodPressureValueSchema.safeParse(input).success).toBe(false);
    }
  });
  for (const schema of [health.perceivedEffortSchema, health.recoveryRatingSchema]) {
    it("validates a one-to-ten recorded scale, allowing fractional ratings", () => {
      for (const value of [1, 1.5, 10]) expect(schema.safeParse({ value, scale: "one_to_ten" }).success).toBe(true);
      for (const value of [0, 10.0001, NaN, Infinity, -Infinity]) expect(schema.safeParse({ value, scale: "one_to_ten" }).success).toBe(false);
    });
  }
  it("validates the declared zero-to-ten symptom scale", () => {
    for (const value of [0, 0.5, 10]) expect(health.symptomSeveritySchema.safeParse({ value, scale: "zero_to_ten" }).success).toBe(true);
    for (const value of [-0.01, 10.01, NaN, Infinity, -Infinity]) expect(health.symptomSeveritySchema.safeParse({ value, scale: "zero_to_ten" }).success).toBe(false);
  });
});
