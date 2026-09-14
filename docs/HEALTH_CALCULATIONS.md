# Health calculations

Phase 12 implements the complete set of 11 calculation contracts declared by Health in Phase 2. Each function is pure, synchronous, deterministic, validated at its input and output boundaries, independent of storage and the clock, and available from both `@aperture/health` and `@aperture/health/calculations`.

## Public inventory

| Function | Formula or aggregation | Output unit | Estimate |
| --- | --- | --- | --- |
| `calculateBmi` | weight in kg / height in metres² | kg/m² | No |
| `calculateBmr` | Mifflin-St Jeor equation | kcal/day | Yes |
| `calculateHeartRateZones` | percentage of maximum HR, or Karvonen heart-rate reserve when resting HR is supplied | beats/minute | Yes |
| `calculateHydrationSummary` | sum after volume conversion | requested volume unit | No |
| `estimateOneRepMax` | Epley: weight × (1 + repetitions / 30); one repetition returns the supplied weight | supplied weight unit | Yes |
| `calculateRecoverySummary` | arithmetic mean per recorded one-to-ten field | one-to-ten decimal | Yes |
| `calculateRunningPace` | elapsed seconds / distance in the requested pace distance | seconds/km or seconds/mile | No |
| `calculateRunningSummary` | converted distance and duration sums; pace from the aggregate totals | requested distance, seconds, and seconds/km or seconds/mile | No |
| `calculateSleepSummary` | converted duration sum and arithmetic mean | requested duration unit | No |
| `calculateTdee` | basal energy × caller-supplied activity factor | supplied energy unit/day | Yes |
| `calculateWorkoutVolume` | sum of repetitions × converted set weight | first set's weight-repetition unit | No |

## Formula choices and assumptions

BMI follows the metric formula documented by the [US Centers for Disease Control and Prevention](https://www.cdc.gov/bmi/about/index.html). Aperture returns only the calculated number. It does not attach a category or interpretation.

BMR uses the Mifflin-St Jeor equation described by Mifflin et al., *American Journal of Clinical Nutrition* 1990, DOI `10.1093/ajcn/51.2.241`: `10 × kg + 6.25 × cm − 5 × age + constant`. The constants are `5` for `male` and `-161` for `female`. The approved contract also permits `unspecified`; its explicit neutral arithmetic assumption is the midpoint of those constants, `-78`. This is an estimate rather than a measured metabolic rate.

Heart-rate zones treat each adjacent pair of strictly increasing percentage boundaries as a zone. Without resting heart rate, a bound is `maximum × percentage`. With resting heart rate, it is `resting + (maximum − resting) × percentage`. The function does not estimate maximum heart rate from age and does not name training intensities.

The one-repetition maximum estimate uses the Epley equation. It requires at least one repetition. Its result is a mathematical estimate and is not a lifting recommendation or safety limit.

TDEE multiplies a supplied basal-energy value by a supplied positive activity factor. Aperture does not select an activity factor or infer it from user records.

Recovery averages use only entries in which the individual rating is present. Physiological fields remain structurally validated but are not summarized because the approved result contract contains no corresponding output. An empty collection returns a count of zero and no averages.

Running summaries always express total duration in seconds. Average pace is omitted when total distance or total duration is zero. Metric output distances use seconds per kilometre; imperial output distances use seconds per mile. Sleep and hydration summaries return zero totals for empty collections and omit a sleep average when there are no records.

Workout volume uses the first set's weight unit as the output unit and converts all other sets before summation. At least one set is required by the calculation schema.

## Conversions and precision

Conversions use decimal arithmetic and these factors:

| Conversion | Factor |
| --- | ---: |
| pound to kilogram | 0.45359237 |
| inch to centimetre | 2.54 |
| kilometre to metre | 1000 |
| foot to metre | 0.3048 |
| mile to metre | 1609.344 |
| minute to second | 60 |
| hour to second | 3600 |
| litre to millilitre | 1000 |
| US fluid ounce to millilitre | 29.5735295625 |

The length, mass, and US volume relationships follow [NIST SI conversion guidance](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8). `fluid_ounce` means a US fluid ounce; the contract does not define an Imperial fluid-ounce variant.

All decimal inputs remain strings. Calculations use `decimal.js`; intermediate operations are not rounded. Decimal outputs are rounded once to at most 12 decimal places using round-half-up and omit trailing zeroes. Heart-rate bounds are numbers because the approved contract uses numeric heart-rate values; they are rounded to at most two decimal places using the same mode. Inputs must be finite and outputs are validated before return.

## Safety boundary

These functions perform arithmetic only. They do not diagnose, screen, classify results, identify normal or dangerous ranges, prescribe intake or activity, recommend training intensity, calculate medication doses, alert the user, or replace measurement by a qualified professional. UI phases must preserve estimate flags and must not add clinical interpretations without a separately approved contract and evidence review.

## Deferred extensions

Blood-pressure summaries, nutrition totals, speed conversion, sleep consistency, heart-rate-variability summaries, trends, and percentage-change calculations are useful candidates, but Phase 2 declared no matching calculation contracts. They remain future contract work rather than additions to Phase 12.

## Verification

The Health suite executes every calculation, metric and imperial equivalents, mixed-unit aggregates, zero and empty cases allowed by the contracts, invalid values, non-finite numeric values, strict-object rejection, estimate flags, deterministic rounding, and input immutability. The package build and public-export tests verify both runtime entry points contain implemented values rather than declaration-only functions.
