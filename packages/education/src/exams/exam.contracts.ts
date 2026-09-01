import type { IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { SemesterId } from "../semesters/semester.types.js";
import type { Exam, ExamId, ExamStatus } from "./exam.types.js";

export interface CreateExamInput {
  readonly ownerId: OwnerId;
  readonly courseId: CourseId;
  readonly semesterId: SemesterId;
  readonly title: string;
  readonly startsAt: IsoDateTimeString;
  readonly endsAt?: IsoDateTimeString;
}

export interface UpdateExamInput {
  readonly title?: string;
  readonly status?: ExamStatus;
  readonly startsAt?: IsoDateTimeString;
  readonly endsAt?: IsoDateTimeString;
}

export interface ExamListQuery extends OwnerQuery {
  readonly courseId?: CourseId;
  readonly semesterId?: SemesterId;
  readonly status?: ExamStatus;
}

export interface UpcomingExamsQuery extends ExamListQuery {
  readonly startsBefore?: IsoDateTimeString;
}

export declare function createExam(input: CreateExamInput): Promise<Exam>;
export declare function updateExam(id: ExamId, ownerId: OwnerId, input: UpdateExamInput): Promise<Exam>;
export declare function completeExam(id: ExamId, ownerId: OwnerId): Promise<Exam>;
export declare function getExam(id: ExamId, ownerId: OwnerId): Promise<Exam | null>;
export declare function listExams(query: ExamListQuery): Promise<PageResult<Exam>>;
export declare function getUpcomingExams(query: UpcomingExamsQuery): Promise<PageResult<Exam>>;
