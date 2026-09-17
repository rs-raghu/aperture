# Finance retirement calculators

Phase 22 implements six independent calculator plug-ins: FIRE, Retirement Corpus, NPS, Gratuity, EPF, and APY. The generated Finance registry now exposes 36 calculators, including a six-item retirement category.

Every result is an estimate. Each manifest states that the output is not a promise, guarantee, legal determination, or personalized investment recommendation. Exact decimal strings are retained through the calculation boundary.

## FIRE and Retirement Corpus

FIRE and Retirement Corpus require one or more named scenarios. A scenario supplies inflation, pre-retirement return, post-retirement return, explicit nominal or effective rate conventions, and a withdrawal rate. The shared projection also requires current age, retirement age, longevity age, existing corpus, annual contribution, and contribution timing.

For each scenario, the calculator exposes:

- the annual need inflated to retirement,
- the corpus implied by the supplied withdrawal rate,
- the present value of annual needs through the supplied longevity age,
- the larger of those two targets,
- the projected corpus from current savings and contributions, and
- the non-negative funding gap.

The first scenario is the baseline used for the top-level result fields. Every scenario remains available in the result for comparison. The calculators do not choose hidden optimistic or pessimistic defaults.

## Effective-dated scheme assumptions

NPS, Gratuity, EPF, and APY require a caller-supplied rule version and effective date. NPS separates employee and employer contributions, annuity purchase, lump sum, and estimated annual pension. EPF separates employee and employer contributions. APY exposes the supplied contribution total. Gratuity applies the supplied benefit factor to eligible salary and years of service.

These four manifests intentionally contain no preset. No statutory rate, contribution table, allocation, wage ceiling, eligibility rule, benefit ceiling, tax treatment, or guaranteed pension value is represented as current. When a request has no source reference, its result carries an unverified caller-rule warning. A future preset must include an official primary-source URL, effective date, retrieval date, rule version, and complete assumptions.
