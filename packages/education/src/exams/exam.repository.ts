import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateExamInput, ExamListQuery, UpdateExamInput } from "./exam.contracts.js";
import type { Exam, ExamId } from "./exam.types.js";

export interface ExamRepository
  extends CrudRepository<Exam, ExamId, CreateExamInput, UpdateExamInput, ExamListQuery> {
  complete(id: ExamId, ownerId: string): Promise<Exam>;
}
