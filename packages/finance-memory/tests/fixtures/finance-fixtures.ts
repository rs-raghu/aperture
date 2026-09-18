export const OWNER_A = "finance-owner-a";
export const OWNER_B = "finance-owner-b";
export const NOW = "2040-01-01T08:00:00Z";

const money = (amount: string, currency = "USD") => ({ amount, currency });

export const repositoryFixtures = [
  { key: "accounts", input: { ownerId: OWNER_A, name: "Checking", accountType: "bank", currency: "USD" } },
  { key: "transactions", input: { ownerId: OWNER_A, accountId: "account-1", categoryId: "category-1", description: "Groceries", transactionType: "expense", amount: money("12.3400"), occurredAt: "2040-01-02T10:00:00Z" } },
  { key: "transactionSplits", input: { ownerId: OWNER_A, transactionId: "transaction-1", categoryId: "category-1", amount: money("12.3400"), sequence: 1 } },
  { key: "categories", input: { ownerId: OWNER_A, name: "Groceries", kind: "expense" } },
  { key: "budgets", input: { ownerId: OWNER_A, name: "January", currency: "USD", period: "month", startsOn: "2040-01-01", endsOn: "2040-01-31" } },
  { key: "budgetLines", input: { ownerId: OWNER_A, budgetId: "budget-1", categoryId: "category-1", allocatedAmount: money("500.00") } },
  { key: "recurringTransactions", input: { ownerId: OWNER_A, accountId: "account-1", description: "Rent", amount: money("1000.00"), frequency: "monthly", nextOccurrenceOn: "2040-02-01" } },
  { key: "incomeSources", input: { ownerId: OWNER_A, name: "Salary", expectedAmount: money("5000.00"), frequency: "monthly" } },
  { key: "assets", input: { ownerId: OWNER_A, name: "Home", assetType: "property", currentValue: money("300000.00"), valuedOn: "2040-01-01" } },
  { key: "liabilities", input: { ownerId: OWNER_A, name: "Mortgage", liabilityType: "mortgage", outstandingBalance: money("200000.00"), valuedOn: "2040-01-01" } },
  { key: "netWorthSnapshots", input: { ownerId: OWNER_A, snapshotDate: "2040-01-01", totalAssets: money("300000.00"), totalLiabilities: money("200000.00"), netWorth: money("100000.00") } },
  { key: "investmentAccounts", input: { ownerId: OWNER_A, financialAccountId: "account-1", name: "Brokerage", currency: "USD" } },
  { key: "holdings", input: { ownerId: OWNER_A, investmentAccountId: "investment-account-1", symbol: "AAA", name: "Example holding", quantity: "2.5000", averageUnitCost: money("10.2500") } },
  { key: "trades", input: { ownerId: OWNER_A, holdingId: "holding-1", tradeType: "buy", quantity: "2.5000", unitPrice: money("10.2500"), fees: money("0.1000"), occurredAt: "2040-01-02T10:00:00Z" } },
  { key: "dividends", input: { ownerId: OWNER_A, holdingId: "holding-1", amount: money("1.2300"), paidOn: "2040-01-03" } },
  { key: "marketPrices", input: { ownerId: OWNER_A, symbol: "AAA", unitPrice: money("12.5000"), observedAt: "2040-01-03T10:00:00Z" } },
  { key: "loans", input: { ownerId: OWNER_A, name: "Auto", principal: money("20000.00"), outstandingBalance: money("15000.00"), startedOn: "2040-01-01", endsOn: "2045-01-01" } },
  { key: "loanPayments", input: { ownerId: OWNER_A, loanId: "loan-1", amount: money("500.00"), principalComponent: money("400.00"), interestComponent: money("100.00"), paidOn: "2040-02-01" } },
  { key: "taxProfiles", input: { ownerId: OWNER_A, jurisdiction: "Example", currency: "USD" } },
  { key: "taxRecords", input: { ownerId: OWNER_A, taxProfileId: "tax-profile-1", financialYear: "2040-41", recordType: "estimated", amount: money("100.00"), recordedOn: "2040-04-01" } },
  { key: "insurancePolicies", input: { ownerId: OWNER_A, name: "Home cover", policyType: "property", premium: money("100.00"), premiumFrequency: "yearly", coverageAmount: money("300000.00"), startsOn: "2040-01-01", renewsOn: "2041-01-01" } },
  { key: "financialGoals", input: { ownerId: OWNER_A, name: "Emergency fund", targetAmount: money("10000.00"), recordedProgressAmount: money("2500.00"), targetDate: "2041-01-01" } },
  { key: "financialImports", input: { ownerId: OWNER_A, fileName: "transactions.csv" } },
  { key: "financialImportRows", input: { ownerId: OWNER_A, financialImportId: "financial-import-1", rowNumber: 1, fields: { amount: "12.34" } } },
  { key: "financialDocuments", input: { ownerId: OWNER_A, title: "Statement", documentType: "bank_statement", documentDate: "2040-01-01" } },
  { key: "calculatorScenarios", input: { ownerId: OWNER_A, calculatorId: "sip", calculatorVersion: "1.0.0", name: "Baseline", input: { contributionCount: 12 } } },
] as const;
