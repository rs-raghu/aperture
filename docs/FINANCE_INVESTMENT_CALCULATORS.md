# Finance Investment and Wealth Calculators

Phase 20 implements 18 discoverable calculator plug-ins. A checked-in generator discovers `*.plugin.ts` modules and emits literal imports for bundler compatibility. Duplicate identifiers fail during module initialization, and stale generated output fails package checks.

| Calculator | Result separation | Formula source |
| --- | --- | --- |
| SIP | contributions and projected value | shared annuity future value |
| Step Up SIP | stepped contributions and projected value | explicit period-by-period decimal accumulation |
| Lumpsum | principal and projected value | shared future value |
| SWP | withdrawals and projected ending value | shared withdrawal-annuity primitive |
| Mutual Fund Returns | recorded gain and percentage return | shared ROI primitive |
| SSY | contribution and projected maturity | shared annuity future value |
| PPF | contribution and projected maturity | shared annuity future value |
| FD | principal and projected maturity | shared compound-interest primitive |
| RD | contributions and projected maturity | shared annuity future value |
| NSC | principal and projected maturity | shared compound-interest primitive |
| Post Office MIS | deposit and projected periodic income | deposit × period rate ÷ payment count |
| SCSS | principal and projected periodic income | principal × period rate ÷ payment count |
| Stock Average | total quantity and weighted unit cost | total lot cost ÷ total quantity |
| Brokerage | explicit charges and projected net amount | trade value × rate + additional charges |
| Margin | contributed capital, borrowed amount, and margin percentage | capital ÷ position value |
| ROI | absolute and percentage return | shared ROI primitive |
| CAGR | annualized growth | shared CAGR primitive |
| XIRR | annualized irregular return | shared bounded XIRR primitive |

SIP, Step Up SIP, RD, PPF, SSY, and SWP require beginning-of-period or end-of-period timing. Rates state their period and compounding frequency. Inputs and outputs use decimal strings and retain currency.

## Government schemes

SSY, PPF, NSC, Post Office MIS, and SCSS are marked as government-scheme calculators. Phase 20 does not embed an interest rate, deposit limit, tenure rule, or eligibility rule for any of them. Their manifests contain an empty preset list and require user-supplied assumptions. When no source reference accompanies an input, result metadata includes `user_supplied_rate_unverified`.

This design avoids describing an old rate as current. A future preset may be added only with an assumption version, effective date, retrieval date, official primary-source URL, assumptions, and source references. Product screens must continue displaying the effective date and source beside any such preset.

The generic formulas do not decide statutory eligibility, tax treatment, premature-withdrawal rules, deposit ceilings, or product-specific compounding calendars. Those rules require separately versioned, effective-dated policy modules.

## Registry and tests

The generated registry exposes all plug-ins and lookup by identifier without a switch statement. Tests execute every owned example through its input and output schemas, verify public discovery, compare reference results, exercise structured invalid-input behavior, check currency and impossible-value boundaries, and enforce the no-unverified-preset policy.
