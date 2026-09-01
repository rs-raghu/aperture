export interface AttendancePercentageCalculationInput {
  readonly attendedSessions: number;
  readonly totalSessions: number;
}

export interface AttendancePercentageCalculationResult {
  /** Attendance expressed as a percentage from 0 to 100. */
  readonly percentage: number;
  readonly attendedSessions: number;
  readonly totalSessions: number;
}

export declare function calculateAttendancePercentage(
  input: AttendancePercentageCalculationInput,
): AttendancePercentageCalculationResult;
