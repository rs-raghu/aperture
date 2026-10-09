import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createNodePostgresExecutor, createSecurePostgresPool } from "@aperture/postgres-repositories/node";

const OWNER = "70000000-0000-4000-8000-000000000001";
async function authenticate(page) {
  await page.goto("/sign-in"); await page.getByLabel("Email", { exact: true }).fill("owner@example.invalid"); await page.getByLabel("Password", { exact: true }).fill("synthetic-owner-password"); await page.getByRole("button", { name: "Sign in", exact: true }).click(); await expect(page).toHaveURL(/\/education$/);
}
async function inspect(request) { return (await request.get("http://127.0.0.1:54331/test/inspect")).json(); }

test("Node PostgreSQL transactions sequence concurrent queries and fully roll back failures", async () => {
  const remote = createSecurePostgresPool("postgresql://fixture:unused@database.example.invalid/db?ssl=0&sslmode=no-verify&uselibpqcompat=true", 1);
  expect(remote.options.ssl).toEqual({ rejectUnauthorized: true }); expect(remote.options.connectionString).not.toContain("ssl"); expect(new remote.Client(remote.options).connectionParameters.ssl).toEqual({ rejectUnauthorized: true }); await remote.end();
  const pool = createSecurePostgresPool("postgresql://postgres:postgres@127.0.0.1:54332/postgres", 1); const database = createNodePostgresExecutor(pool);
  const warnings = []; const listener = (warning) => { if (warning.message.includes("client.query()")) warnings.push(warning.message); }; process.on("warning", listener);
  try {
    const values = await database.transaction((transaction) => Promise.all([transaction.query("select 1 as value"), transaction.query("select 2 as value")])); expect(values.map((result) => result.rows[0].value)).toEqual([1, 2]);
    await expect(database.transaction((transaction) => Promise.all([transaction.query("insert into education.institutions(id, owner_id, name) values ('80000000-0000-4000-8000-000000000099', $1, 'Rollback probe')", [OWNER]), transaction.query("select value from fixture_missing_table")]))).rejects.toThrow();
    expect((await database.query("select count(*)::int as count from education.institutions where id = '80000000-0000-4000-8000-000000000099'")).rows[0].count).toBe(0); expect(warnings).toEqual([]);
  } finally { process.off("warning", listener); await pool.end(); }
});

test("owner authentication, durable feature workflows, reviewed recovery, and logout", async ({ page, request }) => {
  const errors = []; page.on("pageerror", (failure) => errors.push(failure.message));
  const date = new Date().toISOString().slice(0, 10); let contents = "";
  await test.step("1. protect private routes and authenticate the owner", async () => {
    const live = await request.get("http://127.0.0.1:3100/api/health"); expect(live.status()).toBe(200); expect(await live.json()).toEqual({ status: "ok", service: "aperture-web" }); expect(live.headers()["x-frame-options"]).toBe("DENY");
    const manifest = await request.get("http://127.0.0.1:3100/manifest.webmanifest"); expect(manifest.status()).toBe(200); expect((await manifest.json()).icons[0].src).toBe("/icon.svg"); expect((await request.get("http://127.0.0.1:3100/icon.svg")).status()).toBe(200);
    const anonymousReadiness = await request.get("http://127.0.0.1:3100/api/health/ready", { maxRedirects: 0 }); expect(anonymousReadiness.status()).toBe(307); expect(anonymousReadiness.headers().location).toContain("/sign-in");
    await page.goto("/finance/accounts"); await expect(page).toHaveURL(/\/sign-in/);
    expect((await request.get("http://127.0.0.1:3100/api/recovery")).status()).toBe(401);
    await authenticate(page); await expect(page.getByText("Cloud data", { exact: false }).first()).toBeVisible();
    const ready = await page.request.get("/api/health/ready"); expect(ready.status()).toBe(200); expect(await ready.json()).toEqual({ status: "ready" }); expect(ready.headers()["cache-control"]).toContain("no-store");
    await expect(page.getByText("Other owner private record", { exact: true })).toHaveCount(0);
  });
  await test.step("2. create and view Education records through real owner RLS", async () => {
    await page.goto("/education/setup"); await page.getByLabel("Institution name *", { exact: true }).fill("Synthetic Learning Lab"); await page.getByRole("button", { name: "Create institution", exact: true }).click(); await expect(page.locator("strong").filter({ hasText: /^Synthetic Learning Lab$/ })).toBeVisible();
    await page.getByLabel("Institution *", { exact: true }).selectOption({ label: "Synthetic Learning Lab" }); await page.getByLabel("Program name *", { exact: true }).fill("Structured Studies"); await page.locator("#programStart").fill("2026-08-01"); await page.getByRole("button", { name: "Create program", exact: true }).click(); await expect(page.locator("strong").filter({ hasText: /^Structured Studies$/ })).toBeVisible();
    await page.getByLabel("Program *", { exact: true }).selectOption({ label: "Structured Studies" }); await page.getByLabel("Semester name *", { exact: true }).fill("Autumn Term"); await page.getByLabel("Academic year *", { exact: true }).fill("2026–27"); await page.locator("#semesterStarts").fill("2026-08-01"); await page.getByLabel("End date *", { exact: true }).fill("2026-12-20"); await page.getByRole("button", { name: "Create semester", exact: true }).click(); await expect(page.getByRole("button", { name: "Activate", exact: true })).toBeVisible(); await page.getByRole("button", { name: "Activate", exact: true }).click();
    await page.goto("/education/courses"); await page.getByLabel("Semester *", { exact: true }).selectOption({ label: "Autumn Term" }); await page.getByLabel("Course name *", { exact: true }).fill("Systems Thinking"); await page.getByLabel("Course code", { exact: true }).fill("SYS-101"); await page.getByLabel("Credits", { exact: true }).fill("3"); await page.getByRole("button", { name: "Create course", exact: true }).click(); await expect(page.getByText(/SYS-101/).first()).toBeVisible();
    await page.goto("/education/assignments"); await page.getByLabel("Course *", { exact: true }).selectOption({ label: "Systems Thinking" }); await page.getByLabel("Title *", { exact: true }).fill("Review the system"); await page.getByLabel("Due date and time", { exact: true }).fill(`${date}T23:30`); await page.getByRole("button", { name: "Create assignment", exact: true }).click(); await expect(page.getByRole("heading", { name: "Review the system", exact: true })).toBeVisible();
    expect((await inspect(request)).rows["education.assignments"]).toBe(1);
  });
  await test.step("3. record durable Health data", async () => {
    await page.goto("/health/hydration"); await page.getByLabel("Volume in milliliters *", { exact: true }).fill("250.50"); await page.getByLabel("Consumed at *", { exact: true }).fill(`${date}T12:30`); await page.getByRole("button", { name: "Record hydration", exact: true }).click(); await expect(page.getByRole("heading", { name: /250.5.*milliliter/ })).toBeVisible(); expect((await inspect(request)).rows["health.hydration_entries"]).toBe(1);
  });
  await test.step("4. create Finance data with UUID identities and exact decimals", async () => {
    await page.goto("/finance/accounts"); await page.getByLabel("Account name *", { exact: true }).fill("Checking"); await page.getByRole("button", { name: "Add account", exact: true }).click(); await expect(page.getByRole("heading", { name: "Checking", exact: true })).toBeVisible();
    await page.goto("/finance/transactions"); await page.getByLabel("Category name *", { exact: true }).fill("Food"); await page.getByRole("button", { name: "Add category", exact: true }).click(); await page.getByLabel("Account *", { exact: true }).selectOption({ label: "Checking" }); await page.getByLabel("Category", { exact: true }).selectOption({ label: "Food (expense)" }); await page.getByLabel("Description *", { exact: true }).fill("Lunch"); await page.getByLabel("Amount *", { exact: true }).fill("12.3400"); await page.getByLabel("Occurred at *", { exact: true }).fill(`${date}T12:30`); await page.getByRole("button", { name: "Add transaction", exact: true }).click(); await expect(page.getByRole("heading", { name: "Lunch", exact: true })).toBeVisible(); await expect(page.getByText("USD 12.3400", { exact: false }).first()).toBeVisible(); expect((await inspect(request)).rows["finance.transactions"]).toBe(1);
  });
  await test.step("5. calculate and save a durable Finance scenario", async () => {
    await page.goto("/calculators/sip"); await page.getByRole("button", { name: "Calculate", exact: true }).click(); await page.getByLabel("Scenario name", { exact: true }).fill("Synthetic baseline"); await page.getByRole("button", { name: "Save scenario", exact: true }).click(); await expect(page.getByText("Saved Synthetic baseline.", { exact: true })).toBeVisible(); expect((await inspect(request)).rows["finance.calculator_scenarios"]).toBe(1);
  });
  await test.step("6. confirm Education contributes to Today", async () => {
    await page.goto("/today"); await page.getByLabel("Dashboard date", { exact: true }).fill(date); await expect(page.getByRole("link", { name: "Review the system", exact: true })).toBeVisible(); await expect(page.getByText(/This widget is temporarily unavailable/)).toHaveCount(0);
  });
  await test.step("7. create Planner tasks and see them in Today", async () => {
    await page.goto("/planner"); await page.getByLabel("Title", { exact: true }).fill("Prepare review"); await page.getByRole("button", { name: "Add item", exact: true }).click(); await expect(page.getByText("Prepare review", { exact: true }).first()).toBeVisible(); await page.goto("/today"); await expect(page.getByRole("link", { name: "Prepare review", exact: true })).toBeVisible(); expect((await inspect(request)).rows["planner.items"]).toBe(1);
  });
  await test.step("8. persist settings across a browser reload", async () => {
    await page.goto("/settings"); await page.getByLabel("Theme", { exact: true }).selectOption("dark"); await expect.poll(async () => (await inspect(request)).rows["platform.user_preferences"]).toBe(1); await page.reload(); await expect(page.getByLabel("Theme", { exact: true })).toHaveValue("dark");
  });
  await test.step("9. export an owner-scoped plaintext archive", async () => {
    await page.goto("/portfolio/edit"); await page.getByRole("button", { name: "Enable Portfolio", exact: true }).click(); await page.getByLabel("Display name", { exact: true }).fill("Synthetic professional"); await page.getByLabel("Headline", { exact: true }).fill("Build useful tools"); await page.getByLabel("Biography", { exact: true }).fill("Explicitly curated biography."); await page.getByRole("button", { name: "Save private draft", exact: true }).click(); await expect(page.getByText("Private draft saved.", { exact: true })).toBeVisible();
    await page.reload(); await expect(page.getByLabel("Display name", { exact: true })).toHaveValue("Synthetic professional"); expect((await inspect(request)).rows["portfolio.drafts"]).toBe(1);
    await page.goto("/settings/data"); const downloadPromise = page.waitForEvent("download"); await page.getByRole("button", { name: "Download JSON backup", exact: true }).click(); const download = await downloadPromise; contents = await readFile(await download.path(), "utf8"); const archive = JSON.parse(contents); expect(archive.ownerId).toBe(OWNER); expect(archive.recordCount).toBeGreaterThan(7); expect(archive.scope.featureIds).toContain("portfolio"); expect(contents).not.toMatch(/Other owner private record|synthetic-refresh-token|access_token|ciphertext/);
    const transaction = archive.features.find((feature) => feature.featureId === "finance").collections.find((collection) => collection.name === "transactions").records[0]; expect(transaction.amount.amount).toBe("12.3400"); expect(transaction.id).toMatch(/^[0-9a-f-]{36}$/);
  });
  await test.step("10. validate, reject unsafe requests, and restore the archive", async () => {
    await page.getByLabel("Backup JSON", { exact: true }).fill(contents); await page.getByLabel("Import mode", { exact: true }).selectOption("replace"); await page.getByRole("button", { name: "Validate and preview", exact: true }).click(); await expect(page.getByText("Ready for reviewed restore", { exact: true })).toBeVisible(); await expect(page.getByRole("button", { name: "Apply reviewed restore", exact: true })).toBeDisabled();
    const confirmation = await page.locator("code").first().innerText(); await page.getByLabel("Restore confirmation", { exact: true }).fill("incorrect"); await expect(page.getByRole("button", { name: "Apply reviewed restore", exact: true })).toBeDisabled();
    const csrf = await page.request.post("/api/recovery", { headers: { origin: "https://untrusted.example.invalid" }, data: { action: "preview-deletion", featureIds: ["finance"] } }); expect(csrf.status()).toBe(403);
    await page.getByLabel("Restore confirmation", { exact: true }).fill(confirmation); await page.getByRole("button", { name: "Apply reviewed restore", exact: true }).click(); await expect(page.getByText("Archive restored. Reload workspace to refresh open views.", { exact: true })).toBeVisible();
    const state = await inspect(request); expect(state.rows["finance.transactions"]).toBe(1); expect(state.rows["health.hydration_entries"]).toBe(1); expect(state.rows["education.assignments"]).toBe(1); expect(state.rows["planner.items"]).toBe(1);
    await page.goto("/finance/transactions"); await expect(page.getByRole("heading", { name: "Lunch", exact: true })).toBeVisible();
  });
  await test.step("11. sign out and verify route and recovery protection", async () => {
    await page.getByRole("button", { name: "Sign out", exact: true }).click(); await expect(page).toHaveURL(/\/sign-in$/); await page.goto("/today"); await expect(page).toHaveURL(/\/sign-in/); expect((await page.request.get("/api/recovery")).status()).toBe(401); const publicResponse = await page.request.get("/portfolio"); expect(publicResponse.status()).toBe(404); expect(await publicResponse.text()).not.toContain("Lunch");
  });
  expect(errors).toEqual([]);
  const metrics = await inspect(request); console.info(JSON.stringify({ fixtureRestReads: metrics.reads, fixtureRestWrites: metrics.writes }));
});

test("unknown accounts are denied and narrow-screen navigation supports keyboard access", async ({ page }) => {
  await page.goto("/sign-in"); await page.getByLabel("Email", { exact: true }).fill("stranger@example.invalid"); await page.getByLabel("Password", { exact: true }).fill("synthetic-owner-password"); await page.getByRole("button", { name: "Sign in", exact: true }).click(); await expect(page.getByRole("main").getByRole("alert")).toContainText("Sign-in failed");
  await authenticate(page); await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/today"); await page.getByRole("button", { name: "Menu", exact: true }).click(); await expect(page.getByRole("navigation", { name: "Mobile navigation", exact: true })).toBeVisible();
  await page.keyboard.press("Control+k"); await expect(page.getByRole("dialog")).toBeVisible(); await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Sign out", exact: true }).click(); await expect(page).toHaveURL(/\/sign-in$/);
});
