import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { prepareSupabase } from "../prepare-supabase.mjs";
import { inspectProductionEnvironment } from "../check-environment.mjs";

async function fixture(work) {
  const root = await mkdtemp(join(tmpdir(), "aperture-deployment-contract-"));
  try {
    await mkdir(join(root, "supabase/migrations"), { recursive: true }); await mkdir(join(root, "packages/curated/migrations"), { recursive: true });
    await writeFile(join(root, "supabase/config.toml"), 'project_id = "synthetic-local"\n');
    await writeFile(join(root, "supabase/migrations/20400101000000_core.sql"), "select 1;\n"); await writeFile(join(root, "packages/curated/migrations/20400102000000_feature.sql"), "select 2;\n");
    await work(root);
  } finally { await rm(root, { recursive: true, force: true }); }
}
const web = () => ({ NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_fixture", APERTURE_OWNER_ID: "70000000-0000-4000-8000-000000000001", APERTURE_OWNER_EMAIL: "owner@example.invalid", APERTURE_AUTH_DEV_BYPASS: "false", APERTURE_WEB_ORIGIN: "https://owned.example.com", NEXT_PUBLIC_APP_ORIGIN: "https://owned.example.com", APERTURE_RECOVERY_ENABLED: "true", DATABASE_URL: "postgresql://synthetic:unused@database.example.com/postgres", APERTURE_PORTFOLIO_PUBLIC: "false", APERTURE_STRAVA_MODE: "disabled" });
test("stages core and feature migrations in order with source checksums and an idempotent check", async () => fixture(async (root) => {
  const result = await prepareSupabase(root); assert.deepEqual(result.migrations.map((row) => row.scope), ["core", "curated"]);
  const source = await readFile(join(root, "packages/curated/migrations/20400102000000_feature.sql"), "utf8");
  assert.equal(result.migrations[1].sha256, createHash("sha256").update(source).digest("hex"));
  assert.equal(await readFile(join(result.output, "migrations/20400102000000_feature.sql"), "utf8"), source);
  assert.deepEqual(await prepareSupabase(root, { check: true }), result);
}));
test("refuses changed checksums and unregistered staging SQL without overwriting them", async () => fixture(async (root) => {
  const result = await prepareSupabase(root); const target = join(result.output, "migrations/20400102000000_feature.sql"); await writeFile(target, "changed\n");
  await assert.rejects(prepareSupabase(root), /differs/); assert.equal(await readFile(target, "utf8"), "changed\n");
  await writeFile(join(result.output, "migrations/20400103000000_unregistered.sql"), "select 3;\n"); await assert.rejects(prepareSupabase(root, { check: true }), /unregistered/);
}));
test("check mode does not prepare missing artifacts and staging rejects symbolic links", async () => fixture(async (root) => {
  await assert.rejects(prepareSupabase(root, { check: true }), /missing/);
  const other = join(root, "other"); await mkdir(other); await symlink(other, join(root, ".deployment"), process.platform === "win32" ? "junction" : "dir");
  await assert.rejects(prepareSupabase(root), /symbolic links/);
}));
test("validates complete offline production web configuration without treating it as target verification", () => {
  assert.equal(inspectProductionEnvironment("web", web()).valid, true);
  assert.equal(inspectProductionEnvironment("web", { ...web(), APERTURE_AUTH_DEV_BYPASS: "true", APERTURE_STRAVA_MODE: "mock" }).valid, false);
});
test("rejects missing owner, insecure endpoints, and disabled release recovery with names only", () => {
  const result = inspectProductionEnvironment("web", { ...web(), APERTURE_OWNER_ID: "", NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321", APERTURE_RECOVERY_ENABLED: "false" });
  assert.deepEqual(result.invalidVariables, ["NEXT_PUBLIC_SUPABASE_URL", "APERTURE_OWNER_ID", "APERTURE_RECOVERY_ENABLED"]); assert.ok(!JSON.stringify(result).includes("localhost"));
});
test("rejects privileged keys in public configuration, including legacy role claims", () => {
  for (const key of ["sb_secret_fixture", `header.${Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")}.signature`]) {
    const result = inspectProductionEnvironment("web", { ...web(), NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key }); assert.equal(result.valid, false); assert.ok(!JSON.stringify(result).includes(key));
  }
});
test("requires native identifiers and the fixed deep-link scheme", () => {
  const result = inspectProductionEnvironment("mobile", { EXPO_PUBLIC_SUPABASE_URL: web().NEXT_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: web().NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, EXPO_PUBLIC_APERTURE_OWNER_ID: web().APERTURE_OWNER_ID, EXPO_PUBLIC_APERTURE_OWNER_EMAIL: web().APERTURE_OWNER_EMAIL, EXPO_PUBLIC_APERTURE_AUTH_DEV_BYPASS: "false", EXPO_PUBLIC_APP_SCHEME: "aperture", EXPO_PUBLIC_APERTURE_WEB_URL: web().APERTURE_WEB_ORIGIN, APERTURE_ANDROID_PACKAGE: "com.example.synthetic", APERTURE_IOS_BUNDLE_IDENTIFIER: "com.example.synthetic", APERTURE_EAS_PROJECT_ID: "70000000-0000-4000-8000-000000000002" });
  assert.equal(result.valid, true); assert.ok(inspectProductionEnvironment("mobile", {}).invalidVariables.includes("APERTURE_EAS_PROJECT_ID"));
});
test("optional publication and live Strava require their separate server configuration", () => {
  const result = inspectProductionEnvironment("web", { ...web(), APERTURE_PORTFOLIO_PUBLIC: "true", APERTURE_STRAVA_MODE: "live" });
  assert.ok(result.invalidVariables.includes("SUPABASE_SERVICE_ROLE_KEY")); assert.ok(result.invalidVariables.includes("STRAVA_TOKEN_ENCRYPTION_KEY")); assert.ok(result.invalidVariables.includes("STRAVA_REDIRECT_URI"));
});
