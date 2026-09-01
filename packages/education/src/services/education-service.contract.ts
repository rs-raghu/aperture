import type { DateRange, IsoDateTimeString, OwnerId } from "../education.types.js";
import type { AssignmentId } from "../assignments/assignment.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { ExamId } from "../exams/exam.types.js";
import type { ProgramId } from "../programs/program.types.js";
import type { SemesterId } from "../semesters/semester.types.js";

export interface EducationOverview {
  readonly currentSemesterId?: SemesterId;
  readonly activeCourseCount: number;
  readonly upcomingDeadlineCount: number;
}

export type UpcomingDeadlineKind = "assignment" | "exam";

export interface UpcomingDeadline {
  readonly kind: UpcomingDeadlineKind;
  readonly assignmentId?: AssignmentId;
  readonly examId?: ExamId;
  readonly courseId: CourseId;
  readonly title: string;
  readonly dueAt: IsoDateTimeString;
}

export interface UpcomingDeadlinesQuery {
  readonly ownerId: OwnerId;
  readonly dueBefore?: IsoDateTimeString;
  readonly limit?: number;
}

export interface CurrentSemesterSummary {
  readonly semesterId: SemesterId;
  readonly courseCount: number;
  readonly completedCourseCount: number;
}

export interface CurrentSemesterSummaryQuery {
  readonly ownerId: OwnerId;
  readonly programId?: ProgramId;
}

export interface CourseProgress {
  readonly courseId: CourseId;
  /** Completion expressed as a percentage from 0 to 100. */
  readonly completionPercentage: number;
  readonly completedTopicCount: number;
  readonly totalTopicCount: number;
}

export interface StudyTimeSummary {
  readonly range: DateRange;
  /** Aggregate study duration expressed in minutes. */
  readonly totalMinutes: number;
  readonly sessionCount: number;
}

export interface StudyTimeSummaryQuery {
  readonly ownerId: OwnerId;
  readonly range: DateRange;
  readonly courseId?: CourseId;
}

export interface AcademicPerformanceSummary {
  readonly semesterId?: SemesterId;
  readonly gpa?: number;
  readonly cgpa?: number;
  readonly scaleMaximum?: number;
}

export interface AcademicPerformanceSummaryQuery {
  readonly ownerId: OwnerId;
  readonly semesterId?: SemesterId;
}

export interface EducationService {
  getEducationOverview(ownerId: OwnerId): Promise<EducationOverview>;
  getUpcomingDeadlines(query: UpcomingDeadlinesQuery): Promise<readonly UpcomingDeadline[]>;
  getCurrentSemesterSummary(query: CurrentSemesterSummaryQuery): Promise<CurrentSemesterSummary | null>;
  getCourseProgress(ownerId: OwnerId, courseId: CourseId): Promise<CourseProgress>;
  getStudyTimeSummary(query: StudyTimeSummaryQuery): Promise<StudyTimeSummary>;
  getAcademicPerformanceSummary(query: AcademicPerformanceSummaryQuery): Promise<AcademicPerformanceSummary>;
}
