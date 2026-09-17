# Finance Loan, Tax, and Economic Calculators

Phase 21 adds 12 calculator plug-ins to the generated Finance registry: generic EMI, Home Loan EMI, Car Loan EMI, Simple Interest, Compound Interest, Flat versus Reducing Rate, Salary and Net Take-home, Income Tax, TDS, HRA, GST, and Inflation-adjusted Prices.

Every result includes calculation disclosures in metadata. These calculators provide deterministic estimates from caller-supplied facts and assumptions. They do not provide personalized financial, lending, payroll, or tax advice.

## Loans and interest

EMI inputs distinguish nominal from effective annual rates. The shared rate converter produces an effective monthly rate before the amortization engine runs. The engine retains exact decimal values, adjusts the final exact payment, and closes the final balance at zero. Fees, insurance, penalties, balloon payments, subsidies, and lender-specific rounding are excluded and disclosed.

Simple Interest applies the supplied rate once per supplied period. Compound Interest requires `compoundingCount` to agree with the named rate period and compounding frequency. Flat versus Reducing Rate interprets payment count as months, divides it by 12 for the flat simple-interest term, uses monthly amortization for the reducing rate, and records both rate conventions in result metadata.

## Salary and withholding

Salary inputs contain itemized earnings and deductions as well as their totals. The calculator rejects totals that do not reconcile and subtracts only recorded deductions.

TDS multiplies the payment by an explicit withholding rate. Every TDS result states that withholding is not final tax liability. The calculator does not infer thresholds, certificates, credits, or filing outcomes.

## Configurable income tax

Income Tax has no embedded regime or preset. Each request supplies:

- financial year, jurisdiction, rule version, and effective date,
- itemized progressive slabs,
- deductions,
- rebate threshold and amount,
- cess rate, and
- surcharge rate.

Slabs must begin at zero, remain contiguous and non-overlapping, cover the assessable income, share one currency, and use rates from zero through 100 percent. The result explains assessable income, tax after rebate, surcharge, and cess in metadata.

This design prevents tax slabs, deductions, rebates, cess, or surcharge from becoming timeless constants. No official Indian tax preset is included in Phase 21, so there is no rate or rule represented as current. A future preset must carry an official primary-source URL, financial year, version, effective date, retrieval date, and complete assumptions.

## HRA, GST, and inflation

HRA uses explicit salary and rent-offset percentages, a descriptive location category, a rule version, and an effective date. It takes the minimum of supplied HRA, rent less the salary offset, and the salary percentage.

GST supports exclusive and inclusive modes. The supplied rate is an assumption; the plug-in does not claim applicability to a product or jurisdiction.

Inflation-adjusted Prices compounds an explicit inflation assumption. It is an illustration, not a forecast.

## Verification

Reference tests cover formula outputs, nominal-rate conversion, reconciled amortization and final balances, matching compound frequencies, flat/reducing disclosures, salary reconciliation, configurable slabs and additions, TDS language, transparent HRA inputs, GST modes, inflation, generated discovery, examples, strict schemas, and normalized errors.
