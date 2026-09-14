import { describe, expect, it } from "vitest";

import {
  HealthCalculationError,
  calculateBmi,
  calculateBmr,
  calculateHeartRateZones,
  calculateHydrationSummary,
  calculateRecoverySummary,
  calculateRunningPace,
  calculateRunningSummary,
  calculateSleepSummary,
  calculateTdee,
  calculateWorkoutVolume,
  estimateOneRepMax,
} from "../src/index.js";
import * as calculations from "@aperture/health/calculations";

function expectCalculationError(action: () => unknown, path?: readonly (string | number)[]): void {
  try {
    action();
    throw new Error("Expected calculation to reject input.");
  } catch (error) {
    expect(error).toBeInstanceOf(HealthCalculationError);
    if (path !== undefined) {
      expect((error as HealthCalculationError).issues.some((issue) =>
        JSON.stringify(issue.path) === JSON.stringify(path))).toBe(true);
    }
  }
}

describe("body and energy calculations", () => {
  it("calculates metric and imperial BMI with deterministic decimal output", () => {
    expect(calculateBmi({
      weight: { value: "70", unit: "kilogram" },
      height: { value: "175", unit: "centimeter" },
    })).toEqual({ value: "22.857142857143", unit: "kilograms_per_square_meter", isEstimate: false });
    expect(calculateBmi({
      weight: { value: "154.3235835294", unit: "pound" },
      height: { value: "68.8976377953", unit: "inch" },
    }).value).toBe("22.857142857125");
  });

  it("uses the Mifflin-St Jeor constants and discloses estimates", () => {
    const base = {
      weight: { value: "70", unit: "kilogram" as const },
      height: { value: "175", unit: "centimeter" as const },
      age: { value: 30, unit: "year" as const },
    };
    expect(calculateBmr({ ...base, sex: "male" }).energy.value).toBe("1648.75");
    expect(calculateBmr({ ...base, sex: "female" }).energy.value).toBe("1482.75");
    expect(calculateBmr({ ...base, sex: "unspecified" })).toMatchObject({
      energy: { value: "1565.75", unit: "kilocalorie" }, period: "day", isEstimate: true,
    });
  });

  it("calculates TDEE in the supplied energy unit", () => {
    expect(calculateTdee({
      basalEnergy: { value: "1600", unit: "kilocalorie" },
      basalEnergyPeriod: "day",
      activityFactor: { value: "1.55", unit: "ratio" },
    })).toEqual({ energy: { value: "2480", unit: "kilocalorie" }, period: "day", isEstimate: true });
  });
});

describe("training calculations", () => {
  it("calculates percentage and heart-rate-reserve zones", () => {
    const boundaries = ["50", "60", "70"].map((value) => ({ value, unit: "percent" as const }));
    expect(calculateHeartRateZones({
      maximumHeartRate: { value: 200, unit: "beats_per_minute" }, zoneBoundaries: boundaries,
    }).zones).toEqual([
      { zone: "zone_1", lowerBound: { value: 100, unit: "beats_per_minute" }, upperBound: { value: 120, unit: "beats_per_minute" } },
      { zone: "zone_2", lowerBound: { value: 120, unit: "beats_per_minute" }, upperBound: { value: 140, unit: "beats_per_minute" } },
    ]);
    expect(calculateHeartRateZones({
      restingHeartRate: { value: 60, unit: "beats_per_minute" },
      maximumHeartRate: { value: 200, unit: "beats_per_minute" },
      zoneBoundaries: boundaries,
    }).zones[0]).toMatchObject({ lowerBound: { value: 130 }, upperBound: { value: 144 } });
  });

  it("rejects unordered boundaries and an invalid heart-rate reserve", () => {
    expectCalculationError(() => calculateHeartRateZones({
      maximumHeartRate: { value: 200, unit: "beats_per_minute" },
      zoneBoundaries: ["60", "50"].map((value) => ({ value, unit: "percent" as const })),
    }), ["zoneBoundaries", 1]);
    expectCalculationError(() => calculateHeartRateZones({
      restingHeartRate: { value: 200, unit: "beats_per_minute" },
      maximumHeartRate: { value: 180, unit: "beats_per_minute" },
      zoneBoundaries: ["50", "60"].map((value) => ({ value, unit: "percent" as const })),
    }), ["maximumHeartRate"]);
  });

  it("uses the Epley one-repetition maximum estimate", () => {
    expect(estimateOneRepMax({
      weight: { value: "100", unit: "kilogram" },
      repetitions: { value: 10, unit: "repetition" },
    })).toEqual({ estimatedWeight: { value: "133.333333333333", unit: "kilogram" }, isEstimate: true });
    expect(estimateOneRepMax({
      weight: { value: "100", unit: "pound" },
      repetitions: { value: 1, unit: "repetition" },
    }).estimatedWeight.value).toBe("100");
    expectCalculationError(() => estimateOneRepMax({
      weight: { value: "100", unit: "kilogram" },
      repetitions: { value: 0, unit: "repetition" },
    }), ["repetitions", "value"]);
  });

  it("sums workout load after exact weight conversion", () => {
    expect(calculateWorkoutVolume({ sets: [
      { repetitions: { value: 3, unit: "repetition" }, weight: { value: "100", unit: "pound" } },
      { repetitions: { value: 5, unit: "repetition" }, weight: { value: "45.359237", unit: "kilogram" } },
    ] })).toEqual({ load: { value: "800", unit: "pound_repetition" }, isEstimate: false });
  });
});

describe("running, sleep, hydration, and recovery summaries", () => {
  it("normalizes hydration volume and supports an empty exact total", () => {
    expect(calculateHydrationSummary({
      volumes: [
        { value: "1", unit: "liter" },
        { value: "8", unit: "fluid_ounce" },
        { value: "250", unit: "milliliter" },
      ],
      outputUnit: "milliliter",
    })).toEqual({ entryCount: 3, totalVolume: { value: "1486.5882365", unit: "milliliter" }, isEstimate: false });
    expect(calculateHydrationSummary({ volumes: [], outputUnit: "liter" }).totalVolume.value).toBe("0");
  });

  it("calculates pace across metric and imperial output units", () => {
    const input = {
      distance: { value: "5", unit: "kilometer" as const },
      duration: { value: "25", unit: "minute" as const },
    };
    expect(calculateRunningPace({ ...input, outputUnit: "seconds_per_kilometer" }).pace.value).toBe("300");
    expect(calculateRunningPace({ ...input, outputUnit: "seconds_per_mile" }).pace.value).toBe("482.8032");
  });

  it("rejects zero running distance and duration", () => {
    expectCalculationError(() => calculateRunningPace({
      distance: { value: "0", unit: "kilometer" },
      duration: { value: "20", unit: "minute" },
      outputUnit: "seconds_per_kilometer",
    }), ["distance", "value"]);
    expectCalculationError(() => calculateRunningPace({
      distance: { value: "5", unit: "kilometer" },
      duration: { value: "0", unit: "minute" },
      outputUnit: "seconds_per_kilometer",
    }), ["duration", "value"]);
  });

  it("aggregates mixed-unit runs and omits pace for an empty summary", () => {
    const result = calculateRunningSummary({
      activities: [
        { distance: { value: "5", unit: "kilometer" }, duration: { value: "25", unit: "minute" } },
        { distance: { value: "1", unit: "mile" }, duration: { value: "8", unit: "minute" } },
      ],
      outputDistanceUnit: "kilometer",
    });
    expect(result).toMatchObject({
      activityCount: 2,
      totalDistance: { value: "6.609344", unit: "kilometer" },
      totalDuration: { value: "1980", unit: "second" },
      isEstimate: false,
    });
    expect(result.averagePace?.value).toBe("299.57587318802");
    expect(calculateRunningSummary({ activities: [], outputDistanceUnit: "mile" })).not.toHaveProperty("averagePace");
  });

  it("aggregates sleep durations in the requested unit", () => {
    expect(calculateSleepSummary({
      durations: [{ value: "7", unit: "hour" }, { value: "30", unit: "minute" }],
      outputUnit: "minute",
    })).toEqual({
      recordCount: 2,
      totalDuration: { value: "450", unit: "minute" },
      averageDuration: { value: "225", unit: "minute" },
      isEstimate: false,
    });
    expect(calculateSleepSummary({ durations: [], outputUnit: "hour" })).not.toHaveProperty("averageDuration");
  });

  it("averages each recovery rating over the entries that define it", () => {
    expect(calculateRecoverySummary({ entries: [
      { energy: { value: 8, scale: "one_to_ten" }, mood: { value: 6, scale: "one_to_ten" } },
      { energy: { value: 4, scale: "one_to_ten" }, soreness: { value: 7, scale: "one_to_ten" } },
      { soreness: { value: 5, scale: "one_to_ten" } },
    ] })).toEqual({
      entryCount: 3,
      averageEnergy: "6",
      averageSoreness: "6",
      averageMood: "6",
      ratingScale: "one_to_ten",
      isEstimate: true,
    });
  });
});

describe("calculation boundaries", () => {
  it("exposes all implemented functions from the focused runtime entry point", () => {
    expect(Object.keys(calculations)).toEqual(expect.arrayContaining([
      "calculateBmi",
      "calculateBmr",
      "calculateHeartRateZones",
      "calculateHydrationSummary",
      "estimateOneRepMax",
      "calculateRecoverySummary",
      "calculateRunningPace",
      "calculateRunningSummary",
      "calculateSleepSummary",
      "calculateTdee",
      "calculateWorkoutVolume",
    ]));
    expect(calculations.calculateBmi({
      weight: { value: "0", unit: "kilogram" },
      height: { value: "1", unit: "centimeter" },
    }).value).toBe("0");
  });

  it("rejects malformed decimals, unknown fields, and invalid activity factors", () => {
    expectCalculationError(() => calculateBmi({
      weight: { value: "7e1", unit: "kilogram" },
      height: { value: "175", unit: "centimeter" },
    }));
    expectCalculationError(() => calculateBmi({
      weight: { value: "70", unit: "kilogram" },
      height: { value: "175", unit: "centimeter" },
      unexpected: true,
    } as never));
    expectCalculationError(() => calculateTdee({
      basalEnergy: { value: "1600", unit: "kilocalorie" },
      basalEnergyPeriod: "day",
      activityFactor: { value: "0", unit: "ratio" },
    }));
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expectCalculationError(() => calculateHeartRateZones({
        maximumHeartRate: { value, unit: "beats_per_minute" },
        zoneBoundaries: ["50", "60"].map((boundary) => ({ value: boundary, unit: "percent" as const })),
      }));
    }
  });

  it("preserves values through equivalent unit conversions", () => {
    expect(calculateHydrationSummary({
      volumes: [{ value: "29.5735295625", unit: "milliliter" }],
      outputUnit: "fluid_ounce",
    }).totalVolume.value).toBe("1");
    expect(calculateSleepSummary({
      durations: [{ value: "3600", unit: "second" }],
      outputUnit: "hour",
    }).totalDuration.value).toBe("1");
  });

  it("does not mutate frozen inputs", () => {
    const distance = Object.freeze({ value: "5", unit: "kilometer" as const });
    const duration = Object.freeze({ value: "25", unit: "minute" as const });
    const input = Object.freeze({ distance, duration, outputUnit: "seconds_per_kilometer" as const });
    expect(calculateRunningPace(input).pace.value).toBe("300");
    expect(input.distance.value).toBe("5");
  });
});
