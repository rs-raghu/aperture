import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const migrationName = /^(?<version>\d{14})_(?<name>[a-z0-9_]+)\.sql$/;

async function sqlFiles(directory, scope) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) { if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return []; throw error; }
  return Promise.all(entries.filter((entry) => entry.isFile() && migrationName.test(entry.name)).map(async (entry) => {
    const match = migrationName.exec(entry.name);
    if (!match?.groups) throw new Error(`Invalid migration name: ${entry.name}`);
    const path = resolve(directory, entry.name);
    return Object.freeze({ version: match.groups.version, name: match.groups.name, scope, path, sql: await readFile(path, "utf8") });
  }));
}

export async function discoverMigrations(workspaceRoot = fileURLToPath(new URL("../../..", import.meta.url))) {
  const migrations = await sqlFiles(resolve(workspaceRoot, "supabase", "migrations"), "core");
  const packagesDirectory = resolve(workspaceRoot, "packages");
  const packages = await readdir(packagesDirectory, { withFileTypes: true });
  for (const entry of packages.filter((item) => item.isDirectory())) {
    migrations.push(...await sqlFiles(resolve(packagesDirectory, entry.name, "migrations"), entry.name));
  }
  migrations.sort((left, right) => left.version.localeCompare(right.version) || left.scope.localeCompare(right.scope));
  const versions = new Set();
  for (const migration of migrations) {
    if (versions.has(migration.version)) throw new Error(`Duplicate migration version ${migration.version}.`);
    versions.add(migration.version);
  }
  return Object.freeze(migrations);
}
