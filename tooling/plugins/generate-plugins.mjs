import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const pluginsRoot = path.join(repositoryRoot, "plugins");
const checkMode = process.argv.includes("--check");

function fail(message) {
  throw new Error(`Invalid Aperture plugin manifest: ${message}`);
}

function object(value, label) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(`${label} must be an object.`);
  return value;
}

function string(value, label, pattern) {
  if (typeof value !== "string" || value.trim() === "") fail(`${label} must be a non-empty string.`);
  if (pattern && !pattern.test(value)) fail(`${label} has an invalid value: ${value}.`);
  return value;
}

function boolean(value, label) {
  if (typeof value !== "boolean") fail(`${label} must be a boolean.`);
  return value;
}

function number(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) fail(`${label} must be a non-negative safe integer.`);
  return value;
}

function array(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array.`);
  return value;
}

function unique(items, select, label) {
  const seen = new Set();
  for (const item of items) {
    const value = select(item);
    if (seen.has(value)) fail(`duplicate ${label} '${value}'.`);
    seen.add(value);
  }
}

function validateSource(relativePath, label, extension) {
  const value = string(relativePath, label);
  if (path.isAbsolute(value) || value.includes("..")) fail(`${label} must be repository-relative.`);
  if (extension && !value.endsWith(extension)) fail(`${label} must end in ${extension}.`);
  if (!fs.existsSync(path.join(repositoryRoot, value))) fail(`${label} does not exist: ${value}.`);
  return value;
}

function validateImportReference(value, label) {
  const entry = object(value, label);
  return {
    source: validateSource(entry.source, `${label}.source`, ".ts"),
    import: string(entry.import, `${label}.import`),
  };
}

function validateManifest(value, filePath) {
  const manifest = object(value, path.relative(repositoryRoot, filePath));
  if (manifest.schemaVersion !== 1) fail(`${manifest.id ?? filePath}.schemaVersion must be 1.`);
  const id = string(manifest.id, "id", /^[a-z][a-z0-9-]*$/);
  const status = string(manifest.status, `${id}.status`);
  if (!["planned", "enabled", "disabled"].includes(status)) fail(`${id}.status is unsupported.`);
  const routes = array(manifest.routes, `${id}.routes`).map((routeValue, index) => {
    const route = object(routeValue, `${id}.routes[${index}]`);
    const paths = object(route.paths, `${id}.routes[${index}].paths`);
    const navigation = string(route.navigation, `${id}.routes[${index}].navigation`);
    if (!["primary", "secondary", "hidden"].includes(navigation)) fail(`${id}.routes[${index}].navigation is unsupported.`);
    const validatedPaths = {};
    for (const platform of ["web", "mobile"]) {
      const routePath = string(paths[platform], `${id}.routes[${index}].paths.${platform}`);
      if (!routePath.startsWith("/")) fail(`${id}.routes[${index}].paths.${platform} must be absolute within the app.`);
      validatedPaths[platform] = routePath;
    }
    return {
      id: string(route.id, `${id}.routes[${index}].id`, /^[a-z][a-z0-9.-]*$/),
      label: string(route.label, `${id}.routes[${index}].label`),
      description: string(route.description, `${id}.routes[${index}].description`),
      paths: validatedPaths,
      navigation,
      order: number(route.order, `${id}.routes[${index}].order`),
      searchable: boolean(route.searchable, `${id}.routes[${index}].searchable`),
      requiresSession: boolean(route.requiresSession, `${id}.routes[${index}].requiresSession`),
    };
  });
  if (routes.filter(({ navigation }) => navigation === "primary").length !== 1) fail(`${id} must declare exactly one primary route.`);
  unique(routes, (route) => route.id, `route ID in ${id}`);

  const permissions = array(manifest.permissions, `${id}.permissions`).map((permissionValue, index) => {
    const permission = object(permissionValue, `${id}.permissions[${index}]`);
    return {
      id: string(permission.id, `${id}.permissions[${index}].id`, /^[a-z][a-z0-9.-]*$/),
      description: string(permission.description, `${id}.permissions[${index}].description`),
      required: boolean(permission.required, `${id}.permissions[${index}].required`),
    };
  });
  unique(permissions, (permission) => permission.id, `permission ID in ${id}`);

  const widgets = array(manifest.widgets, `${id}.widgets`).map((widgetValue, index) => {
    const widget = object(widgetValue, `${id}.widgets[${index}]`);
    const platforms = array(widget.platforms, `${id}.widgets[${index}].platforms`).map((platform, platformIndex) => {
      const checked = string(platform, `${id}.widgets[${index}].platforms[${platformIndex}]`);
      if (!["web", "mobile"].includes(checked)) fail(`${id}.widgets[${index}] has an unsupported platform.`);
      return checked;
    });
    if (platforms.length === 0) fail(`${id}.widgets[${index}] must target a platform.`);
    unique(platforms, (platform) => platform, `widget platform in ${id}`);
    return {
      id: string(widget.id, `${id}.widgets[${index}].id`, /^[a-z][a-z0-9.-]*$/),
      title: string(widget.title, `${id}.widgets[${index}].title`),
      description: string(widget.description, `${id}.widgets[${index}].description`),
      platforms,
      order: number(widget.order, `${id}.widgets[${index}].order`),
      defaultEnabled: boolean(widget.defaultEnabled, `${id}.widgets[${index}].defaultEnabled`),
    };
  });
  unique(widgets, (widget) => widget.id, `widget ID in ${id}`);

  const calculatorModules = array(manifest.calculatorModules, `${id}.calculatorModules`).map((moduleValue, index) => {
    const module = validateImportReference(moduleValue, `${id}.calculatorModules[${index}]`);
    return { id: string(moduleValue.id, `${id}.calculatorModules[${index}].id`, /^[a-z][a-z0-9.-]*$/), ...module };
  });
  unique(calculatorModules, (module) => module.id, `calculator module ID in ${id}`);

  const frontendsValue = object(manifest.frontends, `${id}.frontends`);
  const frontends = {};
  for (const platform of ["web", "mobile"]) {
    if (frontendsValue[platform] !== undefined) frontends[platform] = validateImportReference(frontendsValue[platform], `${id}.frontends.${platform}`);
  }
  if (Object.keys(frontends).length === 0) fail(`${id}.frontends must declare web or mobile.`);

  const migrations = array(manifest.migrations, `${id}.migrations`).map((migration, index) => validateSource(migration, `${id}.migrations[${index}]`, ".sql"));
  unique(migrations, (migration) => migration, `migration in ${id}`);

  const theme = object(manifest.theme, `${id}.theme`);
  const normalized = {
    schemaVersion: 1,
    id,
    displayName: string(manifest.displayName, `${id}.displayName`),
    description: string(manifest.description, `${id}.description`),
    version: string(manifest.version, `${id}.version`, /^\d+\.\d+\.\d+$/),
    status,
    defaultEnabled: boolean(manifest.defaultEnabled, `${id}.defaultEnabled`),
    disableAllowed: boolean(manifest.disableAllowed, `${id}.disableAllowed`),
    order: number(manifest.order, `${id}.order`),
    icon: string(manifest.icon, `${id}.icon`, /^[a-z][a-z0-9-]*$/),
    theme: {
      accent: string(theme.accent, `${id}.theme.accent`, /^#[0-9a-fA-F]{6}$/),
      surface: string(theme.surface, `${id}.theme.surface`, /^#[0-9a-fA-F]{6}$/),
    },
    permissions,
    routes,
    widgets,
    calculatorModules,
    frontends,
    ...(manifest.backend === undefined ? {} : { backend: validateImportReference(manifest.backend, `${id}.backend`) }),
    migrations,
  };
  if (!normalized.disableAllowed && !normalized.defaultEnabled) fail(`${id} cannot be both required and disabled by default.`);
  return normalized;
}

function loadManifests() {
  if (!fs.existsSync(pluginsRoot)) fail("plugins directory does not exist.");
  const files = fs.readdirSync(pluginsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(pluginsRoot, entry.name, "aperture.plugin.json"))
    .filter((filePath) => fs.existsSync(filePath))
    .sort();
  if (files.length === 0) fail("no aperture.plugin.json files were found.");
  const manifests = files.map((filePath) => validateManifest(JSON.parse(fs.readFileSync(filePath, "utf8")), filePath))
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
  unique(manifests, (manifest) => manifest.id, "feature ID");
  unique(manifests.flatMap((manifest) => manifest.routes), (route) => route.id, "route ID");
  for (const platform of ["web", "mobile"]) unique(manifests.flatMap((manifest) => manifest.routes.map((route) => route.paths[platform])), (routePath) => routePath, `${platform} route path`);
  unique(manifests.flatMap((manifest) => manifest.widgets), (widget) => widget.id, "widget ID");
  unique(manifests.flatMap((manifest) => manifest.calculatorModules), (module) => module.id, "calculator module ID");
  unique(manifests.flatMap((manifest) => manifest.migrations), (migration) => migration, "migration path");
  return manifests;
}

function featureRegistrySource(manifests) {
  return `/* Generated by tooling/plugins/generate-plugins.mjs. Do not edit directly. */\nimport type { FeatureManifest } from "./feature-manifest.js";\n\nexport const generatedFeatureManifests = ${JSON.stringify(manifests, null, 2)} as const satisfies readonly FeatureManifest[];\n`;
}

function frontendRegistrySource(manifests, platform) {
  const entries = manifests.flatMap((manifest) => manifest.frontends[platform] ? [[manifest.id, manifest.frontends[platform].import]] : []);
  const name = `${platform}FeatureModuleLoaders`;
  return `/* Generated by tooling/plugins/generate-plugins.mjs. Do not edit directly. */\nimport type { FeatureId } from "@aperture/feature-registry";\n\nexport type FeatureModuleLoader = () => Promise<unknown>;\n\nexport const ${name}: Readonly<Partial<Record<FeatureId, FeatureModuleLoader>>> = Object.freeze({\n${entries.map(([id, specifier]) => `  ${JSON.stringify(id)}: () => import(${JSON.stringify(specifier)}),`).join("\n")}\n});\n\nexport function preloadFeatureFrontend(featureId: FeatureId): void {\n  void ${name}[featureId]?.();\n}\n`;
}

function writeOrCheck(relativePath, content) {
  const outputPath = path.join(repositoryRoot, relativePath);
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8").replaceAll("\r\n", "\n") : "";
  if (checkMode) {
    if (current !== content) {
      process.stderr.write(`${relativePath} is out of date. Run npm run generate:plugins.\n`);
      process.exitCode = 1;
    }
    return;
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content);
}

try {
  const manifests = loadManifests();
  writeOrCheck("packages/feature-registry/src/feature-manifests.generated.ts", featureRegistrySource(manifests));
  writeOrCheck("apps/web/src/generated/plugin-frontends.generated.ts", frontendRegistrySource(manifests, "web"));
  writeOrCheck("apps/mobile/src/generated/plugin-frontends.generated.ts", frontendRegistrySource(manifests, "mobile"));
  if (!checkMode) process.stdout.write(`Generated registries for ${manifests.length} Aperture plugins.\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
