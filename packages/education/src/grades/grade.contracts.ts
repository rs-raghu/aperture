import type { OwnerId, OwnerQuery, PageResult } from "../education.types.js";
import type { AssignmentId } from "../assignments/assignment.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { ExamId } from "../exams/exam.types.js";
import type { SemesterId } from "../semesters/semester.types.js";
import type { Grade, GradeId } from "./grade.types.js";

export interface RecordGradeInput {
  readonly ownerId: OwnerId;
  readonly courseId: CourseId;
  readonly semesterId: SemesterId;
  readonly assignmentId?: AssignmentId;
  readonly examId?: ExamId;
  readonly title: string;
  readonly score: number;
  readonly maximumScore: number;
  readonly weightPercentage?: number;
}

export interface UpdateGradeInput {
  readonly title?: string;
  readonly score?: number;
  readonly maximumScore?: number;
  readonly weightPercentage?: number;
}

export interface GradesByCourseQuery extends OwnerQuery {
  readonly courseId: CourseId;
}

export interface GradesBySemesterQuery extends OwnerQuery {
  readonly semesterId: SemesterId;
}

export declare function recordGrade(input: RecordGradeInput): Promise<Grade>;
export declare function updateGrade(id: GradeId, ownerId: OwnerId, input: UpdateGradeInput): Promise<Grade>;
export declare function deleteGrade(id: GradeId, ownerId: OwnerId): Promise<void>;
export declare function getGrade(id: GradeId, ownerId: OwnerId): Promise<Grade | null>;
export declare function listGradesByCourse(query: GradesByCourseQuery): Promise<PageResult<Grade>>;
export declare function listGradesBySemester(query: GradesBySemesterQuery): Promise<PageResult<Grade>>;
