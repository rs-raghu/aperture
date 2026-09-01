import type { EntityMetadata } from "../education.types.js";
import type { AssignmentId } from "../assignments/assignment.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { ExamId } from "../exams/exam.types.js";
import type { SemesterId } from "../semesters/semester.types.js";

export type GradeId = string;

export interface Grade extends EntityMetadata {
  readonly id: GradeId;
  readonly courseId: CourseId;
  readonly semesterId: SemesterId;
  readonly assignmentId?: AssignmentId;
  readonly examId?: ExamId;
  readonly title: string;
  readonly score: number;
  readonly maximumScore: number;
  readonly weightPercentage?: number;
}
