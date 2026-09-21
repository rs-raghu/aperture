# Finance web feature and Calculator Hub

The Phase 25 web preview connects React presentation code to the real `@aperture/finance` application service and the per-runtime `@aperture/finance-memory` adapter. A single `FinanceProvider` is mounted at the dashboard route-group boundary, so Finance records, favorites, recent calculators, and scenario comparisons survive client navigation between `/finance` and `/calculators`. A full refresh creates a clean runtime.

## Finance routes

| Route | Capability |
| --- | --- |
| `/finance` | Account, transaction, plan, expense, and recorded net-worth summaries |
| `/finance/accounts` | Create, close, archive, and list manual account records |
| `/finance/transactions` | Create categories and transactions; filter by account, category, and currency; delete transactions |
| `/finance/budgets` | Create dated budgets, expense categories, and allocations; remove allocations |
| `/finance/assets` | Create, list, and archive manually valued assets |
| `/finance/liabilities` | Create, list, and archive manually recorded balances |
| `/finance/investments` | Create linked financial and investment account records |
| `/finance/loans` | Create and close recorded loans |
| `/finance/goals` | Create, complete, and archive financial goals |
| `/calculators` | Search, filter, favorite, and revisit registered calculators |
| `/calculators/[calculator-id]` | Edit typed example inputs, calculate, reset, save, disclose assumptions, and compare scenarios |

All pages state that they use volatile local data and a synthetic owner. Finance forms request only descriptive records and exact amounts. They explicitly prohibit bank passwords, PINs, OTPs, and banking credentials.

## Calculator registration

The Hub derives its 36 financial calculators from the generated `allFinanceCalculatorPlugins` registry. GPA and CGPA are thin presentation adapters around `calculateGpa` and `calculateCgpa` from `@aperture/education`; the formulas are not copied into the web feature. The presentation registry now lives in `@aperture/calculators` and is shared with Expo.

The 38 calculators are presented through nine categories:

1. Academic
2. Core Interest and Returns
3. Investment and Wealth
4. Loans and EMI
5. Income and Salary
6. Taxation
7. Retirement and Independence
8. Government Savings Schemes
9. Economic and Inflation

The individual route renders the validated example structure recursively, including nested money, rate, rule, slab, cash-flow, and scenario inputs. Calculation still occurs in the registered domain plug-in. The presentation recursively renders typed output fields, so nested values do not become `[object Object]` and decimal strings are displayed without numeric coercion.

Every calculator page exposes its formula, assumptions, warnings, reset action, and scenario action. Financial scenarios are saved through the Finance application service and memory repository. Academic scenarios stay in the same web runtime because the Finance service registry intentionally contains Finance plug-ins only. Two or more saved runs enable side-by-side comparison. Favorites, recent use, and academic scenario history are volatile preview state.

## Error and accessibility behavior

- Labels are associated with every generated input.
- Nested input paths provide plain-language context for repeated rows.
- Validation and calculation failures use an announced alert with human-readable messages.
- Buttons expose pressed state for favorites.
- Status is always present as text and never communicated by color alone.
- Navigation is keyboard accessible and horizontally scrollable at narrow widths.
- Calculator inputs and result columns collapse to one column on mobile widths.

## Verification

Web tests cover provider stability, owner isolation, account and transaction workflows, all other Finance route creation flows, filtering, exact decimal display, the 38-item calculator inventory, all 38 example executions, all nine categories, search, favorites, recent use, scenario saving and comparison, validation errors, route navigation, status labels, and the credential warning.

The preview is intentionally volatile and unauthenticated. Durable Supabase repositories, personal authentication, shared web/mobile data, and production privacy enforcement are later phases.
