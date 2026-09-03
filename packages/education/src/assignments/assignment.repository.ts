import type { CrudRepository } from "../repositories/repository.types.js";
import type { Assignment, AssignmentId, AssignmentListQuery } from "./assignment.types.js";

export interface AssignmentRepository
  extends CrudRepository<Assignment, AssignmentId, AssignmentListQuery> {}
