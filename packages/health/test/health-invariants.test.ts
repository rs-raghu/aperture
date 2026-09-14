import { describe, expect, it } from "vitest";
import * as health from "@aperture/health";
import { normalizeValidationError, validateInput, z } from "@aperture/validation";
import { modelCases } from "./model-fixtures.js";

describe("calendar and absolute timestamps", () => {
  it.each(["2040-02-29", "2000-02-29", "0099-01-01", "0000-02-29", "9999-12-31"])("accepts calendar date %s without consulting now", (value) => {
    expect(health.isoDateSchema.parse(value)).toBe(value);
  });
  it.each(["2026-02-29", "1900-02-29", "2040-02-30", "2040-04-31", "2040-00-01", "2040-13-01", "2040-01-00", "2040-1-1", "01/02/2040", "2040-01-01T00:00:00Z"])("rejects invalid date %s", (value) => {
    expect(health.isoDateSchema.safeParse(value).success).toBe(false);
  });
  it.each(["2040-02-29T23:59:59Z", "2040-02-29T12:00:00+05:30", "2040-02-29T12:00:00-07:00", "2040-02-29T12:00:00.123456789Z"])("preserves timestamp %s", (value) => {
    expect(health.isoDateTimeSchema.parse(value)).toBe(value);
  });
  it.each(["2040-02-29", "2040-02-29T12:00:00", "2040-02-29T24:00:00Z", "2040-02-29T12:60:00Z", "2040-02-29T12:00:60Z", "2040-02-29T12:00:00+24:00", "2040-02-29T12:00:00+05:60", "2040-02-29T12:00:00.1234567890Z", "2040-02-30T12:00:00Z", "2040-02-29T12:00:00Z "])("rejects timestamp %s", (value) => {
    expect(health.isoDateTimeSchema.safeParse(value).success).toBe(false);
  });
  it("orders offsets as instants, not lexicographic local times", () => {
    expect(health.dateRangeSchema.safeParse({ startsAt: "2040-01-01T12:00:00+05:30", endsAt: "2040-01-01T07:00:00Z" }).success).toBe(true);
    expect(health.dateRangeSchema.safeParse({ startsAt: "2040-01-01T07:00:00Z", endsAt: "2040-01-01T12:00:00+05:30" }).success).toBe(false);
    expect(health.dateRangeSchema.safeParse({ startsAt: "2040-01-01T12:00:00+05:30", endsAt: "2040-01-01T06:30:00Z" }).success).toBe(true);
  });
  it("compares fractional seconds exactly through nine digits", () => {
    const startsAt = "2040-01-01T00:00:00.000000002Z";
    expect(health.dateRangeSchema.safeParse({ startsAt, endsAt: "2040-01-01T00:00:00.000000001Z" }).success).toBe(false);
    expect(health.dateRangeSchema.safeParse({ startsAt, endsAt: "2040-01-01T00:00:00.000000003Z" }).success).toBe(true);
    expect(health.dateRangeSchema.safeParse({ startsAt: "2040-01-01T00:00:00.1Z", endsAt: "2040-01-01T00:00:00.100000000Z" }).success).toBe(true);
  });
});

for (const model of modelCases) {
  for (const [start, end, dateOnly] of [
    ["startsAt", "endsAt", false], ["startedAt", "endedAt", false],
    ["startsOn", "endsOn", true], ["startedOn", "endedOn", true],
    ["createdAt", "updatedAt", false],
  ] as const) {
    if (!(start in model.full) || !(end in model.full)) continue;
    it(`${model.name} enforces ${start}/${end} ordering`, () => {
      const first = dateOnly ? "2040-01-01" : "2040-01-01T00:00:00Z";
      const last = dateOnly ? "2040-01-02" : "2040-01-02T00:00:00Z";
      expect(model.schema.safeParse({ ...model.full, [start]: first, [end]: first }).success).toBe(true);
      expect(model.schema.safeParse({ ...model.full, [start]: first, [end]: last }).success).toBe(true);
      const result = model.schema.safeParse({ ...model.full, [start]: last, [end]: first });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === end && issue.code === "custom")).toBe(true);
    });
  }
  if (model.optional.includes("limit")) {
    it(`${model.name} validates pagination boundaries`, () => {
      for (const limit of [1, 100]) expect(model.schema.safeParse({ ...model.full, limit }).success).toBe(true);
      for (const limit of [0, -1, 1.5, 101, NaN, Infinity, -Infinity]) expect(model.schema.safeParse({ ...model.full, limit }).success).toBe(false);
      expect(model.schema.safeParse({ ...model.full, cursor: " " }).success).toBe(false);
    });
  }
  if ("sequence" in model.full || "useCount" in model.full) {
    const key = "sequence" in model.full ? "sequence" : "useCount";
    it(`${model.name} requires a safe non-negative integer ${key}`, () => {
      expect(model.schema.safeParse({ ...model.full, [key]: 0 }).success).toBe(true);
      for (const value of [-1, 0.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1]) {
        expect(model.schema.safeParse({ ...model.full, [key]: value }).success).toBe(false);
      }
    });
  }
}

describe("Health-specific structural invariants", () => {
  it.each([
    ["weight", "kilogram"], ["weight", "pound"], ["height", "centimeter"], ["height", "inch"],
    ["waist", "meter"], ["hip", "mile"],
  ])("pairs %s with %s", (type, unit) => {
    expect(health.recordHealthMeasurementInputSchema.safeParse({ ownerId: "owner-1", observedAt: "2040-01-01T00:00:00Z", type, measurement: { value: "1", unit } }).success).toBe(true);
  });
  it("rejects mismatched measurement type and unit on both stored and create boundaries", () => {
    for (const name of ["HealthMeasurement", "RecordHealthMeasurementInput"]) {
      const model = modelCases.find((entry) => entry.name === name)!;
      for (const type of ["height", "waist", "hip"]) expect(model.schema.safeParse({ ...model.full, type, measurement: { value: "1", unit: "kilogram" } }).success).toBe(false);
    }
  });
  it("preserves declared update relationship restrictions", () => {
    const restrictions = [
      [health.updateExerciseSetInputSchema, { sequence: 1 }, ["exerciseId", "workoutSessionId"]],
      [health.updateRunningSplitInputSchema, { sequence: 1 }, ["runningActivityId"]],
      [health.updateMedicationLogInputSchema, { recordedAt: "2040-01-01T00:00:00Z" }, ["medicationId", "status"]],
      [health.updatePersonalRecordInputSchema, { title: "Synthetic" }, ["exerciseId", "runningActivityId"]],
      [health.updateHealthMeasurementInputSchema, { observedAt: "2040-01-01T00:00:00Z" }, ["type"]],
      [health.updateRunningActivityInputSchema, { title: "Synthetic" }, ["workoutSessionId", "status"]],
      [health.updateWorkoutSessionInputSchema, { title: "Synthetic" }, ["status", "startedAt", "endedAt"]],
    ] as const;
    for (const [schema, valid, keys] of restrictions) {
      expect(schema.safeParse(valid).success).toBe(true);
      for (const key of keys) expect(schema.safeParse({ ...valid, [key]: "synthetic-id-2" }).success).toBe(false);
    }
    expect(health.updateWorkoutSessionInputSchema.safeParse({ workoutPlanId: "plan-2" }).success).toBe(true);
    expect(health.updateRunningActivityInputSchema.safeParse({ routeId: "route-2", equipmentIds: ["equipment-2"] }).success).toBe(true);
  });
  it("keeps the required observedAt on body-composition updates", () => {
    expect(health.updateBodyCompositionInputSchema.safeParse({ weight: { value: "1", unit: "kilogram" } }).success).toBe(false);
    expect(health.updateBodyCompositionInputSchema.safeParse({ observedAt: "2040-01-01T00:00:00Z" }).success).toBe(true);
  });
  it("checks supplied update fields without merging stored records", () => {
    expect(health.updateSleepInputSchema.safeParse({ endedAt: "2040-01-01T00:00:00Z" }).success).toBe(true);
    expect(health.updateHealthMeasurementInputSchema.safeParse({ measurement: { value: "1", unit: "inch" } }).success).toBe(true);
  });
  it("validates equipment ID arrays element-by-element", () => {
    expect(health.updateRunningActivityInputSchema.safeParse({ equipmentIds: [] }).success).toBe(true);
    const result = health.updateRunningActivityInputSchema.safeParse({ equipmentIds: ["equipment-1", "bad id"] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(["equipmentIds", 1]);
  });
});

describe("discriminated values", () => {
  const vitalCases = [
    { type: "resting_heart_rate", value: { value: 1, unit: "beats_per_minute" } },
    { type: "blood_pressure", value: { systolic: 0, diastolic: 1, unit: "millimeters_of_mercury" } },
    { type: "blood_glucose", value: { value: "1", unit: "milligrams_per_deciliter" } },
    { type: "oxygen_saturation", value: { value: "100", unit: "percent" } },
    { type: "body_temperature", value: { value: "-1", unit: "fahrenheit" } },
  ];
  it.each(vitalCases)("preserves $type and rejects foreign units", (input) => {
    expect(health.vitalReadingValueSchema.parse(input)).toEqual(input);
    expect(health.vitalReadingValueSchema.safeParse({ ...input, value: { ...input.value, unit: "unsupported" } }).success).toBe(false);
    expect(health.recordVitalReadingInputSchema.safeParse({ ownerId: "owner-1", reading: input, observedAt: "2040-01-01T00:00:00Z" }).success).toBe(true);
  });
  it.each([
    { type: "distance", value: { value: "1", unit: "mile" } },
    { type: "duration", value: { value: "0", unit: "second" } },
    { type: "pace", value: { value: "1", unit: "seconds_per_mile" } },
    { type: "repetitions", value: { value: 0, unit: "repetition" } },
    { type: "weight", value: { value: "0", unit: "pound" } },
  ])("preserves personal record $type", (input) => {
    expect(health.personalRecordMetricSchema.parse(input)).toEqual(input);
    expect(health.personalRecordMetricSchema.safeParse({ ...input, value: { ...input.value, unit: "unsupported" } }).success).toBe(false);
  });
  it("supports uninterpreted numeric and text laboratory values", () => {
    expect(health.laboratoryResultValueSchema.parse({ kind: "numeric", value: "-0.00100", unit: "laboratory-specific-unit" })).toEqual({ kind: "numeric", value: "-0.00100", unit: "laboratory-specific-unit" });
    expect(health.laboratoryResultValueSchema.safeParse({ kind: "text", value: "Synthetic result" }).success).toBe(true);
    expect(health.laboratoryResultValueSchema.safeParse({ kind: "text", value: "Synthetic result", unit: "mg" }).success).toBe(false);
    expect(health.laboratoryResultValueSchema.safeParse({ kind: "numeric", value: "1", unit: " " }).success).toBe(false);
  });
  it.each(["vitalReadingValueSchema", "personalRecordMetricSchema", "laboratoryResultValueSchema"] as const)("rejects unknown or missing discriminants on %s", (key) => {
    expect(health[key].safeParse({ value: "1" }).success).toBe(false);
    expect(health[key].safeParse({ type: "unsupported", kind: "unsupported", value: "1" }).success).toBe(false);
  });
});

describe("shared structured validation errors", () => {
  it("safe parsing never throws for ordinary invalid values across all public models", () => {
    for (const { schema } of modelCases) for (const input of [null, undefined, false, 1, "", {}, [], { value: NaN }]) {
      expect(() => validateInput(schema, input)).not.toThrow();
    }
  });
  it("parsing throws ZodError and shared normalization preserves stable paths and codes", () => {
    const input = { ownerId: "bad id", volume: { value: "NaN", unit: "unsupported" }, consumedAt: "yesterday" };
    expect(() => health.recordHydrationInputSchema.parse(input)).toThrow(z.ZodError);
    const first = validateInput(health.recordHydrationInputSchema, input);
    expect(first).toEqual(validateInput(health.recordHydrationInputSchema, input));
    expect(first.success).toBe(false);
    if (first.success) return;
    expect(first.issues.map(({ path, code }) => ({ path, code }))).toEqual([
      { path: ["ownerId"], code: "invalid_string" },
      { path: ["volume", "value"], code: "invalid_string" },
      { path: ["volume", "unit"], code: "invalid_enum_value" },
      { path: ["consumedAt"], code: "custom" },
    ]);
    const parsed = health.recordHydrationInputSchema.safeParse(input);
    if (parsed.success) return;
    const normalized = normalizeValidationError(parsed.error);
    expect(Object.keys(normalized)).toEqual(["name", "message", "issues"]);
    expect(normalized.issues).toEqual(first.issues);
    expect(normalized.message).not.toMatch(/\[object Object\]|dangerous|unhealthy|hypertension|diagnosis|treatment/i);
    expect(JSON.stringify(normalized)).not.toContain('"stack"');
  });
  it("validates generic page contents through the public factory", () => {
    const schema = health.pageResultSchema(health.hydrationEntrySchema);
    expect(schema.parse({ items: [] })).toEqual({ items: [] });
    const full = modelCases.find((model) => model.name === "HydrationEntry")!.full;
    expect(schema.safeParse({ items: [full], nextCursor: "cursor-1" }).success).toBe(true);
    expect(schema.safeParse({ items: [null] }).success).toBe(false);
    expect(schema.safeParse({ items: [], nextCursor: " " }).success).toBe(false);
    expect(schema.safeParse({ items: [], extra: true }).success).toBe(false);
  });
});
