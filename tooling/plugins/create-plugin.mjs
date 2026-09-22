import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const id = process.argv[2];
if (!id || !/^[a-z][a-z0-9-]*$/.test(id)) {
  process.stderr.write("Usage: npm run plugin:create -- <lowercase-plugin-id>\n");
  process.exitCode = 1;
} else {
  const directory = path.join(repositoryRoot, "plugins", id);
  const output = path.join(directory, "aperture.plugin.json");
  const webEntry = path.join(repositoryRoot, "apps", "web", "src", "features", id, "index.ts");
  const mobileEntry = path.join(repositoryRoot, "apps", "mobile", "src", "features", id, "index.ts");
  if ([output, webEntry, mobileEntry].some((candidate) => fs.existsSync(candidate))) {
    process.stderr.write(`Plugin scaffold already exists for ${id}.\n`);
    process.exitCode = 1;
  } else {
    const displayName = id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
    const manifest = {
      schemaVersion: 1,
      id,
      displayName,
      description: `Describe the ${displayName} feature.`,
      version: "0.1.0",
      status: "planned",
      defaultEnabled: false,
      disableAllowed: true,
      order: 100,
      icon: "circle",
      theme: { accent: "#4d6470", surface: "#e7eef1" },
      permissions: [],
      routes: [{ id: `${id}.overview`, label: displayName, description: `Open ${displayName}.`, paths: { web: `/${id}`, mobile: `/${id}` }, navigation: "primary", order: 100, searchable: true, requiresSession: true }],
      widgets: [],
      calculatorModules: [],
      frontends: {
        web: { source: `apps/web/src/features/${id}/index.ts`, import: `../features/${id}/index` },
        mobile: { source: `apps/mobile/src/features/${id}/index.ts`, import: `../features/${id}/index` },
      },
      migrations: [],
    };
    fs.mkdirSync(directory, { recursive: true });
    fs.mkdirSync(path.dirname(webEntry), { recursive: true });
    fs.mkdirSync(path.dirname(mobileEntry), { recursive: true });
    fs.writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`);
    const entryPoint = `export const featureEntryPoint = ${JSON.stringify(id)} as const;\n`;
    fs.writeFileSync(webEntry, entryPoint);
    fs.writeFileSync(mobileEntry, entryPoint);
    process.stdout.write(`Created the ${id} manifest and web/mobile entry points. Run npm run generate:plugins after adding the feature routes.\n`);
  }
}
