interface InstantParts {
  readonly epochMilliseconds: number;
  readonly subMillisecondFraction: string;
}

function instantParts(value: string): InstantParts {
  const fraction = /\.(\d+)(?=Z|[+-])/.exec(value)?.[1] ?? "";
  return {
    epochMilliseconds: Date.parse(value),
    subMillisecondFraction: fraction.padEnd(9, "0").slice(3),
  };
}

/** Compares validated RFC 3339 timestamps as absolute instants through nanosecond precision. */
export function compareIsoTimestamps(left: string, right: string): number {
  const leftParts = instantParts(left);
  const rightParts = instantParts(right);
  if (leftParts.epochMilliseconds !== rightParts.epochMilliseconds) {
    return leftParts.epochMilliseconds - rightParts.epochMilliseconds;
  }
  return leftParts.subMillisecondFraction < rightParts.subMillisecondFraction
    ? -1
    : leftParts.subMillisecondFraction > rightParts.subMillisecondFraction
      ? 1
      : 0;
}

export function timestampInRange(timestamp: string, startsAt: string, endsAt: string): boolean {
  return compareIsoTimestamps(timestamp, startsAt) >= 0 && compareIsoTimestamps(timestamp, endsAt) <= 0;
}
