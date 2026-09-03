import type { CrudRepository } from "../repositories/repository.types.js";
import type { Exam, ExamId, ExamListQuery } from "./exam.types.js";

export interface ExamRepository
  extends CrudRepository<Exam, ExamId, ExamListQuery> {}
