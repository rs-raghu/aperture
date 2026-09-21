# Calculator reference

This reference is generated from the shared calculator presentation registry used by web and Expo. It covers all 38 calculators in nine presentation categories. Formula text, reference inputs, output shapes, warnings, versions, and preset policy come from executable package definitions rather than UI copies.

## Shared conventions

- Money and precision-sensitive rates are serialized as decimal strings. JavaScript numbers are limited to validated safe integers such as counts and ages.
- Percentages state their representation. Interest rates also state their period and compounding frequency when applicable.
- The Finance foundation uses 50-digit decimal precision, half-even internal rounding, Actual/365 Fixed for XIRR/NPV, positive inflows and negative outflows, and explicit contribution/payment timing.
- A calculator rounds only when its contract contains an explicit rounding policy. UI layers display returned decimal strings without re-rounding.
- All 36 Finance calculators return result metadata. Every estimate includes the shared `estimate_not_advice` disclosure plus any calculator-specific warnings.
- No current government rate or tax-law preset is embedded. Government calculators require caller-supplied rates or effective-dated rules; Income Tax and HRA carry caller rule identifiers and effective dates.
- GPA and CGPA call the Education calculation package and use its explicit scale and rounding inputs.

## Test map

- Foundation precision, rounding, sign, date, timing, rate-conversion, and reference cases: `packages/finance/test/calculation-foundation.test.ts`.
- Finance calculator examples and boundary cases: `packages/finance/test/investment-calculators.test.ts`, `packages/finance/test/regulated-calculators.test.ts`, and `packages/finance/test/retirement-calculators.test.ts`.
- Cross-registry metadata, serialization, government policy, and tax metadata: `packages/calculators/test/integration-hardening.test.ts`.
- Academic formulas: `packages/education/test/education-calculations.test.ts`.
- Shared web/mobile registry execution and scenario behavior: `apps/web/tests/calculator-hub.test.tsx` and `apps/mobile/tests/calculator-hub.test.tsx`.

## 1. GPA (`gpa`)

- **Presentation category:** Academic
- **Calculator version:** `1.0.0`
- **Formula:** sum of credits × grade points ÷ included credits
- **Preset/version policy:** Not applicable; academic scale and rounding are explicit inputs.
- **Reference example:** Two equally weighted courses. The Education input schema accepts the example and the shared calculation returns the documented output shape.
- **Assumptions and disclosures:** Grade points use the scale entered below. The calculation reuses the Education package formula.
- **Inputs and units:**
  - `courses[].courseId` — enum or text (`10000000-0000-4000-8000-000000000001`)
  - `courses[].credits` — exact decimal string (`3`)
  - `courses[].gradePoints` — exact decimal string (`8`)
  - `courses[].included` — boolean (true)
  - `gradePointScale` — exact decimal string (`10`)
  - `zeroCreditPolicy` — enum or text (`reject`)
  - `rounding.decimalPlaces` — safe integer (2)
  - `rounding.mode` — enum or text (`half-up`)
- **Output fields:**
  - `includedCourseCount` — safe integer (2)
  - `excludedCourseCount` — safe integer (0)
  - `totalIncludedCredits` — exact decimal string (`6`)
  - `totalQualityPoints` — exact decimal string (`54`)
  - `exactGpa` — exact decimal string (`9`)
  - `roundedGpa` — exact decimal string (`9.00`)
  - `gradePointScale` — exact decimal string (`10`)
  - `rounding.decimalPlaces` — safe integer (2)
  - `rounding.mode` — enum or text (`half-up`)

- **Test references:** `packages/education/test/education-calculations.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 2. CGPA (`cgpa`)

- **Presentation category:** Academic
- **Calculator version:** `1.0.0`
- **Formula:** sum of semester credits × GPA ÷ included semester credits
- **Preset/version policy:** Not applicable; academic scale and rounding are explicit inputs.
- **Reference example:** Two equally weighted semesters. The Education input schema accepts the example and the shared calculation returns the documented output shape.
- **Assumptions and disclosures:** Semester GPAs use the scale entered below. The calculation reuses the Education package formula.
- **Inputs and units:**
  - `semesters[].semesterId` — enum or text (`20000000-0000-4000-8000-000000000001`)
  - `semesters[].gpa` — exact decimal string (`8`)
  - `semesters[].credits` — exact decimal string (`20`)
  - `semesters[].included` — boolean (true)
  - `gradePointScale` — exact decimal string (`10`)
  - `rounding.decimalPlaces` — safe integer (2)
  - `rounding.mode` — enum or text (`half-up`)
- **Output fields:**
  - `includedSemesterCount` — safe integer (2)
  - `excludedSemesterCount` — safe integer (0)
  - `totalCredits` — exact decimal string (`40`)
  - `totalWeightedGradePoints` — exact decimal string (`340`)
  - `exactCgpa` — exact decimal string (`8.5`)
  - `roundedCgpa` — exact decimal string (`8.50`)
  - `gradePointScale` — exact decimal string (`10`)
  - `rounding.decimalPlaces` — safe integer (2)
  - `rounding.mode` — enum or text (`half-up`)

- **Test references:** `packages/education/test/education-calculations.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 3. Inflation-adjusted Prices (`inflation-adjusted-value`)

- **Presentation category:** Economic and Inflation
- **Calculator version:** `1.0.0`
- **Formula:** present value × (1 + inflation)^periods
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** two inflation periods. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** The supplied inflation rate is an assumption and is not a forecast or financial advice. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `presentValue` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `inflationRate` — human percentage as an exact decimal string (`10`)
  - `periodCount` — safe integer (2)
- **Output fields:**
  - `estimatedAdjustedValue` — money as an exact decimal string plus ISO 4217 currency (`USD 121`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/calculation-foundation.test.ts`, `packages/finance/test/regulated-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 4. GST (`gst`)

- **Presentation category:** Taxation
- **Calculator version:** `1.0.0`
- **Formula:** exclusive: amount × rate; inclusive: gross − gross/(1+rate)
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** exclusive tax. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** The supplied rate is not asserted to be the current rate for any good, service, or jurisdiction. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `amount` — money as an exact decimal string plus ISO 4217 currency (`INR 100`)
  - `taxRate` — human percentage as an exact decimal string (`18`)
  - `pricingMode` — enum or text (`exclusive`)
- **Output fields:**
  - `estimatedTax` — money as an exact decimal string plus ISO 4217 currency (`INR 18`)
  - `estimatedNetAmount` — money as an exact decimal string plus ISO 4217 currency (`INR 100`)
  - `estimatedGrossAmount` — money as an exact decimal string plus ISO 4217 currency (`INR 118`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/regulated-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 5. HRA (`hra`)

- **Presentation category:** Taxation
- **Calculator version:** `1.0.0`
- **Formula:** minimum of HRA received, rent less salary offset, and salary percentage
- **Preset/version policy:** None embedded; calculator version `1.0.0`. Reference input uses caller rule `example-1` effective `2026-01-01`.
- **Reference example:** explicit HRA assumptions. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Location category is descriptive; supplied rule percentages control the formula. Eligibility, evidence, payroll periods, and filing treatment require professional review. Rule version example-1 effective 2026-01-01. Location category: example. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `basicSalary` — money as an exact decimal string plus ISO 4217 currency (`INR 1000`)
  - `hraReceived` — money as an exact decimal string plus ISO 4217 currency (`INR 500`)
  - `rentPaid` — money as an exact decimal string plus ISO 4217 currency (`INR 400`)
  - `locationCategory` — enum or text (`example`)
  - `salaryRate` — human percentage as an exact decimal string (`50`)
  - `rentOffsetRate` — human percentage as an exact decimal string (`10`)
  - `ruleVersion` — version identifier (`example-1`)
  - `ruleEffectiveOn` — ISO date/time (`2026-01-01`)
- **Output fields:**
  - `estimatedExemption` — money as an exact decimal string plus ISO 4217 currency (`INR 300`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/regulated-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 6. Income Tax (`income-tax`)

- **Presentation category:** Taxation
- **Calculator version:** `1.0.0`
- **Formula:** progressive slabs less rebate plus surcharge and cess
- **Preset/version policy:** None embedded; calculator version `1.0.0`. Reference input uses caller rule `example-1` effective `2026-04-01`.
- **Reference example:** caller-supplied example rules. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** This is an estimate from supplied rules and is not personalized tax advice. The calculator does not claim that supplied slabs, deductions, rebates, cess, or surcharge are current law. Rule example-1 for 2026-27, effective 2026-04-01. Jurisdiction: example. Assessable income after supplied deductions: 1000 INR. Tax after rebate: 100; surcharge: 0; cess: 0 INR. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `taxableIncome` — money as an exact decimal string plus ISO 4217 currency (`INR 1000`)
  - `deductions` — money as an exact decimal string plus ISO 4217 currency (`INR 0`)
  - `financialYear` — enum or text (`2026-27`)
  - `jurisdiction` — enum or text (`example`)
  - `taxRuleVersion` — version identifier (`example-1`)
  - `ruleEffectiveOn` — ISO date/time (`2026-04-01`)
  - `slabs[].startsAt` — money as an exact decimal string plus ISO 4217 currency (`INR 0`)
  - `slabs[].rate` — human percentage as an exact decimal string (`10`)
  - `rebateThreshold` — money as an exact decimal string plus ISO 4217 currency (`INR 0`)
  - `rebateAmount` — money as an exact decimal string plus ISO 4217 currency (`INR 0`)
  - `cessRate` — human percentage as an exact decimal string (`0`)
  - `surchargeRate` — human percentage as an exact decimal string (`0`)
- **Output fields:**
  - `estimatedTax` — money as an exact decimal string plus ISO 4217 currency (`INR 100`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/regulated-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 7. Salary and Net Take-home (`net-salary`)

- **Presentation category:** Income and Salary
- **Calculator version:** `1.0.0`
- **Formula:** gross earnings − recorded deductions
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** itemized salary. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** The result uses only supplied components and does not infer tax, benefits, or payroll rules. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `grossSalary` — money as an exact decimal string plus ISO 4217 currency (`INR 1000`)
  - `recordedDeductions` — money as an exact decimal string plus ISO 4217 currency (`INR 200`)
  - `earnings[].name` — enum or text (`base`)
  - `earnings[].amount` — money as an exact decimal string plus ISO 4217 currency (`INR 1000`)
  - `deductions[].name` — enum or text (`recorded`)
  - `deductions[].amount` — money as an exact decimal string plus ISO 4217 currency (`INR 200`)
- **Output fields:**
  - `estimatedNetSalary` — money as an exact decimal string plus ISO 4217 currency (`INR 800`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/regulated-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 8. TDS Withholding (`tds`)

- **Presentation category:** Taxation
- **Calculator version:** `1.0.0`
- **Formula:** payment × withholding rate
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** explicit withholding. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** TDS is withholding and is not a calculation of final tax liability. Thresholds, certificates, credits, and filing outcomes are outside this calculation. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `paymentAmount` — money as an exact decimal string plus ISO 4217 currency (`INR 1000`)
  - `withholdingRate` — human percentage as an exact decimal string (`10`)
- **Output fields:**
  - `estimatedWithholding` — money as an exact decimal string plus ISO 4217 currency (`INR 100`)
  - `estimatedNetPayment` — money as an exact decimal string plus ISO 4217 currency (`INR 900`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/regulated-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 9. Brokerage (`brokerage`)

- **Presentation category:** Investment and Wealth
- **Calculator version:** `1.0.0`
- **Formula:** trade value × brokerage rate + charges
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** rate plus charges. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Rates are supplied by you; Aperture does not insert a current market or government rate. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `tradeValue` — money as an exact decimal string plus ISO 4217 currency (`USD 1000`)
  - `brokerageRate` — human percentage as an exact decimal string (`1`)
  - `additionalCharges` — money as an exact decimal string plus ISO 4217 currency (`USD 5`)
- **Output fields:**
  - `estimatedCharges` — money as an exact decimal string plus ISO 4217 currency (`USD 15`)
  - `estimatedNetAmount` — money as an exact decimal string plus ISO 4217 currency (`USD 985`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 10. CAGR (`cagr`)

- **Presentation category:** Core Interest and Returns
- **Calculator version:** `1.0.0`
- **Formula:** (final ÷ initial)^(1/n) − 1
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** ten percent annualized growth. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `initialValue` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `finalValue` — money as an exact decimal string plus ISO 4217 currency (`USD 121`)
  - `periodCount` — safe integer (2)
- **Output fields:**
  - `annualizedRate` — human percentage as an exact decimal string (`10`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/calculation-foundation.test.ts`, `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 11. Fixed Deposit (`fd`)

- **Presentation category:** Government Savings Schemes
- **Calculator version:** `1.0.0`
- **Formula:** compound interest
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** one annual period. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Rates are supplied by you; Aperture does not insert a current market or government rate. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `principal` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `assumedRate` — human percentage as an exact decimal string per year, yearly compounding (`10`)
  - `periodCount` — safe integer (1)
- **Output fields:**
  - `estimatedMaturityValue` — money as an exact decimal string plus ISO 4217 currency (`USD 110`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 12. Lumpsum (`lumpsum`)

- **Presentation category:** Investment and Wealth
- **Calculator version:** `1.0.0`
- **Formula:** future value
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** two annual periods. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Rates are supplied by you; Aperture does not insert a current market or government rate. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `principal` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `expectedReturn` — human percentage as an exact decimal string per year, yearly compounding (`10`)
  - `periodCount` — safe integer (2)
- **Output fields:**
  - `estimatedValue` — money as an exact decimal string plus ISO 4217 currency (`USD 121`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/calculation-foundation.test.ts`, `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 13. Margin (`margin`)

- **Presentation category:** Investment and Wealth
- **Calculator version:** `1.0.0`
- **Formula:** borrowed = position − capital; margin % = capital ÷ position
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** forty percent margin. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** No hidden assumptions; all values are explicit inputs.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `positionValue` — money as an exact decimal string plus ISO 4217 currency (`USD 1000`)
  - `contributedCapital` — money as an exact decimal string plus ISO 4217 currency (`USD 400`)
- **Output fields:**
  - `borrowedAmount` — money as an exact decimal string plus ISO 4217 currency (`USD 600`)
  - `marginPercentage` — human percentage as an exact decimal string (`40`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 14. Mutual Fund Returns (`mutual-fund-returns`)

- **Presentation category:** Investment and Wealth
- **Calculator version:** `1.0.0`
- **Formula:** return on investment
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** recorded gain. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** No hidden assumptions; all values are explicit inputs.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `investedAmount` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `currentValue` — money as an exact decimal string plus ISO 4217 currency (`USD 125`)
- **Output fields:**
  - `absoluteReturn` — money as an exact decimal string plus ISO 4217 currency (`USD 25`)
  - `returnPercentage` — human percentage as an exact decimal string (`25`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 15. National Savings Certificate (`nsc`)

- **Presentation category:** Government Savings Schemes
- **Calculator version:** `1.0.0`
- **Formula:** compound interest
- **Preset/version policy:** None embedded; calculator version `1.0.0`. Government rate or rule values must be supplied by the caller.
- **Reference example:** user-supplied annual rate. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Rates are supplied by you; Aperture does not insert a current market or government rate. The calculation uses a required user-supplied rate and does not claim that it is the current official rate. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `principal` — money as an exact decimal string plus ISO 4217 currency (`INR 100`)
  - `assumedRate` — human percentage as an exact decimal string per year, yearly compounding (`10`)
  - `periodCount` — safe integer (1)
- **Output fields:**
  - `estimatedMaturityValue` — money as an exact decimal string plus ISO 4217 currency (`INR 110`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 16. Post Office MIS (`post-office-mis`)

- **Presentation category:** Government Savings Schemes
- **Calculator version:** `1.0.0`
- **Formula:** deposit × rate ÷ payment count
- **Preset/version policy:** None embedded; calculator version `1.0.0`. Government rate or rule values must be supplied by the caller.
- **Reference example:** twelve income payments. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Rates are supplied by you; Aperture does not insert a current market or government rate. The calculation uses a required user-supplied rate and does not claim that it is the current official rate. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `deposit` — money as an exact decimal string plus ISO 4217 currency (`INR 1200`)
  - `assumedRate` — human percentage as an exact decimal string per year, yearly compounding (`12`)
  - `paymentCount` — safe integer (12)
- **Output fields:**
  - `estimatedPeriodicIncome` — money as an exact decimal string plus ISO 4217 currency (`INR 12`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 17. PPF (`ppf`)

- **Presentation category:** Government Savings Schemes
- **Calculator version:** `1.0.0`
- **Formula:** annuity future value
- **Preset/version policy:** None embedded; calculator version `1.0.0`. Government rate or rule values must be supplied by the caller.
- **Reference example:** user-supplied zero-rate illustration. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Rates are supplied by you; Aperture does not insert a current market or government rate. The calculation uses a required user-supplied rate and does not claim that it is the current official rate. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `contribution` — money as an exact decimal string plus ISO 4217 currency (`INR 100`)
  - `assumedRate` — human percentage as an exact decimal string per year, yearly compounding (`0`)
  - `periodCount` — safe integer (2)
  - `contributionTiming` — enum or text (`end_of_period`)
- **Output fields:**
  - `estimatedMaturityValue` — money as an exact decimal string plus ISO 4217 currency (`INR 200`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 18. Recurring Deposit (`rd`)

- **Presentation category:** Government Savings Schemes
- **Calculator version:** `1.0.0`
- **Formula:** annuity future value
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** two explicit contributions. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Rates are supplied by you; Aperture does not insert a current market or government rate. The calculation uses a required user-supplied rate and does not claim that it is the current official rate. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `periodicContribution` — money as an exact decimal string plus ISO 4217 currency (`INR 100`)
  - `assumedRate` — human percentage as an exact decimal string per month, monthly compounding (`0`)
  - `contributionCount` — safe integer (2)
  - `contributionTiming` — enum or text (`end_of_period`)
- **Output fields:**
  - `estimatedMaturityValue` — money as an exact decimal string plus ISO 4217 currency (`INR 200`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 19. ROI (`roi`)

- **Presentation category:** Core Interest and Returns
- **Calculator version:** `1.0.0`
- **Formula:** (final − initial) ÷ initial
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** twenty-five percent return. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** No hidden assumptions; all values are explicit inputs.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `initialValue` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `finalValue` — money as an exact decimal string plus ISO 4217 currency (`USD 125`)
- **Output fields:**
  - `returnAmount` — money as an exact decimal string plus ISO 4217 currency (`USD 25`)
  - `returnPercentage` — human percentage as an exact decimal string (`25`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/calculation-foundation.test.ts`, `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 20. Senior Citizens Savings Scheme (`scss`)

- **Presentation category:** Government Savings Schemes
- **Calculator version:** `1.0.0`
- **Formula:** principal × rate ÷ payment count
- **Preset/version policy:** None embedded; calculator version `1.0.0`. Government rate or rule values must be supplied by the caller.
- **Reference example:** twelve income payments. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Rates are supplied by you; Aperture does not insert a current market or government rate. The calculation uses a required user-supplied rate and does not claim that it is the current official rate. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `principal` — money as an exact decimal string plus ISO 4217 currency (`INR 1200`)
  - `assumedRate` — human percentage as an exact decimal string per year, yearly compounding (`12`)
  - `paymentCount` — safe integer (12)
- **Output fields:**
  - `estimatedPeriodicIncome` — money as an exact decimal string plus ISO 4217 currency (`INR 12`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 21. SIP (`sip`)

- **Presentation category:** Investment and Wealth
- **Calculator version:** `1.0.0`
- **Formula:** annuity future value
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** two monthly contributions. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Rates are supplied by you; Aperture does not insert a current market or government rate. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `periodicContribution` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `expectedReturn` — human percentage as an exact decimal string per month, monthly compounding (`1`)
  - `contributionCount` — safe integer (2)
  - `contributionTiming` — enum or text (`end_of_period`)
- **Output fields:**
  - `investedAmount` — money as an exact decimal string plus ISO 4217 currency (`USD 200`)
  - `estimatedValue` — money as an exact decimal string plus ISO 4217 currency (`USD 201`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/calculation-foundation.test.ts`, `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 22. Sukanya Samriddhi Yojana (`ssy`)

- **Presentation category:** Government Savings Schemes
- **Calculator version:** `1.0.0`
- **Formula:** annuity future value
- **Preset/version policy:** None embedded; calculator version `1.0.0`. Government rate or rule values must be supplied by the caller.
- **Reference example:** user-supplied zero-rate illustration. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Rates are supplied by you; Aperture does not insert a current market or government rate. The calculation uses a required user-supplied rate and does not claim that it is the current official rate. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `contribution` — money as an exact decimal string plus ISO 4217 currency (`INR 100`)
  - `assumedRate` — human percentage as an exact decimal string per year, yearly compounding (`0`)
  - `periodCount` — safe integer (2)
  - `contributionTiming` — enum or text (`end_of_period`)
- **Output fields:**
  - `estimatedMaturityValue` — money as an exact decimal string plus ISO 4217 currency (`INR 200`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 23. Step Up SIP (`step-up-sip`)

- **Presentation category:** Investment and Wealth
- **Calculator version:** `1.0.0`
- **Formula:** periodic stepped cash-flow accumulation
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** two stepped contributions. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Rates are supplied by you; Aperture does not insert a current market or government rate. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `initialContribution` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `stepUpRate` — human percentage as an exact decimal string (`10`)
  - `expectedReturn` — human percentage as an exact decimal string per month, monthly compounding (`0`)
  - `contributionCount` — safe integer (2)
  - `contributionTiming` — enum or text (`end_of_period`)
- **Output fields:**
  - `investedAmount` — money as an exact decimal string plus ISO 4217 currency (`USD 210`)
  - `estimatedValue` — money as an exact decimal string plus ISO 4217 currency (`USD 210`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 24. Stock Average (`stock-average`)

- **Presentation category:** Investment and Wealth
- **Calculator version:** `1.0.0`
- **Formula:** sum(quantity × unit price) ÷ sum(quantity)
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** two purchase lots. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** No hidden assumptions; all values are explicit inputs.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `lots[].quantity` — exact decimal string (`2`)
  - `lots[].unitPrice` — money as an exact decimal string plus ISO 4217 currency (`USD 10`)
- **Output fields:**
  - `totalQuantity` — exact decimal string (`3`)
  - `averageUnitPrice` — money as an exact decimal string plus ISO 4217 currency (`USD 12`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 25. SWP (`swp`)

- **Presentation category:** Investment and Wealth
- **Calculator version:** `1.0.0`
- **Formula:** future value less withdrawal annuity
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** three withdrawals. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Rates are supplied by you; Aperture does not insert a current market or government rate. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `initialInvestment` — money as an exact decimal string plus ISO 4217 currency (`USD 1000`)
  - `periodicWithdrawal` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `expectedReturn` — human percentage as an exact decimal string per month, monthly compounding (`0`)
  - `withdrawalCount` — safe integer (3)
  - `withdrawalTiming` — enum or text (`end_of_period`)
- **Output fields:**
  - `estimatedEndingValue` — money as an exact decimal string plus ISO 4217 currency (`USD 700`)
  - `totalWithdrawals` — money as an exact decimal string plus ISO 4217 currency (`USD 300`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/calculation-foundation.test.ts`, `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 26. XIRR (`xirr`)

- **Presentation category:** Core Interest and Returns
- **Calculator version:** `1.0.0`
- **Formula:** Actual/365 Fixed NPV root
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** one-year irregular return. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `cashFlows[].date` — ISO date/time (`2026-01-01`)
  - `cashFlows[].amount` — money as an exact decimal string plus ISO 4217 currency (`USD -1000`)
- **Output fields:**
  - `annualizedRate` — human percentage as an exact decimal string (`9.999999999999999999999979745401344368233114653806`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/calculation-foundation.test.ts`, `packages/finance/test/investment-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 27. Car Loan EMI (`car-loan-emi`)

- **Presentation category:** Loans and EMI
- **Calculator version:** `1.0.0`
- **Formula:** reducing-balance annuity payment
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** zero-rate illustration. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** The result excludes fees, insurance, balloon payments, and lender-specific rules. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `principal` — money as an exact decimal string plus ISO 4217 currency (`USD 1200`)
  - `annualInterestRate` — human percentage as an exact decimal string per year, monthly compounding (`0`)
  - `annualRateKind` — enum or text (`nominal`)
  - `paymentCount` — safe integer (12)
- **Output fields:**
  - `estimatedPeriodicPayment` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `estimatedTotalPayment` — money as an exact decimal string plus ISO 4217 currency (`USD 1200`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/calculation-foundation.test.ts`, `packages/finance/test/regulated-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 28. Compound Interest (`compound-interest`)

- **Presentation category:** Core Interest and Returns
- **Calculator version:** `1.0.0`
- **Formula:** principal × (1 + rate/m)^(m×periods)
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** monthly compounding. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Compounding count must match the rate period and named compounding frequency. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `principal` — money as an exact decimal string plus ISO 4217 currency (`USD 1000`)
  - `interestRate` — human percentage as an exact decimal string per year, monthly compounding (`12`)
  - `periodCount` — safe integer (1)
  - `compoundingCount` — safe integer (12)
- **Output fields:**
  - `estimatedInterest` — money as an exact decimal string plus ISO 4217 currency (`USD 126.825030131969720661201`)
  - `estimatedTotal` — money as an exact decimal string plus ISO 4217 currency (`USD 1126.825030131969720661201`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/calculation-foundation.test.ts`, `packages/finance/test/regulated-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 29. EMI (`emi`)

- **Presentation category:** Loans and EMI
- **Calculator version:** `1.0.0`
- **Formula:** reducing-balance annuity payment
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** zero-rate annual loan. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** The result excludes fees, insurance, penalties, and lender-specific rounding. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `principal` — money as an exact decimal string plus ISO 4217 currency (`USD 1200`)
  - `annualInterestRate` — human percentage as an exact decimal string per year, monthly compounding (`0`)
  - `annualRateKind` — enum or text (`nominal`)
  - `paymentCount` — safe integer (12)
- **Output fields:**
  - `estimatedPeriodicPayment` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `estimatedTotalPayment` — money as an exact decimal string plus ISO 4217 currency (`USD 1200`)
  - `estimatedInterest` — money as an exact decimal string plus ISO 4217 currency (`USD 0`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/calculation-foundation.test.ts`, `packages/finance/test/regulated-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 30. Flat versus Reducing Rate (`flat-vs-reducing-rate`)

- **Presentation category:** Loans and EMI
- **Calculator version:** `1.0.0`
- **Formula:** flat simple-interest total versus reducing-balance amortization total
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** zero-rate comparison. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Payment count is interpreted as monthly and divided by 12 for the flat-rate term. The comparison excludes lender fees and product-specific rounding. Flat rate convention: nominal. Reducing rate convention: nominal. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `principal` — money as an exact decimal string plus ISO 4217 currency (`USD 1200`)
  - `flatRate` — human percentage as an exact decimal string per year, yearly compounding (`0`)
  - `flatRateKind` — enum or text (`nominal`)
  - `reducingRate` — human percentage as an exact decimal string per year, monthly compounding (`0`)
  - `reducingRateKind` — enum or text (`nominal`)
  - `paymentCount` — safe integer (12)
- **Output fields:**
  - `estimatedFlatTotal` — money as an exact decimal string plus ISO 4217 currency (`USD 1200`)
  - `estimatedReducingTotal` — money as an exact decimal string plus ISO 4217 currency (`USD 1200`)
  - `estimatedDifference` — money as an exact decimal string plus ISO 4217 currency (`USD 0`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/calculation-foundation.test.ts`, `packages/finance/test/regulated-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 31. Home Loan EMI (`home-loan-emi`)

- **Presentation category:** Loans and EMI
- **Calculator version:** `1.0.0`
- **Formula:** reducing-balance annuity payment
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** zero-rate illustration. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** The result excludes property charges, insurance, fees, subsidies, and lender-specific rules. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `principal` — money as an exact decimal string plus ISO 4217 currency (`USD 1200`)
  - `annualInterestRate` — human percentage as an exact decimal string per year, monthly compounding (`0`)
  - `annualRateKind` — enum or text (`nominal`)
  - `paymentCount` — safe integer (12)
- **Output fields:**
  - `estimatedPeriodicPayment` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `estimatedTotalPayment` — money as an exact decimal string plus ISO 4217 currency (`USD 1200`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/calculation-foundation.test.ts`, `packages/finance/test/regulated-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 32. Simple Interest (`simple-interest`)

- **Presentation category:** Core Interest and Returns
- **Calculator version:** `1.0.0`
- **Formula:** principal × rate × periods
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** two annual periods. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** The stated rate applies once per input period; no rate conversion is performed. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `principal` — money as an exact decimal string plus ISO 4217 currency (`USD 1000`)
  - `interestRate` — human percentage as an exact decimal string per year, yearly compounding (`5`)
  - `periodCount` — safe integer (2)
- **Output fields:**
  - `estimatedInterest` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `estimatedTotal` — money as an exact decimal string plus ISO 4217 currency (`USD 1100`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/calculation-foundation.test.ts`, `packages/finance/test/regulated-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 33. APY (`apy`)

- **Presentation category:** Retirement and Independence
- **Calculator version:** `1.0.0`
- **Formula:** future value of current balance plus periodic contributions
- **Preset/version policy:** None embedded; calculator version `1.0.0`. Government rate or rule values must be supplied by the caller. Reference input uses caller rule `caller-1` effective `2026-01-01`.
- **Reference example:** caller-supplied APY assumptions. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** No current statutory contribution table, age rule, eligibility rule, or guaranteed pension amount is embedded. The projected value is an estimate and is not a promise, guarantee, or personalized recommendation. Rates are supplied by you; Aperture does not insert a current market or government rate. The calculation uses caller-supplied scheme rules and rates and does not claim they are current official values. Rule caller-1, effective 2026-01-01. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `currentBalance` — money as an exact decimal string plus ISO 4217 currency (`INR 100`)
  - `periodicContribution` — money as an exact decimal string plus ISO 4217 currency (`INR 10`)
  - `contributionCount` — safe integer (2)
  - `assumedRate` — human percentage as an exact decimal string per month, monthly compounding (`0`)
  - `contributionTiming` — enum or text (`end_of_period`)
  - `ruleVersion` — version identifier (`caller-1`)
  - `ruleEffectiveOn` — ISO date/time (`2026-01-01`)
- **Output fields:**
  - `estimatedPensionValue` — money as an exact decimal string plus ISO 4217 currency (`INR 120`)
  - `totalContributions` — money as an exact decimal string plus ISO 4217 currency (`INR 20`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/retirement-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 34. EPF (`epf`)

- **Presentation category:** Retirement and Independence
- **Calculator version:** `1.0.0`
- **Formula:** future value of current balance plus combined periodic contributions
- **Preset/version policy:** None embedded; calculator version `1.0.0`. Government rate or rule values must be supplied by the caller. Reference input uses caller rule `caller-1` effective `2026-01-01`.
- **Reference example:** caller-supplied EPF assumptions. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** No current statutory contribution, wage ceiling, eligibility, interest, or tax rule is embedded. The projected balance is an estimate and is not a promise, guarantee, or personalized recommendation. Rates are supplied by you; Aperture does not insert a current market or government rate. The calculation uses caller-supplied scheme rules and rates and does not claim they are current official values. Rule caller-1, effective 2026-01-01. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `currentBalance` — money as an exact decimal string plus ISO 4217 currency (`INR 100`)
  - `periodicContribution` — money as an exact decimal string plus ISO 4217 currency (`INR 10`)
  - `employerContribution` — money as an exact decimal string plus ISO 4217 currency (`INR 5`)
  - `expectedRate` — human percentage as an exact decimal string per month, monthly compounding (`0`)
  - `contributionCount` — safe integer (2)
  - `contributionTiming` — enum or text (`end_of_period`)
  - `ruleVersion` — version identifier (`caller-1`)
  - `ruleEffectiveOn` — ISO date/time (`2026-01-01`)
- **Output fields:**
  - `estimatedBalance` — money as an exact decimal string plus ISO 4217 currency (`INR 130`)
  - `totalEmployeeContributions` — money as an exact decimal string plus ISO 4217 currency (`INR 20`)
  - `totalEmployerContributions` — money as an exact decimal string plus ISO 4217 currency (`INR 10`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/retirement-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 35. FIRE (`fire`)

- **Presentation category:** Retirement and Independence
- **Calculator version:** `1.0.0`
- **Formula:** maximum of withdrawal-rate target and longevity cash-flow target, compared with projected corpus
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** two-year baseline. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Results are mechanical estimates, not promises, guarantees, or personalized investment recommendations. Returns, inflation, withdrawal rates, and longevity can differ materially from every supplied scenario. Rates are supplied by you; Aperture does not insert a current market or government rate. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `annualExpenses` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `currentAge` — safe integer (30)
  - `retirementAge` — safe integer (32)
  - `longevityAge` — safe integer (34)
  - `existingCorpus` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `annualContribution` — money as an exact decimal string plus ISO 4217 currency (`USD 50`)
  - `contributionTiming` — enum or text (`end_of_period`)
  - `scenarios[].name` — enum or text (`baseline`)
  - `scenarios[].inflationRate` — human percentage as an exact decimal string (`0`)
  - `scenarios[].preRetirementReturn` — human percentage as an exact decimal string per year, yearly compounding (`0`)
  - `scenarios[].preRetirementRateKind` — enum or text (`effective`)
  - `scenarios[].postRetirementReturn` — human percentage as an exact decimal string per year, yearly compounding (`0`)
  - `scenarios[].postRetirementRateKind` — enum or text (`effective`)
  - `scenarios[].withdrawalRate` — human percentage as an exact decimal string (`50`)
- **Output fields:**
  - `targetCorpus` — money as an exact decimal string plus ISO 4217 currency (`USD 200`)
  - `inflationAdjustedAnnualExpenses` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `projectedCorpus` — money as an exact decimal string plus ISO 4217 currency (`USD 200`)
  - `fundingGap` — money as an exact decimal string plus ISO 4217 currency (`USD 0`)
  - `scenarios[].name` — enum or text (`baseline`)
  - `scenarios[].inflationAdjustedAnnualNeed` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `scenarios[].withdrawalRateTarget` — money as an exact decimal string plus ISO 4217 currency (`USD 200`)
  - `scenarios[].longevityTarget` — money as an exact decimal string plus ISO 4217 currency (`USD 200`)
  - `scenarios[].targetCorpus` — money as an exact decimal string plus ISO 4217 currency (`USD 200`)
  - `scenarios[].projectedCorpus` — money as an exact decimal string plus ISO 4217 currency (`USD 200`)
  - `scenarios[].fundingGap` — money as an exact decimal string plus ISO 4217 currency (`USD 0`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/retirement-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 36. Gratuity (`gratuity`)

- **Presentation category:** Retirement and Independence
- **Calculator version:** `1.0.0`
- **Formula:** eligible salary × years of service × benefit factor
- **Preset/version policy:** None embedded; calculator version `1.0.0`. Government rate or rule values must be supplied by the caller. Reference input uses caller rule `caller-1` effective `2026-01-01`.
- **Reference example:** caller-supplied gratuity factor. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** No current eligibility threshold, service-rounding rule, salary definition, ceiling, or tax rule is embedded. The estimated benefit is not a legal determination, promise, guarantee, or personalized recommendation. Rates are supplied by you; Aperture does not insert a current market or government rate. The calculation uses caller-supplied scheme rules and rates and does not claim they are current official values. Rule caller-1, effective 2026-01-01. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `eligibleSalary` — money as an exact decimal string plus ISO 4217 currency (`INR 1000`)
  - `yearsOfService` — safe integer (2)
  - `benefitFactor` — human percentage as an exact decimal string (`5`)
  - `ruleVersion` — version identifier (`caller-1`)
  - `ruleEffectiveOn` — ISO date/time (`2026-01-01`)
- **Output fields:**
  - `estimatedBenefit` — money as an exact decimal string plus ISO 4217 currency (`INR 100`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/retirement-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 37. NPS (`nps`)

- **Presentation category:** Retirement and Independence
- **Calculator version:** `1.0.0`
- **Formula:** future value of current balance and contributions; corpus × annuity allocation × assumed annuity rate
- **Preset/version policy:** None embedded; calculator version `1.0.0`. Government rate or rule values must be supplied by the caller. Reference input uses caller rule `caller-1` effective `2026-01-01`.
- **Reference example:** caller-supplied NPS assumptions. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** No current statutory allocation, eligibility, tax, or annuity rule is embedded. Returns and pension values are estimates, not promises, guarantees, or personalized recommendations. Rates are supplied by you; Aperture does not insert a current market or government rate. The calculation uses caller-supplied scheme rules and rates and does not claim they are current official values. Rule caller-1, effective 2026-01-01. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `currentBalance` — money as an exact decimal string plus ISO 4217 currency (`INR 100`)
  - `contribution` — money as an exact decimal string plus ISO 4217 currency (`INR 10`)
  - `employerContribution` — money as an exact decimal string plus ISO 4217 currency (`INR 5`)
  - `expectedReturn` — human percentage as an exact decimal string per month, monthly compounding (`0`)
  - `contributionCount` — safe integer (2)
  - `contributionTiming` — enum or text (`end_of_period`)
  - `annuityAllocation` — human percentage as an exact decimal string (`40`)
  - `assumedAnnuityRate` — human percentage as an exact decimal string (`5`)
  - `ruleVersion` — version identifier (`caller-1`)
  - `ruleEffectiveOn` — ISO date/time (`2026-01-01`)
- **Output fields:**
  - `estimatedCorpus` — money as an exact decimal string plus ISO 4217 currency (`INR 130`)
  - `totalEmployeeContributions` — money as an exact decimal string plus ISO 4217 currency (`INR 20`)
  - `totalEmployerContributions` — money as an exact decimal string plus ISO 4217 currency (`INR 10`)
  - `estimatedAnnuityPurchase` — money as an exact decimal string plus ISO 4217 currency (`INR 52`)
  - `estimatedLumpSum` — money as an exact decimal string plus ISO 4217 currency (`INR 78`)
  - `estimatedAnnualPension` — money as an exact decimal string plus ISO 4217 currency (`INR 2.6`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/retirement-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`

## 38. Retirement Corpus (`retirement-corpus`)

- **Presentation category:** Retirement and Independence
- **Calculator version:** `1.0.0`
- **Formula:** maximum of withdrawal-rate target and longevity cash-flow target, compared with projected savings
- **Preset/version policy:** None embedded; calculator version `1.0.0`.
- **Reference example:** two-year income horizon. The input schema accepts the example and the result equals the plug-in's registered expected output.
- **Assumptions and disclosures:** Results are estimates, not promises, guarantees, or personalized investment recommendations. The result excludes taxes, fees, sequence risk, and unmodeled changes in income or spending. Rates are supplied by you; Aperture does not insert a current market or government rate. This result is a mechanical estimate based on supplied inputs and is not financial, tax, legal, or investment advice.
- **Inputs and units:**
  - `version` — version identifier (`1.0.0`)
  - `assumptions[]` — optional caller metadata; empty in the reference example
  - `sourceReferences[]` — optional caller metadata; empty in the reference example
  - `currentSavings` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `annualContribution` — money as an exact decimal string plus ISO 4217 currency (`USD 50`)
  - `contributionTiming` — enum or text (`end_of_period`)
  - `desiredAnnualIncome` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `currentAge` — safe integer (30)
  - `retirementAge` — safe integer (32)
  - `longevityAge` — safe integer (34)
  - `scenarios[].name` — enum or text (`baseline`)
  - `scenarios[].inflationRate` — human percentage as an exact decimal string (`0`)
  - `scenarios[].preRetirementReturn` — human percentage as an exact decimal string per year, yearly compounding (`0`)
  - `scenarios[].preRetirementRateKind` — enum or text (`effective`)
  - `scenarios[].postRetirementReturn` — human percentage as an exact decimal string per year, yearly compounding (`0`)
  - `scenarios[].postRetirementRateKind` — enum or text (`effective`)
  - `scenarios[].withdrawalRate` — human percentage as an exact decimal string (`50`)
- **Output fields:**
  - `estimatedCorpus` — money as an exact decimal string plus ISO 4217 currency (`USD 200`)
  - `projectedSavings` — money as an exact decimal string plus ISO 4217 currency (`USD 200`)
  - `fundingGap` — money as an exact decimal string plus ISO 4217 currency (`USD 0`)
  - `scenarios[].name` — enum or text (`baseline`)
  - `scenarios[].inflationAdjustedAnnualNeed` — money as an exact decimal string plus ISO 4217 currency (`USD 100`)
  - `scenarios[].withdrawalRateTarget` — money as an exact decimal string plus ISO 4217 currency (`USD 200`)
  - `scenarios[].longevityTarget` — money as an exact decimal string plus ISO 4217 currency (`USD 200`)
  - `scenarios[].targetCorpus` — money as an exact decimal string plus ISO 4217 currency (`USD 200`)
  - `scenarios[].projectedCorpus` — money as an exact decimal string plus ISO 4217 currency (`USD 200`)
  - `scenarios[].fundingGap` — money as an exact decimal string plus ISO 4217 currency (`USD 0`)

  - `metadata` — calculator ID, version, estimate flag, assumptions, sources, and warnings.
- **Test references:** `packages/finance/test/retirement-calculators.test.ts`, `packages/calculators/test/integration-hardening.test.ts`, `apps/web/tests/calculator-hub.test.tsx`, `apps/mobile/tests/calculator-hub.test.tsx`
