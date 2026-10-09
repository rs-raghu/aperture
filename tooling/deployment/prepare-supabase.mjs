import { createHash } from "node:crypto";
import { mkdir, lstat, readFile, writeFile, realpath, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { discoverMigrations } from "../../packages/database/src/migration-discovery.mjs";

const digest = (value) => createHash("sha256").update(value).digest("hex");
async function rejectSymlink(path) {
  try { if ((await lstat(path)).isSymbolicLink()) throw new Error("Migration staging must not contain symbolic links."); }
  catch (failure) { if (failure?.code !== "ENOENT") throw failure; }
}
async function store(path, content, check) {
  await rejectSymlink(path);
  try { if (await readFile(path, "utf8") !== content) throw new Error("Migration staging differs from source. Preserve any linked target information and prepare a fresh local staging directory."); }
  catch (failure) {
    if (failure?.code !== "ENOENT") throw failure;
    if (check) throw new Error("Migration staging is missing. Run npm run deployment:prepare.");
    await writeFile(path, content, { flag: "wx" });
  }
}
export async function prepareSupabase(workspaceRoot, { check = false } = {}) {
  const root = await realpath(resolve(workspaceRoot)); const deployment = join(root, ".deployment"); const output = join(deployment, "supabase"); const migrationsDirectory = join(output, "migrations");
  for (const directory of [deployment, output, migrationsDirectory]) { await rejectSymlink(directory); if (!check) await mkdir(directory, { recursive: true }); }
  const migrations = await discoverMigrations(root); const config = await readFile(join(root, "supabase/config.toml"), "utf8");
  const entries = migrations.map((migration) => ({ version: migration.version, name: migration.name, scope: migration.scope, filename: `${migration.version}_${migration.name}.sql`, sha256: digest(migration.sql) }));
  try { if ((await readdir(migrationsDirectory)).some((filename) => !entries.some((entry) => entry.filename === filename))) throw new Error("Migration staging contains an unregistered file."); }
  catch (failure) { if (failure?.code !== "ENOENT") throw failure; }
  for (let index = 0; index < entries.length; index++) await store(join(migrationsDirectory, entries[index].filename), migrations[index].sql, check);
  await store(join(output, "config.toml"), config, check);
  await store(join(deployment, "migration-plan.json"), JSON.stringify({ format: "aperture-migration-plan", configSha256: digest(config), migrations: entries }, null, 2) + "\n", check);
  return { output, migrations: entries };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const result = await prepareSupabase(fileURLToPath(new URL("../../", import.meta.url)), { check: process.argv.includes("--check") }); console.info(`${process.argv.includes("--check") ? "Verified" : "Prepared"} ${result.migrations.length} ordered migrations in ${result.output}. No database was contacted.`); }
  catch { console.error("Migration staging failed. Source, checksums, or staging paths do not match; no remote operation was attempted."); process.exitCode = 1; }
}
