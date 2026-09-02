import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateLoanInput, LoanListQuery, UpdateLoanInput } from "./loan.contracts.js";
import type { Loan, LoanId } from "./loan.types.js";
export interface LoanRepository extends CrudRepository<Loan, LoanId, CreateLoanInput, UpdateLoanInput, LoanListQuery> {}
