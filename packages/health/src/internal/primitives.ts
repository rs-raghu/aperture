import { z } from "@aperture/validation";

export const textSchema = z.string().refine((value) => value.trim().length > 0, "Enter a non-empty value.");
export const nonNegativeDecimalSchema = z.string().regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/, "Enter a non-negative plain decimal string.");
export const positiveDecimalSchema = nonNegativeDecimalSchema.refine((value) => /[1-9]/.test(value), "Enter a value greater than zero.");
// Compare digits directly: Number() can round 100.000000000000000001 down to 100.
export const percentageDecimalSchema = nonNegativeDecimalSchema.refine((value) => {
  const [integer = "", fraction = ""] = value.split(".");
  return integer.length < 3 || (integer === "100" && !/[1-9]/.test(fraction));
}, "Percentage must be between 0 and 100.");
export const countSchema = z.number().finite().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const sequenceSchema = countSchema;
