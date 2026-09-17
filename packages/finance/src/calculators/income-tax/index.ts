export * from "./gst.plugin.js";
export * from "./hra.plugin.js";
export * from "./income-tax.plugin.js";
export * from "./salary.plugin.js";
export * from "./tds.plugin.js";

import { gstPlugin } from "./gst.plugin.js";
import { hraPlugin } from "./hra.plugin.js";
import { incomeTaxPlugin } from "./income-tax.plugin.js";
import { netSalaryPlugin } from "./salary.plugin.js";
import { tdsPlugin } from "./tds.plugin.js";

export const incomeTaxCalculatorPlugins = Object.freeze([gstPlugin, hraPlugin, incomeTaxPlugin, netSalaryPlugin, tdsPlugin]);
