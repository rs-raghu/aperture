import { Decimal } from "decimal.js";
import { z } from "@aperture/validation";

import { nonNegativeDecimalStringSchema } from "../education.types.js";

export const calculationDecimalSchema = nonNegativeDecimalStringSchema;

export const positiveCalculationDecimalSchema = calculationDecimalSchema.refine(
  (value) => new Decimal(value).greaterThan(0),
  "Expected a decimal value greater than zero.",
);

export const calculationPercentageSchema = calculationDecimalSchema.refine(
  (value) => new Decimal(value).lessThanOrEqualTo(100),
  "Expected a percentage from 0 through 100.",
);

export const calculationIdentifierSchema = z.string().trim().min(1).max(200);
