import type { CrudRepository } from "../repositories/repository.types.js";
import type { LoanPaymentListQuery, RecordLoanPaymentInput, UpdateLoanPaymentInput } from "./loan-payment.contracts.js";
import type { LoanPayment, LoanPaymentId } from "./loan-payment.types.js";
export interface LoanPaymentRepository extends CrudRepository<LoanPayment, LoanPaymentId, RecordLoanPaymentInput, UpdateLoanPaymentInput, LoanPaymentListQuery> {}
