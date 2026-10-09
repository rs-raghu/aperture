import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repository = fileURLToPath(new URL("../../../", import.meta.url));
const directories: string[] = [];
afterEach(() => { for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true }); });
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "aperture-plugin-contract-")); directories.push(root);
  const manifest = JSON.parse(readFileSync(join(repository, "plugins/portfolio/aperture.plugin.json"), "utf8"));
  function write(relative: string, value: string) { const destination = join(root, relative); mkdirSync(dirname(destination), { recursive: true }); writeFileSync(destination, value); }
  write("tooling/plugins/generate-plugins.mjs", readFileSync(join(repository, "tooling/plugins/generate-plugins.mjs"), "utf8"));
  for (const reference of [...Object.values(manifest.frontends), ...Object.values(manifest.dataContributions), ...(manifest.backend ? [manifest.backend] : [])]) {
    const source = (reference as { source: string }).source; write(source, "export {};\n");
  }
  for (const migration of manifest.migrations) write(migration, "-- isolated fixture\n");
  const save = () => write("plugins/portfolio/aperture.plugin.json", JSON.stringify(manifest)); save();
  const generate = (...args: string[]) => spawnSync(process.execPath, [join(root, "tooling/plugins/generate-plugins.mjs"), ...args], { encoding: "utf8" });
  return { root, manifest, save, generate, write };
}
describe("manifest-owned data contributions", () => {
  it("discovers literal frontend and server factories and detects generated drift", () => {
    const value = fixture(); expect(value.generate().status).toBe(0);
    for (const [platform, location] of [["web", "apps/web/src/generated/plugin-data-contributions.generated.ts"], ["mobile", "apps/mobile/src/generated/plugin-data-contributions.generated.ts"], ["server", "apps/web/src/generated/plugin-recovery-adapters.generated.ts"]]) {
      const source = readFileSync(join(value.root, location!), "utf8");
      expect(source).toContain(value.manifest.dataContributions[platform!].exportName); expect(source).toContain(JSON.stringify(value.manifest.dataContributions[platform!].import)); expect(source).toContain("Object.freeze([factory0])");
    }
    expect(value.generate("--check").status).toBe(0);
    value.write("apps/web/src/generated/plugin-data-contributions.generated.ts", "stale output\n"); expect(value.generate("--check").status).toBe(1);
  });
  it.each(["injected-export", "traversal", "missing-source"])("rejects invalid contribution references: %s", (failure) => {
    const value = fixture(); const contribution = value.manifest.dataContributions.web;
    if (failure === "injected-export") contribution.exportName = "factory; console.log('injected')";
    if (failure === "traversal") contribution.source = "../outside.ts";
    if (failure === "missing-source") contribution.source = "apps/web/missing.ts";
    value.save(); const result = value.generate(); expect(result.status).toBe(1); expect(result.stderr).toContain("Invalid Aperture plugin manifest");
  });
});
