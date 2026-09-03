import type { CrudRepository } from "../repositories/repository.types.js";
import type { OwnerId, PageResult } from "../education.types.js";
import type { AssignmentId } from "../assignments/assignment.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { ExamId } from "../exams/exam.types.js";
import type { Grade, GradeId, GradeQuery, GradesBySemesterQuery } from "./grade.types.js";

export interface GradeRepository
  extends CrudRepository<Grade, GradeId, GradeQuery> {
  findManyBySemester(query: GradesBySemesterQuery): Promise<PageResult<Grade>>;
  findForGradeable(ownerId: OwnerId, courseId: CourseId, assignmentId?: AssignmentId, examId?: ExamId): Promise<Grade | null>;
}
