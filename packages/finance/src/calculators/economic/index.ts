export * from "./inflation-adjustment.plugin.js";
import { inflationAdjustedValuePlugin } from "./inflation-adjustment.plugin.js";
export const economicCalculatorPlugins = Object.freeze([inflationAdjustedValuePlugin]);
