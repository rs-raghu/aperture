import { describe, expect, it } from "vitest";

import {
  EducationCalculationError,
  calculateAttendancePercentage,
  calculateCgpa,
  calculateDegreeProgress,
  calculateGpa,
  calculateRequiredScore,
  calculateWeightedGrade,
  projectCourseGrade,
} from "../src/index.js";

const COURSE_A = "10000000-0000-4000-8000-000000000001";
const COURSE_B = "10000000-0000-4000-8000-000000000002";
const COURSE_C = "10000000-0000-4000-8000-000000000003";
const SEMESTER_A = "20000000-0000-4000-8000-000000000001";
const SEMESTER_B = "20000000-0000-4000-8000-000000000002";
const RECORD_A = "30000000-0000-4000-8000-000000000001";

function expectCalculationError(action: () => unknown, path?: readonly (string | number)[]): void {
  try {
    action();
    throw new Error("Expected calculation to reject input.");
  } catch (error) {
    expect(error).toBeInstanceOf(EducationCalculationError);
    if (path !== undefined) expect((error as EducationCalculationError).issues.some((issue) => JSON.stringify(issue.path) === JSON.stringify(path))).toBe(true);
    expect(String((error as Error).message)).not.toContain("[object Object]");
  }
}

describe("calculateGpa", () => {
  it("calculates equal-credit GPA", () => {
    const result = calculateGpa({ courses: [{ courseId: COURSE_A, credits: "3", gradePoints: "4" }, { courseId: COURSE_B, credits: "3", gradePoints: "3" }], gradePointScale: "4" });
    expect(result).toMatchObject({ exactGpa: "3.5", roundedGpa: "3.50", totalIncludedCredits: "6", totalQualityPoints: "21" });
  });
  it("weights unequal credits and retains the repeating decimal", () => {
    const result = calculateGpa({ courses: [{ courseId: COURSE_A, credits: "4", gradePoints: "4" }, { courseId: COURSE_B, credits: "2", gradePoints: "3" }], gradePointScale: "4" });
    expect(result.exactGpa).toBe("3.6666666666666666667");
    expect(result.roundedGpa).toBe("3.67");
  });
  it("excludes explicitly excluded courses", () => {
    const result = calculateGpa({ courses: [{ courseId: COURSE_A, credits: "3", gradePoints: "4" }, { courseId: COURSE_B, credits: "3", gradePoints: "0", included: false }], gradePointScale: "4" });
    expect(result).toMatchObject({ exactGpa: "4", includedCourseCount: 1, excludedCourseCount: 1 });
  });
  it("rejects zero-credit included courses by default", () => expectCalculationError(() => calculateGpa({ courses: [{ courseId: COURSE_A, credits: "0", gradePoints: "4" }], gradePointScale: "4" }), ["courses", 0, "credits"]));
  it("can exclude zero-credit courses explicitly", () => {
    const result = calculateGpa({ courses: [{ courseId: COURSE_A, credits: "0", gradePoints: "4" }, { courseId: COURSE_B, credits: "3", gradePoints: "3" }], gradePointScale: "4", zeroCreditPolicy: "exclude" });
    expect(result).toMatchObject({ exactGpa: "3", includedCourseCount: 1, excludedCourseCount: 1 });
  });
  it("rejects empty and zero-effective inputs", () => {
    expectCalculationError(() => calculateGpa({ courses: [], gradePointScale: "4" }), ["courses"]);
    expectCalculationError(() => calculateGpa({ courses: [{ courseId: COURSE_A, credits: "0", gradePoints: "4" }], gradePointScale: "4", zeroCreditPolicy: "exclude" }), ["courses"]);
  });
  it("rejects grade points above the scale and malformed decimals", () => {
    expectCalculationError(() => calculateGpa({ courses: [{ courseId: COURSE_A, credits: "3", gradePoints: "4.1" }], gradePointScale: "4" }), ["courses", 0, "gradePoints"]);
    expectCalculationError(() => calculateGpa({ courses: [{ courseId: COURSE_A, credits: "3e0", gradePoints: "4" }], gradePointScale: "4" }), ["courses", 0, "credits"]);
  });
  it("supports four- and ten-point scales", () => {
    expect(calculateGpa({ courses: [{ courseId: COURSE_A, credits: "1", gradePoints: "4" }], gradePointScale: "4" }).exactGpa).toBe("4");
    expect(calculateGpa({ courses: [{ courseId: COURSE_A, credits: "1", gradePoints: "9.2" }], gradePointScale: "10" }).exactGpa).toBe("9.2");
  });
  it("uses explicit half-up rounding and does not mutate frozen input", () => {
    const courses = [Object.freeze({ courseId: COURSE_A, credits: "1", gradePoints: "3.125" })];
    Object.freeze(courses);
    const input = Object.freeze({ courses, gradePointScale: "4", rounding: Object.freeze({ decimalPlaces: 2, mode: "half-up" as const }) });
    expect(calculateGpa(input).roundedGpa).toBe("3.13");
    expect(input.courses[0]?.gradePoints).toBe("3.125");
  });
});

describe("calculateCgpa", () => {
  it("calculates equal-credit semesters", () => expect(calculateCgpa({ semesters: [{ semesterId: SEMESTER_A, gpa: "3", credits: "15" }, { semesterId: SEMESTER_B, gpa: "4", credits: "15" }], gradePointScale: "4" }).roundedCgpa).toBe("3.50"));
  it("weights unequal semester credits", () => {
    const result = calculateCgpa({ semesters: [{ semesterId: SEMESTER_A, gpa: "4", credits: "20" }, { semesterId: SEMESTER_B, gpa: "3", credits: "10" }], gradePointScale: "4" });
    expect(result).toMatchObject({ exactCgpa: "3.6666666666666666667", roundedCgpa: "3.67", totalWeightedGradePoints: "110" });
  });
  it("supports exclusions", () => expect(calculateCgpa({ semesters: [{ semesterId: SEMESTER_A, gpa: "4", credits: "10" }, { semesterId: SEMESTER_B, gpa: "0", credits: "10", included: false }], gradePointScale: "4" }).exactCgpa).toBe("4"));
  it("rejects empty effective input, GPA above scale, and zero credits", () => {
    expectCalculationError(() => calculateCgpa({ semesters: [], gradePointScale: "4" }), ["semesters"]);
    expectCalculationError(() => calculateCgpa({ semesters: [{ semesterId: SEMESTER_A, gpa: "4.1", credits: "1" }], gradePointScale: "4" }), ["semesters", 0, "gpa"]);
    expectCalculationError(() => calculateCgpa({ semesters: [{ semesterId: SEMESTER_A, gpa: "4", credits: "0" }], gradePointScale: "4" }), ["semesters"]);
  });
  it("rounds at a half-up boundary without mutating input", () => {
    const semesters = [Object.freeze({ semesterId: SEMESTER_A, gpa: "3.125", credits: "1" })];
    Object.freeze(semesters);
    const input = Object.freeze({ semesters, gradePointScale: "4" });
    expect(calculateCgpa(input).roundedCgpa).toBe("3.13");
    expect(input.semesters[0]?.gpa).toBe("3.125");
  });
});

describe("calculateWeightedGrade", () => {
  it("calculates a complete 100% weighting", () => {
    const result = calculateWeightedGrade({ components: [{ componentId: "midterm", scoreEarned: "80", maximumScore: "100", weightPercentage: "40" }, { componentId: "final", scoreEarned: "90", maximumScore: "100", weightPercentage: "60" }] });
    expect(result).toMatchObject({ totalIncludedWeight: "100", weightedPointsEarned: "86", exactCurrentGrade: "86", exactFinalCourseContribution: "86", warnings: [] });
  });
  it("distinguishes partial current grade from full-course contribution", () => {
    const result = calculateWeightedGrade({ components: [{ componentId: "midterm", scoreEarned: "80", maximumScore: "100", weightPercentage: "40" }] });
    expect(result).toMatchObject({ exactCurrentGrade: "80", exactFinalCourseContribution: "32", warnings: ["partial-weight"] });
  });
  it("handles unequal weights and exclusions", () => {
    const result = calculateWeightedGrade({ components: [{ componentId: "a", scoreEarned: "10", maximumScore: "10", weightPercentage: "25" }, { componentId: "b", scoreEarned: "50", maximumScore: "100", weightPercentage: "75" }, { componentId: "x", scoreEarned: "0", maximumScore: "1", weightPercentage: "100", included: false }] });
    expect(result).toMatchObject({ weightedPointsEarned: "62.5", excludedComponentCount: 1 });
  });
  it("rejects zero maximums, negatives, and total weight above 100", () => {
    expectCalculationError(() => calculateWeightedGrade({ components: [{ componentId: "a", scoreEarned: "1", maximumScore: "0", weightPercentage: "10" }] }), ["components", 0, "maximumScore"]);
    expectCalculationError(() => calculateWeightedGrade({ components: [{ componentId: "a", scoreEarned: "-1", maximumScore: "10", weightPercentage: "10" }] }), ["components", 0, "scoreEarned"]);
    expectCalculationError(() => calculateWeightedGrade({ components: [{ componentId: "a", scoreEarned: "1", maximumScore: "1", weightPercentage: "101" }] }), ["components"]);
  });
  it("rejects extra credit unless explicitly allowed", () => {
    expectCalculationError(() => calculateWeightedGrade({ components: [{ componentId: "a", scoreEarned: "11", maximumScore: "10", weightPercentage: "100" }] }), ["components", 0, "scoreEarned"]);
    expect(calculateWeightedGrade({ components: [{ componentId: "a", scoreEarned: "11", maximumScore: "10", weightPercentage: "100" }], allowExtraCredit: true }).warnings).toContain("extra-credit");
  });
  it("permits overweight totals only when explicit", () => expect(calculateWeightedGrade({ components: [{ componentId: "a", scoreEarned: "1", maximumScore: "1", weightPercentage: "101" }], allowTotalWeightAbove100: true }).warnings).toContain("weight-above-100"));
});

describe("projectCourseGrade", () => {
  const completed = [{ componentId: "midterm", scoreEarned: "80", maximumScore: "100", weightPercentage: "40" }];
  it("projects fully specified remaining work", () => {
    const result = projectCourseGrade({ completedComponents: completed, remainingComponents: [{ componentId: "final", weightPercentage: "60", expectedPercentage: "90" }] });
    expect(result).toMatchObject({ completedWeight: "40", remainingWeight: "60", weightedPointsAlreadyEarned: "32", expectedRemainingContribution: "54", exactProjectedFinalPercentage: "86", exactBestPossibleFinalPercentage: "92", exactLowestPossibleFinalPercentage: "32" });
  });
  it("supports a shared explicit expectation and partial total weight", () => {
    const result = projectCourseGrade({ completedComponents: completed, remainingComponents: [{ componentId: "quiz", weightPercentage: "20" }], defaultExpectedPercentage: "50" });
    expect(result).toMatchObject({ exactProjectedFinalPercentage: "42", warnings: ["partial-weight"] });
  });
  it("accepts exactly 100 and rejects above 100", () => {
    expect(projectCourseGrade({ completedComponents: completed, remainingComponents: [{ componentId: "final", weightPercentage: "60", expectedPercentage: "100" }] }).remainingWeight).toBe("60");
    expectCalculationError(() => projectCourseGrade({ completedComponents: completed, remainingComponents: [{ componentId: "final", weightPercentage: "61", expectedPercentage: "100" }] }), ["remainingComponents"]);
  });
  it("rejects overlapping component IDs and invalid expectations", () => {
    expectCalculationError(() => projectCourseGrade({ completedComponents: completed, remainingComponents: [{ componentId: "midterm", weightPercentage: "60", expectedPercentage: "90" }] }), ["remainingComponents", 0, "componentId"]);
    expectCalculationError(() => projectCourseGrade({ completedComponents: completed, remainingComponents: [{ componentId: "final", weightPercentage: "30", expectedPercentage: "90" }, { componentId: "final", weightPercentage: "30", expectedPercentage: "90" }] }), ["remainingComponents", 1, "componentId"]);
    expectCalculationError(() => projectCourseGrade({ completedComponents: completed, remainingComponents: [{ componentId: "final", weightPercentage: "60", expectedPercentage: "101" }] }), ["remainingComponents", 0, "expectedPercentage"]);
  });
  it("rejects missing expectations by default and reports explicit omissions", () => {
    expectCalculationError(() => projectCourseGrade({ completedComponents: completed, remainingComponents: [{ componentId: "final", weightPercentage: "60" }] }), ["remainingComponents", 0, "expectedPercentage"]);
    const result = projectCourseGrade({ completedComponents: completed, remainingComponents: [{ componentId: "final", weightPercentage: "60" }], missingExpectedScorePolicy: "exclude-from-projection" });
    expect(result).toMatchObject({ unresolvedRemainingWeight: "60", warnings: ["incomplete-projection-assumptions"] });
  });
});

describe("calculateRequiredScore", () => {
  it("returns an achievable required percentage and raw score", () => {
    const result = calculateRequiredScore({ weightedPointsEarned: "60", completedWeightPercentage: "75", remainingAssessmentWeightPercentage: "25", remainingAssessmentMaximumScore: "50", targetFinalPercentage: "80" });
    expect(result).toMatchObject({ exactRequiredAssessmentPercentage: "80", exactRequiredRawScore: "40", feasibility: "achievable" });
  });
  it("distinguishes an already achieved target from a zero requirement", () => expect(calculateRequiredScore({ weightedPointsEarned: "80", completedWeightPercentage: "80", remainingAssessmentWeightPercentage: "20", remainingAssessmentMaximumScore: "100", targetFinalPercentage: "75" })).toMatchObject({ exactRequiredAssessmentPercentage: "0", feasibility: "already-achieved", targetAlreadyAchieved: true }));
  it("reports exactly 100 required", () => expect(calculateRequiredScore({ weightedPointsEarned: "50", completedWeightPercentage: "80", remainingAssessmentWeightPercentage: "20", remainingAssessmentMaximumScore: "100", targetFinalPercentage: "70" }).feasibility).toBe("achievable"));
  it("does not cap impossible results", () => {
    const result = calculateRequiredScore({ weightedPointsEarned: "50", completedWeightPercentage: "80", remainingAssessmentWeightPercentage: "20", remainingAssessmentMaximumScore: "100", targetFinalPercentage: "75" });
    expect(result).toMatchObject({ exactRequiredAssessmentPercentage: "125", feasibility: "impossible" });
  });
  it("reports insufficient remaining weight and explicit extra-credit feasibility", () => {
    expect(calculateRequiredScore({ weightedPointsEarned: "50", completedWeightPercentage: "50", remainingAssessmentWeightPercentage: "20", remainingAssessmentMaximumScore: "100", targetFinalPercentage: "80" }).feasibility).toBe("insufficient-remaining-weight");
    expect(calculateRequiredScore({ weightedPointsEarned: "50", completedWeightPercentage: "80", remainingAssessmentWeightPercentage: "20", remainingAssessmentMaximumScore: "100", targetFinalPercentage: "75", allowExtraCredit: true }).feasibility).toBe("requires-extra-credit");
  });
  it("rejects zero remaining weight when needed and zero maximum score", () => {
    expectCalculationError(() => calculateRequiredScore({ weightedPointsEarned: "50", completedWeightPercentage: "50", remainingAssessmentWeightPercentage: "0", remainingAssessmentMaximumScore: "100", targetFinalPercentage: "60" }), ["remainingAssessmentWeightPercentage"]);
    expectCalculationError(() => calculateRequiredScore({ weightedPointsEarned: "50", completedWeightPercentage: "50", remainingAssessmentWeightPercentage: "50", remainingAssessmentMaximumScore: "0", targetFinalPercentage: "60" }), ["remainingAssessmentMaximumScore"]);
  });
  it("rounds half-up at a boundary", () => expect(calculateRequiredScore({ weightedPointsEarned: "0", completedWeightPercentage: "0", remainingAssessmentWeightPercentage: "80", remainingAssessmentMaximumScore: "100", targetFinalPercentage: "10.004", rounding: { decimalPlaces: 2, mode: "half-up" } }).roundedRequiredAssessmentPercentage).toBe("12.51"));
});

describe("calculateAttendancePercentage", () => {
  const record = (status: "present" | "absent" | "late" | "excused" | "cancelled", suffix: number) => ({ attendanceRecordId: `30000000-0000-4000-8000-${String(suffix).padStart(12, "0")}`, status });
  it("handles all present and mixed attendance", () => {
    expect(calculateAttendancePercentage({ records: [record("present", 1), record("present", 2)], excusedPolicy: "exclude" }).exactAttendancePercentage).toBe("100");
    expect(calculateAttendancePercentage({ records: [record("present", 1), record("absent", 2)], excusedPolicy: "exclude" }).exactAttendancePercentage).toBe("50");
  });
  it("counts late as attended and cancelled as ineligible", () => {
    const result = calculateAttendancePercentage({ records: [record("late", 1), record("cancelled", 2), record("absent", 3)], excusedPolicy: "exclude" });
    expect(result).toMatchObject({ eligibleSessions: 2, attendedSessions: 1, lateSessions: 1, cancelledSessions: 1, exactAttendancePercentage: "50" });
  });
  it("applies each explicit excused policy", () => {
    const records = [record("present", 1), record("excused", 2)];
    expect(calculateAttendancePercentage({ records, excusedPolicy: "include-as-attended" }).exactAttendancePercentage).toBe("100");
    expect(calculateAttendancePercentage({ records, excusedPolicy: "include-as-absent" }).exactAttendancePercentage).toBe("50");
    expect(calculateAttendancePercentage({ records, excusedPolicy: "exclude" }).exactAttendancePercentage).toBe("100");
  });
  it("rejects an empty effective denominator", () => expectCalculationError(() => calculateAttendancePercentage({ records: [{ attendanceRecordId: RECORD_A, status: "cancelled" }], excusedPolicy: "exclude" }), ["records"]));
  it("rounds repeating percentages with decimal arithmetic", () => expect(calculateAttendancePercentage({ records: [record("present", 1), record("absent", 2), record("absent", 3)], excusedPolicy: "exclude" }).roundedAttendancePercentage).toBe("33.33"));
});

describe("calculateDegreeProgress", () => {
  const base = { requiredCredits: "120", completedCredits: "0", inProgressCredits: "0", transferredCredits: "0", includeTransferredCredits: false };
  it("handles no, partial, and exact completion", () => {
    expect(calculateDegreeProgress(base)).toMatchObject({ exactProgressPercentage: "0", completionStatus: "not-started" });
    expect(calculateDegreeProgress({ ...base, completedCredits: "60" })).toMatchObject({ exactProgressPercentage: "50", remainingCredits: "60", completionStatus: "in-progress" });
    expect(calculateDegreeProgress({ ...base, completedCredits: "120" }).completionStatus).toBe("complete");
  });
  it("preserves raw excess progress and caps display only", () => expect(calculateDegreeProgress({ ...base, completedCredits: "130" })).toMatchObject({ exactProgressPercentage: "108.33333333333333333", displayCappedProgressPercentage: "100.00", remainingCredits: "0", excessCredits: "10", completionStatus: "exceeded" }));
  it("does not count in-progress credits", () => expect(calculateDegreeProgress({ ...base, completedCredits: "60", inProgressCredits: "30" }).exactProgressPercentage).toBe("50"));
  it("applies transfer credits only under the explicit policy", () => {
    expect(calculateDegreeProgress({ ...base, completedCredits: "50", transferredCredits: "10", includeTransferredCredits: true }).applicableCompletedCredits).toBe("60");
    expect(calculateDegreeProgress({ ...base, completedCredits: "50", transferredCredits: "10", includeTransferredCredits: false }).applicableCompletedCredits).toBe("50");
  });
  it("rejects invalid required and negative credits", () => {
    expectCalculationError(() => calculateDegreeProgress({ ...base, requiredCredits: "0" }), ["requiredCredits"]);
    expectCalculationError(() => calculateDegreeProgress({ ...base, completedCredits: "-1" }), ["completedCredits"]);
  });
  it("rounds a repeating decimal", () => expect(calculateDegreeProgress({ ...base, requiredCredits: "3", completedCredits: "1" }).roundedProgressPercentage).toBe("33.33"));
});

describe("public calculator entry point", () => {
  it("imports and executes all seven calculators", () => {
    expect(calculateGpa({ courses: [{ courseId: COURSE_A, credits: "1", gradePoints: "4" }], gradePointScale: "4" }).exactGpa).toBe("4");
    expect(calculateCgpa({ semesters: [{ semesterId: SEMESTER_A, gpa: "4", credits: "1" }], gradePointScale: "4" }).exactCgpa).toBe("4");
    expect(calculateWeightedGrade({ components: [{ componentId: "a", scoreEarned: "1", maximumScore: "1", weightPercentage: "100" }] }).exactCurrentGrade).toBe("100");
    expect(projectCourseGrade({ completedComponents: [], remainingComponents: [{ componentId: "a", weightPercentage: "100", expectedPercentage: "80" }] }).exactProjectedFinalPercentage).toBe("80");
    expect(calculateRequiredScore({ weightedPointsEarned: "0", completedWeightPercentage: "0", remainingAssessmentWeightPercentage: "100", remainingAssessmentMaximumScore: "100", targetFinalPercentage: "80" }).exactRequiredRawScore).toBe("80");
    expect(calculateAttendancePercentage({ records: [{ attendanceRecordId: RECORD_A, status: "present" }], excusedPolicy: "exclude" }).exactAttendancePercentage).toBe("100");
    expect(calculateDegreeProgress({ requiredCredits: "100", completedCredits: "50", inProgressCredits: "0", transferredCredits: "0", includeTransferredCredits: false }).exactProgressPercentage).toBe("50");
  });
});
