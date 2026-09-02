import type { IsoDate, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { LoanId } from "../loans/loan.types.js";
import type { LoanPayment, LoanPaymentId } from "./loan-payment.types.js";
export interface RecordLoanPaymentInput { readonly ownerId: OwnerId; readonly loanId: LoanId; readonly amount: Money; readonly principalComponent?: Money; readonly interestComponent?: Money; readonly paidOn: IsoDate; }
export interface UpdateLoanPaymentInput { readonly amount?: Money; readonly principalComponent?: Money; readonly interestComponent?: Money; readonly paidOn?: IsoDate; }
export interface LoanPaymentListQuery extends OwnerQuery { readonly loanId?: LoanId; }
export interface LoanPaymentsByLoanQuery extends OwnerQuery { readonly loanId: LoanId; }
export declare function recordLoanPayment(input: RecordLoanPaymentInput): Promise<LoanPayment>;
export declare function updateLoanPayment(id: LoanPaymentId, ownerId: OwnerId, input: UpdateLoanPaymentInput): Promise<LoanPayment>;
export declare function deleteLoanPayment(id: LoanPaymentId, ownerId: OwnerId): Promise<void>;
export declare function getLoanPayment(id: LoanPaymentId, ownerId: OwnerId): Promise<LoanPayment | null>;
export declare function listLoanPayments(query: LoanPaymentListQuery): Promise<PageResult<LoanPayment>>;
export declare function listLoanPaymentsByLoan(query: LoanPaymentsByLoanQuery): Promise<PageResult<LoanPayment>>;
