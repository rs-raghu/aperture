import { Decimal } from "decimal.js";
import { z } from "@aperture/validation";

import { attendanceRecordIdSchema, attendanceStatusSchema } from "../attendance/attendance.types.js";
import { calculationDecimalSchema } from "./calculation.schemas.js";
import { optionalRoundingOptionsSchema, resolveRoundingOptions } from "./calculation.types.js";
import { calculationIssue, parseCalculationInput, roundedDecimal, roundingMetadata } from "./decimal.helpers.js";

export const excusedAttendancePolicies = ["include-as-attended", "include-as-absent", "exclude"] as const;
export const excusedAttendancePolicySchema = z.enum(excusedAttendancePolicies);
export type ExcusedAttendancePolicy = z.infer<typeof excusedAttendancePolicySchema>;

export const attendanceCalculationRecordSchema = z.strictObject({
  attendanceRecordId: attendanceRecordIdSchema,
  status: attendanceStatusSchema,
});
export type AttendanceCalculationRecord = z.input<typeof attendanceCalculationRecordSchema>;

export const attendancePercentageCalculationInputSchema = z.strictObject({
  records: z.array(attendanceCalculationRecordSchema).min(1),
  excusedPolicy: excusedAttendancePolicySchema,
  rounding: optionalRoundingOptionsSchema,
});
export type AttendancePercentageCalculationInput = z.input<typeof attendancePercentageCalculationInputSchema>;

export interface AttendancePercentageCalculationResult {
  readonly totalRecords: number;
  readonly eligibleSessions: number;
  readonly attendedSessions: number;
  readonly absentSessions: number;
  readonly lateSessions: number;
  readonly excusedSessions: number;
  readonly cancelledSessions: number;
  readonly exactAttendancePercentage: string;
  readonly roundedAttendancePercentage: string;
  readonly excusedPolicy: ExcusedAttendancePolicy;
  readonly rounding: ReturnType<typeof roundingMetadata>;
}

export const attendancePercentageCalculationResultSchema = z.strictObject({
  totalRecords: z.number().int().nonnegative(),
  eligibleSessions: z.number().int().positive(),
  attendedSessions: z.number().int().nonnegative(),
  absentSessions: z.number().int().nonnegative(),
  lateSessions: z.number().int().nonnegative(),
  excusedSessions: z.number().int().nonnegative(),
  cancelledSessions: z.number().int().nonnegative(),
  exactAttendancePercentage: calculationDecimalSchema,
  roundedAttendancePercentage: calculationDecimalSchema,
  excusedPolicy: excusedAttendancePolicySchema,
  rounding: z.strictObject({ decimalPlaces: z.number().int().min(0).max(12), mode: z.enum(["half-up", "half-even", "down", "up"]) }),
});

export function calculateAttendancePercentage(input: AttendancePercentageCalculationInput): AttendancePercentageCalculationResult {
  const parsed = parseCalculationInput(attendancePercentageCalculationInputSchema, input);
  const rounding = resolveRoundingOptions(parsed.rounding);
  const counts = { present: 0, absent: 0, late: 0, excused: 0, cancelled: 0 };
  for (const record of parsed.records) counts[record.status] += 1;

  const excusedEligible = parsed.excusedPolicy === "exclude" ? 0 : counts.excused;
  const eligible = counts.present + counts.absent + counts.late + excusedEligible;
  if (eligible === 0) calculationIssue(["records"], "Attendance requires at least one eligible session.");
  const excusedAttended = parsed.excusedPolicy === "include-as-attended" ? counts.excused : 0;
  const attended = counts.present + counts.late + excusedAttended;
  const percentage = roundedDecimal(new Decimal(attended).dividedBy(eligible).times(100), rounding);

  return {
    totalRecords: parsed.records.length,
    eligibleSessions: eligible,
    attendedSessions: attended,
    absentSessions: counts.absent,
    lateSessions: counts.late,
    excusedSessions: counts.excused,
    cancelledSessions: counts.cancelled,
    exactAttendancePercentage: percentage.exact,
    roundedAttendancePercentage: percentage.rounded,
    excusedPolicy: parsed.excusedPolicy,
    rounding: roundingMetadata(rounding),
  };
}
