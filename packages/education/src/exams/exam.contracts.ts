import type { OwnerId, PageResult } from "../education.types.js";
import type { CreateExamInput, Exam, ExamId, ExamListQuery, UpcomingExamsQuery, UpdateExamInput } from "./exam.types.js";
export type { CreateExamInput, ExamListQuery, UpcomingExamsQuery, UpdateExamInput } from "./exam.types.js";
export declare function createExam(input: CreateExamInput): Promise<Exam>;
export declare function updateExam(id: ExamId, ownerId: OwnerId, input: UpdateExamInput): Promise<Exam>;
export declare function completeExam(id: ExamId, ownerId: OwnerId): Promise<Exam>;
export declare function getExam(id: ExamId, ownerId: OwnerId): Promise<Exam | null>;
export declare function listExams(query: ExamListQuery): Promise<PageResult<Exam>>;
export declare function getUpcomingExams(query: UpcomingExamsQuery): Promise<PageResult<Exam>>;
