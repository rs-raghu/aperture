import type { CrudRepository } from "../repositories/repository.types.js";
import type { AssignmentListQuery, CreateAssignmentInput, UpdateAssignmentInput } from "./assignment.contracts.js";
import type { Assignment, AssignmentId } from "./assignment.types.js";

export interface AssignmentRepository
  extends CrudRepository<Assignment, AssignmentId, CreateAssignmentInput, UpdateAssignmentInput, AssignmentListQuery> {
  submit(id: AssignmentId, ownerId: string, submittedAt: string): Promise<Assignment>;
  markComplete(id: AssignmentId, ownerId: string): Promise<Assignment>;
}
