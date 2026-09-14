/** Entity-local checks only; no clock, storage, conversions, or interpretation. */
export function hasDefinedUpdate(value: Readonly<Record<string, unknown>>): boolean {
  return Object.values(value).some((field) => field !== undefined);
}

// Compare absolute seconds and then the supplied fractional precision separately.
// Date.parse alone truncates fractions beyond milliseconds.
function instantParts(value: string): readonly [number, string] {
  const fraction = /\.(\d+)(?=Z|[+-])/.exec(value)?.[1] ?? "";
  return [Date.parse(value.replace(/\.\d+(?=Z|[+-])/, "")), fraction.padEnd(9, "0")];
}

export function orderedInstants(start?: string, end?: string): boolean {
  if (start === undefined || end === undefined) return true;
  const [startSecond, startFraction] = instantParts(start);
  const [endSecond, endFraction] = instantParts(end);
  return endSecond > startSecond || (endSecond === startSecond && endFraction >= startFraction);
}

export function orderedDates(start?: string, end?: string): boolean {
  return start === undefined || end === undefined || end >= start;
}
