import { calculateCgpa, calculateGpa, cgpaCalculationInputSchema, gpaCalculationInputSchema } from "@aperture/education";
import { allFinanceCalculatorPlugins } from "@aperture/finance";
import type { ValidationSchema } from "@aperture/validation";

export const calculatorPresentationCategories = [
  { id: "academic", label: "Academic" }, { id: "core-returns", label: "Core Interest and Returns" },
  { id: "investment", label: "Investment and Wealth" }, { id: "loans", label: "Loans and EMI" },
  { id: "income", label: "Income and Salary" }, { id: "taxation", label: "Taxation" },
  { id: "retirement", label: "Retirement and Independence" }, { id: "government-savings", label: "Government Savings Schemes" },
  { id: "economic", label: "Economic and Inflation" },
] as const;

export type CalculatorPresentationCategory = (typeof calculatorPresentationCategories)[number]["id"];
export interface CalculatorPresentationDefinition {
  readonly id: string; readonly title: string; readonly category: CalculatorPresentationCategory; readonly categoryLabel: string;
  readonly version: string; readonly description: string; readonly formula: string; readonly assumptions: readonly string[];
  readonly exampleName: string; readonly exampleInput: Readonly<Record<string, unknown>>; readonly inputSchema: ValidationSchema<unknown>;
  readonly calculate: (input: unknown) => unknown; readonly supportsFinanceScenario: boolean;
}

const labelFor = (category: CalculatorPresentationCategory) => calculatorPresentationCategories.find(({ id }) => id === category)?.label ?? category;
const coreReturnIds = new Set(["simple-interest", "compound-interest", "roi", "cagr", "xirr"]);
const incomeIds = new Set(["net-salary"]);
const governmentSavingsIds = new Set(["ssy", "ppf", "fd", "rd", "nsc", "post-office-mis", "scss"]);

function categoryFor(plugin: (typeof allFinanceCalculatorPlugins)[number]): CalculatorPresentationCategory {
  const id = plugin.manifest.id;
  if (coreReturnIds.has(id)) return "core-returns";
  if (governmentSavingsIds.has(id)) return "government-savings";
  if (plugin.manifest.category === "investment") return "investment";
  if (plugin.manifest.category === "loan") return "loans";
  if (plugin.manifest.category === "income_tax") return incomeIds.has(id) ? "income" : "taxation";
  if (plugin.manifest.category === "retirement") return "retirement";
  return "economic";
}

function assumptionsFor(plugin: (typeof allFinanceCalculatorPlugins)[number]): readonly string[] {
  const manifest = plugin.manifest;
  const disclaimers = "disclaimers" in manifest ? manifest.disclaimers : [];
  return "ratePolicy" in manifest && manifest.ratePolicy === "required_user_input"
    ? [...disclaimers, "Rates are supplied by you; Aperture does not insert a current market or government rate."] : [...disclaimers];
}

function cloneValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (typeof value === "object" && value !== null) return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]));
  return value;
}

function recordInput(value: unknown): Readonly<Record<string, unknown>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Calculator example input must be an object.");
  }
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]));
}

const financePresentations: readonly CalculatorPresentationDefinition[] = allFinanceCalculatorPlugins.map((plugin) => {
  const category = categoryFor(plugin); const example = plugin.examples[0];
  if (!example) throw new Error(`Calculator ${plugin.manifest.id} must provide an example input.`);
  return Object.freeze({ id: plugin.manifest.id, title: plugin.manifest.title, category, categoryLabel: labelFor(category), version: plugin.manifest.version,
    description: plugin.manifest.description, formula: plugin.manifest.formula, assumptions: assumptionsFor(plugin), exampleName: example.name,
    exampleInput: recordInput(example.input), inputSchema: plugin.inputSchema,
    calculate: (input: unknown) => Reflect.apply(plugin.calculate, undefined, [input]), supportsFinanceScenario: true });
});

const academicPresentations: readonly CalculatorPresentationDefinition[] = [
  Object.freeze({ id: "gpa", title: "GPA", category: "academic" as const, categoryLabel: labelFor("academic"), version: "1.0.0",
    description: "Calculates a credit-weighted grade point average from course results.", formula: "sum of credits × grade points ÷ included credits",
    assumptions: ["Grade points use the scale entered below.", "The calculation reuses the Education package formula."], exampleName: "Two equally weighted courses",
    exampleInput: { courses: [{ courseId: "10000000-0000-4000-8000-000000000001", credits: "3", gradePoints: "8", included: true }, { courseId: "10000000-0000-4000-8000-000000000002", credits: "3", gradePoints: "10", included: true }], gradePointScale: "10", zeroCreditPolicy: "reject", rounding: { decimalPlaces: 2, mode: "half-up" } },
    inputSchema: gpaCalculationInputSchema, calculate: (input: unknown) => calculateGpa(gpaCalculationInputSchema.parse(input)), supportsFinanceScenario: false }),
  Object.freeze({ id: "cgpa", title: "CGPA", category: "academic" as const, categoryLabel: labelFor("academic"), version: "1.0.0",
    description: "Calculates a credit-weighted cumulative GPA from semester results.", formula: "sum of semester credits × GPA ÷ included semester credits",
    assumptions: ["Semester GPAs use the scale entered below.", "The calculation reuses the Education package formula."], exampleName: "Two equally weighted semesters",
    exampleInput: { semesters: [{ semesterId: "20000000-0000-4000-8000-000000000001", gpa: "8", credits: "20", included: true }, { semesterId: "20000000-0000-4000-8000-000000000002", gpa: "9", credits: "20", included: true }], gradePointScale: "10", rounding: { decimalPlaces: 2, mode: "half-up" } },
    inputSchema: cgpaCalculationInputSchema, calculate: (input: unknown) => calculateCgpa(cgpaCalculationInputSchema.parse(input)), supportsFinanceScenario: false }),
];

export const allCalculatorPresentations = Object.freeze([...academicPresentations, ...financePresentations]);
export function getCalculatorPresentation(id: string): CalculatorPresentationDefinition | undefined { return allCalculatorPresentations.find((item) => item.id === id); }
