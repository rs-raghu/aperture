import type { FinancialStatus, IsoDate, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { InterestRate } from "../interest-rate.types.js";
import type { Money } from "../money.types.js";
import type { Loan, LoanId } from "./loan.types.js";
export interface CreateLoanInput { readonly ownerId: OwnerId; readonly name: string; readonly principal: Money; readonly outstandingBalance: Money; readonly interestRate?: InterestRate; readonly startedOn?: IsoDate; readonly endsOn?: IsoDate; }
export interface UpdateLoanInput { readonly name?: string; readonly outstandingBalance?: Money; readonly interestRate?: InterestRate; readonly endsOn?: IsoDate; readonly status?: FinancialStatus; }
export interface LoanListQuery extends OwnerQuery { readonly status?: FinancialStatus; }
export interface LoanSummary { readonly loanId: LoanId; readonly principal: Money; readonly recordedOutstandingBalance: Money; readonly recordedPayments: Money; }
export declare function createLoan(input: CreateLoanInput): Promise<Loan>;
export declare function updateLoan(id: LoanId, ownerId: OwnerId, input: UpdateLoanInput): Promise<Loan>;
export declare function closeLoan(id: LoanId, ownerId: OwnerId): Promise<Loan>;
export declare function getLoan(id: LoanId, ownerId: OwnerId): Promise<Loan | null>;
export declare function listLoans(query: LoanListQuery): Promise<PageResult<Loan>>;
export declare function getLoanSummary(id: LoanId, ownerId: OwnerId): Promise<LoanSummary>;
