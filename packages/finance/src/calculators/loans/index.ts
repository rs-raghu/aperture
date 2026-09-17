export * from "./car-loan-emi.plugin.js";
export * from "./compound-interest.plugin.js";
export * from "./emi.plugin.js";
export * from "./flat-vs-reducing-rate.plugin.js";
export * from "./home-loan-emi.plugin.js";
export * from "./simple-interest.plugin.js";

import { carLoanEmiPlugin } from "./car-loan-emi.plugin.js";
import { compoundInterestPlugin } from "./compound-interest.plugin.js";
import { emiPlugin } from "./emi.plugin.js";
import { flatVsReducingRatePlugin } from "./flat-vs-reducing-rate.plugin.js";
import { homeLoanEmiPlugin } from "./home-loan-emi.plugin.js";
import { simpleInterestPlugin } from "./simple-interest.plugin.js";

export const loanCalculatorPlugins = Object.freeze([carLoanEmiPlugin, compoundInterestPlugin, emiPlugin, flatVsReducingRatePlugin, homeLoanEmiPlugin, simpleInterestPlugin]);
