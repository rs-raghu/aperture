import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const packageRoot = path.resolve(import.meta.dirname, "..");
const sourceRoot = path.join(packageRoot, "src");
const outputPath = path.join(sourceRoot, "generated", "finance.schemas.ts");
const typeOutputPath = path.join(sourceRoot, "generated", "finance.types.d.ts");
const fixtureOutputPath = path.join(packageRoot, "test", "generated", "finance.fixtures.ts");

function declarationFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "generated" ? [] : declarationFiles(entryPath);
    return entry.name.endsWith(".d.ts") && entry.name !== "index.d.ts" ? [entryPath] : [];
  });
}

function exported(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function schemaVariable(name) {
  const words = name.match(/[A-Z]+(?=[A-Z][a-z]|$)|[A-Z]?[a-z]+|\d+/g) ?? [name];
  return `${words.map((word, index) => index === 0 ? word.toLowerCase() : `${word[0]?.toUpperCase()}${word.slice(1).toLowerCase()}`).join("")}Schema`;
}

const declarations = new Map();
const operations = [];
const repositories = [];

for (const filePath of declarationFiles(sourceRoot).sort()) {
  const relativePath = path.relative(sourceRoot, filePath).replaceAll("\\", "/");
  const source = ts.createSourceFile(filePath, fs.readFileSync(filePath, "utf8"), ts.ScriptTarget.Latest, true);
  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement) && exported(statement) && statement.name) {
      operations.push({ name: statement.name.text, source: relativePath });
      continue;
    }
    if (!exported(statement) || (!ts.isInterfaceDeclaration(statement) && !ts.isTypeAliasDeclaration(statement))) continue;
    const name = statement.name.text;
    if (declarations.has(name)) throw new Error(`Duplicate Finance declaration: ${name}`);
    declarations.set(name, { name, node: statement, source: relativePath });
    if (/Repository$/.test(name) || name === "FinanceRepository") repositories.push({ name, source: relativePath });
  }
}

function hasMethods(node) {
  return ts.isInterfaceDeclaration(node) && node.members.some((member) =>
    ts.isMethodSignature(member) || ts.isCallSignatureDeclaration(member) || ts.isConstructSignatureDeclaration(member));
}

function schemaCandidate({ name, node }) {
  if (node.typeParameters?.length) return false;
  if (hasMethods(node)) return false;
  if (/Repository$/.test(name) || name === "FinanceRepository" || name === "FinanceService") return false;
  return !(ts.isTypeAliasDeclaration(node) && ts.isFunctionTypeNode(node.type));
}

const candidates = new Map([...declarations].filter(([, declaration]) => schemaCandidate(declaration)));

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  throw new Error(`Unsupported Finance property name: ${node.getText()}`);
}

function inheritedProperties(name, visiting = new Set()) {
  if (visiting.has(name)) throw new Error(`Circular Finance inheritance involving ${name}`);
  const declaration = declarations.get(name);
  if (!declaration || !ts.isInterfaceDeclaration(declaration.node)) return [];
  const next = new Set(visiting).add(name);
  const properties = [];
  for (const clause of declaration.node.heritageClauses ?? []) {
    for (const type of clause.types) {
      if (!ts.isIdentifier(type.expression)) throw new Error(`Unsupported Finance heritage: ${type.getText()}`);
      properties.push(...inheritedProperties(type.expression.text, next));
    }
  }
  for (const member of declaration.node.members) {
    if (ts.isPropertySignature(member) && member.type && member.name) properties.push(member);
  }
  return properties;
}

function numericSchema(ownerName, fieldName) {
  if (fieldName === "limit") return "financePositiveIntegerSchema.max(100)";
  if (/Input$/.test(ownerName) && /(count|years|yearsOfService|rowNumber|sequence)$/i.test(fieldName)) {
    return "financePositiveIntegerSchema";
  }
  return "financeNonNegativeIntegerSchema";
}

function stringSchema(aliasName, fieldName) {
  if (aliasName === "DecimalString" || aliasName === "MoneyAmount" || aliasName === "PercentageValue" || aliasName === "InterestRateValue") return "financeDecimalStringSchema";
  if (aliasName === "CurrencyCode") return "financeCurrencyCodeSchema";
  if (aliasName === "IsoDate") return "financeIsoDateSchema";
  if (aliasName === "IsoDateTime") return "financeIsoDateTimeSchema";
  if (aliasName === "FiscalYearId" || fieldName === "financialYear") return "financeFiscalYearSchema";
  if (aliasName === "CalculatorVersion" || /Version$/.test(aliasName) || /version$/i.test(fieldName)) return "financeVersionSchema";
  if (/Id$/.test(aliasName) || /Id$/.test(fieldName)) return "financeIdentifierSchema";
  if (fieldName === "cursor") return "financeCursorSchema";
  return "financeTextSchema";
}

function objectLiteralSchema(node, ownerName) {
  const fields = node.members.filter(ts.isPropertySignature).map((member) => {
    if (!member.type || !member.name) throw new Error(`Unsupported Finance type literal member: ${member.getText()}`);
    const name = propertyName(member.name);
    const base = schemaForType(member.type, ownerName, name);
    return `    ${JSON.stringify(name)}: ${base}${member.questionToken ? ".optional()" : ""},`;
  });
  return `z.strictObject({\n${fields.join("\n")}\n  }).readonly()`;
}

function schemaForType(node, ownerName, fieldName = "") {
  if (node.kind === ts.SyntaxKind.StringKeyword) return stringSchema(ownerName, fieldName);
  if (node.kind === ts.SyntaxKind.NumberKeyword) return numericSchema(ownerName, fieldName);
  if (node.kind === ts.SyntaxKind.BooleanKeyword) return "z.boolean()";
  if (node.kind === ts.SyntaxKind.UnknownKeyword) return "z.unknown()";
  if (node.kind === ts.SyntaxKind.NullKeyword) return "z.null()";
  if (ts.isLiteralTypeNode(node)) {
    if (ts.isStringLiteral(node.literal) || ts.isNumericLiteral(node.literal)) return `z.literal(${JSON.stringify(node.literal.text)})`;
    if (node.literal.kind === ts.SyntaxKind.TrueKeyword) return "z.literal(true)";
    if (node.literal.kind === ts.SyntaxKind.FalseKeyword) return "z.literal(false)";
  }
  if (ts.isArrayTypeNode(node)) return `z.array(${schemaForType(node.elementType, ownerName, fieldName)}).readonly()`;
  if (ts.isTypeOperatorNode(node)) return schemaForType(node.type, ownerName, fieldName);
  if (ts.isParenthesizedTypeNode(node)) return schemaForType(node.type, ownerName, fieldName);
  if (ts.isTypeLiteralNode(node)) return objectLiteralSchema(node, ownerName);
  if (ts.isUnionTypeNode(node)) {
    const literals = node.types.filter(ts.isLiteralTypeNode);
    if (literals.length === node.types.length && literals.every((entry) => ts.isStringLiteral(entry.literal))) {
      const values = literals.map((entry) => JSON.stringify(entry.literal.text));
      return values.length === 1 ? `z.literal(${values[0]})` : `z.enum([${values.join(", ")}])`;
    }
    const options = node.types.map((entry) => schemaForType(entry, ownerName, fieldName));
    return options.length === 1 ? options[0] : `z.union([${options.join(", ")}])`;
  }
  if (ts.isTypeReferenceNode(node)) {
    const referenceName = node.typeName.getText();
    if ((referenceName === "Readonly" || referenceName === "Array" || referenceName === "ReadonlyArray") && node.typeArguments?.[0]) {
      const inner = schemaForType(node.typeArguments[0], ownerName, fieldName);
      return referenceName === "Readonly" ? inner : `z.array(${inner}).readonly()`;
    }
    if (referenceName === "Record" && node.typeArguments?.[1]) {
      return `z.record(z.string(), ${schemaForType(node.typeArguments[1], ownerName, fieldName)}).readonly()`;
    }
    if (candidates.has(referenceName)) return `z.lazy(() => ${schemaVariable(referenceName)})`;
    throw new Error(`No runtime Finance schema for referenced type ${referenceName} in ${ownerName}.${fieldName}`);
  }
  throw new Error(`Unsupported Finance type ${node.getText()} in ${ownerName}.${fieldName}`);
}

function stringFixture(aliasName, fieldName) {
  if (aliasName === "DecimalString" || aliasName === "MoneyAmount" || aliasName === "PercentageValue" || aliasName === "InterestRateValue") return JSON.stringify("123.45");
  if (aliasName === "CurrencyCode") return JSON.stringify("USD");
  if (aliasName === "IsoDate") return JSON.stringify("2026-01-15");
  if (aliasName === "IsoDateTime") return JSON.stringify("2026-01-15T12:00:00.123456789Z");
  if (aliasName === "FiscalYearId" || fieldName === "financialYear") return JSON.stringify("2026-27");
  if (aliasName === "CalculatorVersion" || /Version$/.test(aliasName) || /version$/i.test(fieldName)) return JSON.stringify("1.0.0");
  if (/Id$/.test(aliasName) || /Id$/.test(fieldName)) return JSON.stringify("fixture-id");
  if (fieldName === "cursor") return JSON.stringify("fixture-cursor");
  return JSON.stringify("fixture-value");
}

function fixtureForType(node, ownerName, fieldName = "") {
  if (node.kind === ts.SyntaxKind.StringKeyword) return stringFixture(ownerName, fieldName);
  if (node.kind === ts.SyntaxKind.NumberKeyword) return "1";
  if (node.kind === ts.SyntaxKind.BooleanKeyword) return "false";
  if (node.kind === ts.SyntaxKind.UnknownKeyword) return "{}";
  if (node.kind === ts.SyntaxKind.NullKeyword) return "null";
  if (ts.isLiteralTypeNode(node)) {
    if (ts.isStringLiteral(node.literal)) return JSON.stringify(node.literal.text);
    if (ts.isNumericLiteral(node.literal)) return node.literal.text;
    if (node.literal.kind === ts.SyntaxKind.TrueKeyword) return "true";
    if (node.literal.kind === ts.SyntaxKind.FalseKeyword) return "false";
  }
  if (ts.isArrayTypeNode(node)) return "[]";
  if (ts.isTypeOperatorNode(node)) return fixtureForType(node.type, ownerName, fieldName);
  if (ts.isParenthesizedTypeNode(node)) return fixtureForType(node.type, ownerName, fieldName);
  if (ts.isTypeLiteralNode(node)) return fixtureObject(node.members.filter(ts.isPropertySignature), ownerName);
  if (ts.isUnionTypeNode(node)) return fixtureForType(node.types[0], ownerName, fieldName);
  if (ts.isTypeReferenceNode(node)) {
    const referenceName = node.typeName.getText();
    if (referenceName === "Readonly" && node.typeArguments?.[0]) return fixtureForType(node.typeArguments[0], ownerName, fieldName);
    if ((referenceName === "Array" || referenceName === "ReadonlyArray") && node.typeArguments?.[0]) return "[]";
    if (referenceName === "Record") return "{}";
    if (candidates.has(referenceName)) return `financeSchemaFixture(${JSON.stringify(referenceName)})`;
  }
  throw new Error(`No Finance fixture for ${node.getText()} in ${ownerName}.${fieldName}`);
}

function fixtureObject(members, ownerName) {
  const properties = members.filter((member) => member.type && member.name);
  const required = properties.filter((member) => !member.questionToken);
  const selected = required.length > 0 ? required : properties.slice(0, 1);
  const fields = selected.map((member) => {
    const name = propertyName(member.name);
    return `      ${JSON.stringify(name)}: ${fixtureForType(member.type, ownerName, name)},`;
  });
  return `{\n${fields.join("\n")}\n    }`;
}

function fixtureForDeclaration(name, node) {
  if (ts.isInterfaceDeclaration(node)) return fixtureObject(inheritedProperties(name), name);
  return fixtureForType(node.type, name);
}

function objectSchema(name, node) {
  const members = inheritedProperties(name);
  const fields = members.map((member) => {
    const fieldName = propertyName(member.name);
    const base = schemaForType(member.type, name, fieldName);
    return `  ${JSON.stringify(fieldName)}: ${base}${member.questionToken ? ".optional()" : ""},`;
  });
  let expression = `z.strictObject({\n${fields.join("\n")}\n})`;
  const fieldNames = new Set(members.map((member) => propertyName(member.name)));
  if (fieldNames.has("startsOn") && fieldNames.has("endsOn")) {
    expression += `.refine((value) => value.startsOn === undefined || value.endsOn === undefined || value.startsOn <= value.endsOn, { message: "Start date must not follow end date", path: ["endsOn"] })`;
  }
  if (fieldNames.has("createdAt") && fieldNames.has("updatedAt")) {
    expression += `.refine((value) => compareIsoDateTimes(value.createdAt, value.updatedAt) <= 0, { message: "Created timestamp must not follow updated timestamp", path: ["updatedAt"] })`;
  }
  if (/^Update.+Input$/.test(name)) {
    expression += `.refine((value) => hasDefinedProperty(value), { message: "At least one update field is required" })`;
  }
  return `${expression}.readonly()`;
}

const schemaLines = [];
for (const [name, declaration] of [...candidates].sort(([left], [right]) => left.localeCompare(right))) {
  const expression = ts.isInterfaceDeclaration(declaration.node)
    ? objectSchema(name, declaration.node)
    : schemaForType(declaration.node.type, name);
  schemaLines.push(`export const ${schemaVariable(name)} = ${expression};`);
}

const schemaEntries = [...candidates.keys()].sort().map((name) => `  ${JSON.stringify(name)}: ${schemaVariable(name)},`);
const inventoryEntries = (items) => items.sort((left, right) => left.name.localeCompare(right.name)).map((item) =>
  `    { name: ${JSON.stringify(item.name)}, source: ${JSON.stringify(item.source)} },`).join("\n");

const output = `/* This file is generated by scripts/generate-schemas.mjs. Do not edit directly. */
import { z } from "@aperture/validation";
import {
  compareIsoDateTimes,
  financeCurrencyCodeSchema,
  financeCursorSchema,
  financeDecimalStringSchema,
  financeFiscalYearSchema,
  financeIdentifierSchema,
  financeIsoDateSchema,
  financeIsoDateTimeSchema,
  financeNonNegativeIntegerSchema,
  financePositiveIntegerSchema,
  financeTextSchema,
  financeVersionSchema,
  hasDefinedProperty,
} from "../finance.validation.js";

${schemaLines.join("\n\n")}

export const financeSchemas = {
${schemaEntries.join("\n")}
} as const;

export type FinanceSchemaName = keyof typeof financeSchemas;

export const financeDeclarationInventory = {
  schemas: Object.freeze(Object.keys(financeSchemas)),
  repositories: [
${inventoryEntries(repositories)}
  ],
  operations: [
${inventoryEntries(operations)}
  ],
} as const;
`;

const fixtureEntries = [...candidates].sort(([left], [right]) => left.localeCompare(right)).map(([name, declaration]) =>
  `  ${JSON.stringify(name)}: (): unknown => (${fixtureForDeclaration(name, declaration.node)}),`);
const fixtureOutput = `/* This file is generated by scripts/generate-schemas.mjs. Do not edit directly. */
export function financeSchemaFixture(name: string): unknown {
  const factory = financeSchemaFixtures[name];
  if (!factory) throw new Error(\`Missing generated Finance fixture: \${name}\`);
  return factory();
}

export const financeSchemaFixtures: Readonly<Record<string, () => unknown>> = {
${fixtureEntries.join("\n")}
};
`;
const typeOutput = `/* This file is generated by scripts/generate-schemas.mjs. Do not edit directly. */\n${fs.readFileSync(path.join(sourceRoot, "index.d.ts"), "utf8").split(/\r?\n/).filter((line) => line.startsWith("export type ")).join("\n")}\n`;

if (process.argv.includes("--check")) {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
  const currentFixtures = fs.existsSync(fixtureOutputPath) ? fs.readFileSync(fixtureOutputPath, "utf8") : "";
  const currentTypes = fs.existsSync(typeOutputPath) ? fs.readFileSync(typeOutputPath, "utf8") : "";
  if (current !== output || currentFixtures !== fixtureOutput || currentTypes !== typeOutput) {
    console.error("Finance schemas are out of date. Run npm run generate --workspace @aperture/finance.");
    process.exitCode = 1;
  }
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.mkdirSync(path.dirname(fixtureOutputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
  fs.writeFileSync(fixtureOutputPath, fixtureOutput);
  fs.writeFileSync(typeOutputPath, typeOutput);
  console.log(`Generated ${candidates.size} Finance schemas, ${repositories.length} repository contracts, and ${operations.length} operations.`);
}
