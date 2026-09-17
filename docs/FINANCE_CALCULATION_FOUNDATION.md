# Finance Calculation Foundation

Phase 19 provides the decimal-safe primitives used by Finance calculator plug-ins. The package uses a private `decimal.js` constructor configured for 50 significant digits. Public monetary and percentage values remain base-10 strings; ordinary JavaScript number arithmetic is limited to discrete counts and whole calendar-day offsets.

## Rate conventions

An `InterestRate` always states:

- a human percentage (`8.5` means 8.5 percent),
- the period to which that percentage applies, and
- a compounding frequency.

Functions named `presentValue`, `futureValue`, and the annuity functions treat the supplied rate as the effective rate for one calculation period. They do not convert it. `convertInterestRate` performs explicit conversion between nominal and effective conventions. A nominal rate must be annual; its compounding frequency determines the periodic rate. Effective rates can identify day, week, month, quarter, or year. Custom periods are rejected because they have no declared duration.

The formulas are:

- simple interest: `I = P × r × n`
- compound value: `A = P × (1 + r/m)^(m×n)`
- future value: `FV = PV × (1 + r)^n`
- present value: `PV = FV / (1 + r)^n`
- ordinary annuity future-value factor: `((1 + r)^n - 1) / r`
- ordinary annuity present-value factor: `(1 - (1 + r)^(-n)) / r`
- annuity-due factor: the corresponding ordinary factor multiplied by `(1 + r)`
- ROI: `(final - initial) / initial`
- CAGR: `(final / initial)^(1/n) - 1`
- inflation: `value × (1 + i)^n`; deflation divides by the same factor
- amortized end-of-period payment: `P × r / (1 - (1 + r)^(-n))`

Zero-rate branches avoid division by zero.

## Cash flows and XIRR

Positive cash flows are inflows to the owner; negative cash flows are outflows. A timeline has one explicit currency and is sorted by ISO date. Mixed currencies are rejected.

NPV and XIRR use **Actual/365 Fixed**: the year fraction is the exact whole-day difference divided by 365. XIRR uses bounded bisection over rates greater than -100 percent, a finite iteration limit, and a decimal tolerance. It accepts one chronological sign transition, which gives the supported single-root cash-flow shape. Missing signs, multiple transitions, absent brackets, and exhausted iteration bounds produce structured errors instead of fabricated results.

## Timing and amortization

Periodic contributions and withdrawals require `beginning_of_period` or `end_of_period`. The same timing convention is used for annuities and amortization. Schedules retain exact decimal strings and force the final balance to zero by adjusting the last exact payment. Rounding remains a separate boundary.

## Rounding boundary

Calculations do not apply currency display formatting. Callers explicitly select decimal places and one of half-up, half-even, down, or up. `roundDecimal` returns both exact and rounded strings. `roundMoney` preserves currency and the requested trailing decimal places. Locale symbols and separators belong to presentation packages.

## Plug-in structure

The foundation owns a manifest, runtime schemas, pure calculation functions, examples, structured errors, and reference tests. The calculator implementations in Phases 20–22 consume these public primitives and follow the same owned-module pattern without copying formulas into web or mobile code.
