# Finance domain skeleton inventory

Phase 3 adds `@aperture/finance` as a declaration-only package. Every Finance source file ends in `.d.ts`; no Finance `.ts`, `.tsx`, `.js`, or `.jsx` source entry exists.

## Folder and file inventory

| Folder | Files |
|---|---|
| `packages/finance/` | `package.json`, `tsconfig.json` |
| `src/` | `index.d.ts`, `finance.types.d.ts`, `finance.errors.d.ts`, `money.types.d.ts`, `percentage.types.d.ts`, `interest-rate.types.d.ts` |
| `src/accounts/` | `financial-account.types.d.ts`, `financial-account.contracts.d.ts`, `financial-account.repository.d.ts` |
| `src/transactions/` | `transaction.types.d.ts`, `transaction-split.types.d.ts`, `transaction.contracts.d.ts`, `transaction.repository.d.ts` |
| `src/categories/` | `transaction-category.types.d.ts`, `transaction-category.contracts.d.ts`, `transaction-category.repository.d.ts` |
| `src/budgets/` | `budget.types.d.ts`, `budget-line.types.d.ts`, `budget.contracts.d.ts`, `budget.repository.d.ts` |
| `src/recurring-transactions/` | `recurring-transaction.types.d.ts`, `recurring-transaction.contracts.d.ts`, `recurring-transaction.repository.d.ts` |
| `src/income/` | `income-source.types.d.ts`, `income-source.contracts.d.ts`, `income-source.repository.d.ts` |
| `src/cash-flow/` | `cash-flow.types.d.ts`, `cash-flow.contracts.d.ts` |
| `src/assets/` | `asset.types.d.ts`, `asset.contracts.d.ts`, `asset.repository.d.ts` |
| `src/liabilities/` | `liability.types.d.ts`, `liability.contracts.d.ts`, `liability.repository.d.ts` |
| `src/net-worth/` | `net-worth-snapshot.types.d.ts`, `net-worth.contracts.d.ts`, `net-worth.repository.d.ts` |
| `src/investments/` | `investment-account.types.d.ts`, `investment-account.contracts.d.ts`, `investment-account.repository.d.ts` |
| `src/holdings/` | `holding.types.d.ts`, `holding.contracts.d.ts`, `holding.repository.d.ts` |
| `src/trades/` | `trade.types.d.ts`, `trade.contracts.d.ts`, `trade.repository.d.ts` |
| `src/dividends/` | `dividend.types.d.ts`, `dividend.contracts.d.ts`, `dividend.repository.d.ts` |
| `src/market-prices/` | `market-price.types.d.ts`, `market-price.contracts.d.ts`, `market-price.repository.d.ts` |
| `src/loans/` | `loan.types.d.ts`, `loan.contracts.d.ts`, `loan.repository.d.ts` |
| `src/loan-payments/` | `loan-payment.types.d.ts`, `loan-payment.contracts.d.ts`, `loan-payment.repository.d.ts` |
| `src/taxes/` | `tax-profile.types.d.ts`, `tax-record.types.d.ts`, `tax-record.contracts.d.ts`, `tax-record.repository.d.ts` |
| `src/insurance/` | `insurance-policy.types.d.ts`, `insurance-policy.contracts.d.ts`, `insurance-policy.repository.d.ts` |
| `src/financial-goals/` | `financial-goal.types.d.ts`, `financial-goal.contracts.d.ts`, `financial-goal.repository.d.ts` |
| `src/imports/` | `financial-import.types.d.ts`, `financial-import.contracts.d.ts`, `financial-import.repository.d.ts` |
| `src/documents/` | `financial-document.types.d.ts`, `financial-document.contracts.d.ts`, `financial-document.repository.d.ts` |
| `src/calculators/` | `calculator.types.d.ts`, `calculator.repository.d.ts` |
| `src/calculators/retirement/` | `fire.contracts.d.ts`, `retirement-corpus.contracts.d.ts`, `nps.contracts.d.ts`, `gratuity.contracts.d.ts`, `epf.contracts.d.ts`, `apy.contracts.d.ts` |
| `src/calculators/investments/` | `sip.contracts.d.ts`, `step-up-sip.contracts.d.ts`, `lumpsum.contracts.d.ts`, `swp.contracts.d.ts`, `mutual-fund.contracts.d.ts`, `ssy.contracts.d.ts`, `ppf.contracts.d.ts`, `fd.contracts.d.ts`, `rd.contracts.d.ts`, `nsc.contracts.d.ts`, `post-office-mis.contracts.d.ts`, `scss.contracts.d.ts`, `stock-average.contracts.d.ts`, `brokerage.contracts.d.ts`, `margin.contracts.d.ts`, `roi.contracts.d.ts`, `cagr.contracts.d.ts`, `xirr.contracts.d.ts` |
| `src/calculators/loans/` | `emi.contracts.d.ts`, `home-loan-emi.contracts.d.ts`, `car-loan-emi.contracts.d.ts`, `simple-interest.contracts.d.ts`, `compound-interest.contracts.d.ts`, `flat-vs-reducing-rate.contracts.d.ts` |
| `src/calculators/income-tax/` | `salary.contracts.d.ts`, `income-tax.contracts.d.ts`, `tds.contracts.d.ts`, `hra.contracts.d.ts`, `gst.contracts.d.ts` |
| `src/calculators/economic/` | `inflation-adjustment.contracts.d.ts` |
| `src/repositories/` | `repository.types.d.ts`, `finance-repository.contract.d.ts` |
| `src/services/` | `finance-service.contract.d.ts` |

The inventory above lists every Finance folder and file, including the two additional repository files needed to cover imports and saved calculator scenarios.

## Identifiers and entities

The 26 opaque identifier aliases are `FinancialAccountId`, `TransactionId`, `TransactionSplitId`, `TransactionCategoryId`, `BudgetId`, `BudgetLineId`, `RecurringTransactionId`, `IncomeSourceId`, `AssetId`, `LiabilityId`, `NetWorthSnapshotId`, `InvestmentAccountId`, `HoldingId`, `TradeId`, `DividendId`, `MarketPriceId`, `LoanId`, `LoanPaymentId`, `TaxProfileId`, `TaxRecordId`, `InsurancePolicyId`, `FinancialGoalId`, `FinancialImportId`, `FinancialImportRowId`, `FinancialDocumentId`, and `CalculatorScenarioId`.

Principal stored entities mirror those identifiers: financial account, transaction, transaction split, transaction category, budget, budget line, recurring transaction, income source, asset, liability, net-worth snapshot, investment account, holding, trade, dividend, market price, loan, loan payment, tax profile, tax record, insurance policy, financial goal, financial import, import row, financial document, and saved calculator scenario.

## Entity relationships

- Transactions reference accounts and optionally categories and linked transfer transactions; transaction splits reference their parent transaction and optional categories.
- Budgets own category-linked budget lines.
- Recurring transactions reference accounts and may reference categories.
- Investment accounts own holdings; holdings own trades and dividends.
- Market prices reference neutral instrument symbols and have no provider integration.
- Loans own loan payments; liabilities remain a separate recorded balance shape.
- Tax records reference tax profiles but contain no tax rules.
- Imports own import rows, while documents contain metadata only and no storage implementation.
- Financial goals store target and recorded-progress money without calculating progress.
- Saved calculator scenarios reference calculator IDs and versions and store opaque structural input only.

## Domain operation contracts

| Contract | Declared operations |
|---|---|
| Accounts | `createFinancialAccount`, `updateFinancialAccount`, `archiveFinancialAccount`, `closeFinancialAccount`, `getFinancialAccount`, `listFinancialAccounts`, `listFinancialAccountsByType` |
| Transactions | `createTransaction`, `updateTransaction`, `deleteTransaction`, `getTransaction`, `listTransactions`, `listTransactionsByAccount`, `listTransactionsByDateRange`, `splitTransaction`, `replaceTransactionSplits`, `categorizeTransaction`, `markTransactionAsTransfer`, `linkTransferTransactions`, `markTransactionReviewed`, `findPossibleDuplicateTransactions`, `findPossibleTransferMatches` |
| Categories | `createTransactionCategory`, `updateTransactionCategory`, `archiveTransactionCategory`, `getTransactionCategory`, `listTransactionCategories` |
| Budgets | `createBudget`, `updateBudget`, `archiveBudget`, `getBudget`, `listBudgets`, `createBudgetLine`, `updateBudgetLine`, `deleteBudgetLine`, `listBudgetLines`, `getBudgetStatus`, `getBudgetVariance` |
| Recurring transactions | `createRecurringTransaction`, `updateRecurringTransaction`, `pauseRecurringTransaction`, `resumeRecurringTransaction`, `archiveRecurringTransaction`, `getRecurringTransaction`, `listRecurringTransactions`, `listUpcomingRecurringTransactions` |
| Income | `createIncomeSource`, `updateIncomeSource`, `archiveIncomeSource`, `getIncomeSource`, `listIncomeSources` |
| Cash flow | `getCashFlowSummary`, `getIncomeSummary`, `getExpenseSummary`, `getSavingsRateSummary`, `getCategorySpendingSummary` |
| Assets | `createAsset`, `updateAsset`, `archiveAsset`, `getAsset`, `listAssets` |
| Liabilities | `createLiability`, `updateLiability`, `archiveLiability`, `getLiability`, `listLiabilities` |
| Net worth | `createNetWorthSnapshot`, `getNetWorthSnapshot`, `listNetWorthSnapshots`, `getLatestNetWorthSnapshot`, `getNetWorthSummary` |
| Investment accounts | `createInvestmentAccount`, `updateInvestmentAccount`, `archiveInvestmentAccount`, `getInvestmentAccount`, `listInvestmentAccounts` |
| Holdings | `createHolding`, `updateHolding`, `archiveHolding`, `getHolding`, `listHoldings`, `listHoldingsByInvestmentAccount` |
| Trades | `recordTrade`, `updateTrade`, `deleteTrade`, `getTrade`, `listTrades`, `listTradesByHolding` |
| Dividends | `recordDividend`, `updateDividend`, `deleteDividend`, `getDividend`, `listDividends`, `listDividendsByHolding` |
| Market prices | `recordMarketPrice`, `updateMarketPrice`, `deleteMarketPrice`, `getLatestMarketPrice`, `listMarketPrices` |
| Loans | `createLoan`, `updateLoan`, `closeLoan`, `getLoan`, `listLoans`, `getLoanSummary` |
| Loan payments | `recordLoanPayment`, `updateLoanPayment`, `deleteLoanPayment`, `getLoanPayment`, `listLoanPayments`, `listLoanPaymentsByLoan` |
| Taxes | `createTaxProfile`, `updateTaxProfile`, `getTaxProfile`, `createTaxRecord`, `updateTaxRecord`, `deleteTaxRecord`, `getTaxRecord`, `listTaxRecords`, `listTaxRecordsByFinancialYear` |
| Insurance | `createInsurancePolicy`, `updateInsurancePolicy`, `renewInsurancePolicy`, `archiveInsurancePolicy`, `getInsurancePolicy`, `listInsurancePolicies`, `listUpcomingInsuranceRenewals` |
| Financial goals | `createFinancialGoal`, `updateFinancialGoal`, `completeFinancialGoal`, `archiveFinancialGoal`, `getFinancialGoal`, `listFinancialGoals`, `getFinancialGoalProgress` |
| Imports | `createFinancialImport`, `validateFinancialImport`, `previewFinancialImport`, `commitFinancialImport`, `cancelFinancialImport`, `getFinancialImport`, `listFinancialImports`, `listRejectedImportRows` |
| Documents | `createFinancialDocument`, `updateFinancialDocument`, `archiveFinancialDocument`, `getFinancialDocument`, `listFinancialDocuments` |

These 147 domain-operation declarations have typed inputs and outputs and no bodies. Duplicate, transfer, summary, import, progress, and valuation names describe future contracts only.

## Calculator contracts

Every calculator input extends `CalculatorInputContext`, which carries a version placeholder, assumptions, and source references. Every result carries `CalculatorResultMetadata`, including estimate status, version, assumptions, sources, and warnings. Money always includes currency; rates and percentages use the human-percentage convention. Every calculator file explicitly states that no formula is implemented in Phase 3.

| Category | 36 required declarations |
|---|---|
| Retirement | `calculateFire`, `calculateRetirementCorpus`, `calculateNps`, `calculateGratuity`, `calculateEpf`, `calculateApy` |
| Investments | `calculateSip`, `calculateStepUpSip`, `calculateLumpsum`, `calculateSwp`, `calculateMutualFundReturns`, `calculateSsy`, `calculatePpf`, `calculateFd`, `calculateRd`, `calculateNsc`, `calculatePostOfficeMis`, `calculateScss`, `calculateStockAverage`, `calculateBrokerage`, `calculateMargin`, `calculateRoi`, `calculateCagr`, `calculateXirr` |
| Loans | `calculateEmi`, `calculateHomeLoanEmi`, `calculateCarLoanEmi`, `calculateSimpleInterest`, `calculateCompoundInterest`, `compareFlatAndReducingRate` |
| Income and tax | `calculateNetSalary`, `calculateIncomeTax`, `calculateTds`, `calculateHra`, `calculateGst` |
| Economic | `calculateInflationAdjustedValue` |

GPA and CGPA remain exclusively in Education and are not exported by Finance.

## Repositories and Finance service

The generic repository layer declares `findById`, `findMany`, `create`, `update`, and `delete`. Twenty-six stored-entity repository interfaces specialize that layer. `FinanceRepository` exposes all repositories through readonly properties, including the 20 explicitly required aggregate areas plus splits, budget lines, tax profiles, imports, import rows, and saved scenarios.

`FinanceService` has 13 methods covering finance overview, account summary, transaction summary, budget summary, cash flow, net worth, debt, portfolio, upcoming recurring payments, upcoming insurance renewals, financial goals, tax, and imports. It contains no implementation.

## Money, percentage, rate, and date conventions

- `MoneyAmount`, decimal quantities, unit prices, percentages, rates, and financial results are base-10 `DecimalString` values.
- Every monetary field uses `Money`, which contains both `amount` and `currency`.
- `"8.5"` means 8.5% at Finance boundaries. Decimal fractions such as `"0.085"` are not the boundary representation.
- `InterestRate` also states its financial period.
- Counts and integer sequence positions alone may use `number`.
- Dates and timestamps use `IsoDate` and `IsoDateTime` aliases.
- No currency conversion, parsing, numeric validation, or date validation exists.

## Financial-safety boundary and exclusions

Finance records are neutral structures. Phase 3 contains no advice, buy/sell recommendation, accounting effect, tax interpretation, legal conclusion, current rate, government-scheme rule, amortization, XIRR iteration, budget/net-worth/valuation logic, duplicate detection, transfer matching, CSV parsing, file storage, or external financial connection.

It also excludes runtime Finance source, UI frameworks, APIs, authentication, databases, migrations, Supabase, banking/brokerage/market-data integrations, mocks, seeds, credentials, and personal or financial data.

## Completion checklist

- [x] All 115 Finance source files are `.d.ts` declarations.
- [x] All 26 required opaque identifiers and stored entity shapes exist.
- [x] All 147 required domain-operation declarations exist with no bodies.
- [x] Exactly 36 required Finance calculator declarations exist; GPA and CGPA are absent.
- [x] Calculator inputs/results document units, estimate status, version, assumptions, sources, and no formula.
- [x] All 26 stored-entity repositories and readonly aggregate repository exist as interfaces only.
- [x] The 13-method Finance service covers every required orchestration area.
- [x] `index.d.ts` explicitly exports the complete supported surface without wildcard collisions.
- [x] Money, percentage, rate, currency, and ISO date conventions are explicit.
- [x] Education and Health remain unchanged and type-check with Finance.
- [x] No runtime, formula, rule, recommendation, integration, UI, API, database, authentication, mock, or seed implementation exists.
- [x] Phase 4 has not started.
