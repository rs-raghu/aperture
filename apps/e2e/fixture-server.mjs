// Loopback-only synthetic provider fixture. It is never imported by either app.
import { createServer } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { Pool } from "pg";
import { discoverMigrations } from "../../packages/database/src/migration-discovery.mjs";

const OWNER = "70000000-0000-4000-8000-000000000001";
const OTHER = "70000000-0000-4000-8000-000000000002";
const EMAIL = "owner@example.invalid";
const PASSWORD = "synthetic-owner-password";
const providerPort = 54331; const databasePort = 54332; const webPort = 3100;
const secret = "synthetic-fixture-signature-only";
let revoked = false; let readCount = 0; let writeCount = 0;
const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
function token(subject = OWNER) {
  const body = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: subject, aud: "authenticated", role: "authenticated", email: subject === OWNER ? EMAIL : "other@example.invalid", iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 })}`;
  return `${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`;
}
function subject(request) {
  const candidate = request.headers.authorization?.replace(/^Bearer /, "") ?? ""; const parts = candidate.split(".");
  if (parts.length !== 3 || revoked) return null;
  const expected = createHmac("sha256", secret).update(`${parts[0]}.${parts[1]}`).digest();
  const signature = Buffer.from(parts[2], "base64url");
  if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) return null;
  try { const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString()); return [OWNER, OTHER].includes(claims.sub) && claims.exp > Date.now() / 1000 ? claims.sub : null; } catch { return null; }
}
function user(id = OWNER) { return { id, aud: "authenticated", role: "authenticated", email: id === OWNER ? EMAIL : "other@example.invalid", email_confirmed_at: "2040-01-01T00:00:00.000Z", created_at: "2040-01-01T00:00:00.000Z", updated_at: "2040-01-01T00:00:00.000Z", app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {} }; }
async function jsonBody(request) { const chunks = []; let size = 0; for await (const chunk of request) { size += chunk.length; if (size > 8 * 1024 * 1024) throw new Error("fixture-body-limit"); chunks.push(chunk); } return chunks.length === 0 ? {} : JSON.parse(Buffer.concat(chunks).toString()); }
function respond(response, status, value, extra = {}) { response.writeHead(status, { "content-type": "application/json", "cache-control": "no-store", "access-control-allow-origin": `http://127.0.0.1:${webPort}`, "access-control-allow-credentials": "true", "access-control-allow-headers": "authorization,apikey,content-type,prefer,accept-profile,content-profile,range,x-client-info,x-supabase-api-version", "access-control-expose-headers": "content-range", ...extra }); response.end(JSON.stringify(value)); }

const database = await PGlite.create();
for (const migration of await discoverMigrations()) await database.exec(migration.sql);
await database.query("insert into education.institutions(id, owner_id, name, payload) values ('80000000-0000-4000-8000-000000000002', $1, 'Other owner private record', $2::jsonb)", [OTHER, JSON.stringify({ ownerId: OTHER })]);
const apiConfiguration = await readFile(new URL("../../supabase/config.toml", import.meta.url), "utf8");
const exposed = JSON.parse(/^schemas = (.+)$/m.exec(apiConfiguration)[1]);
const columns = new Map();
for (const row of (await database.query("select table_schema, table_name, column_name from information_schema.columns")).rows) { const key = `${row.table_schema}.${row.table_name}`; const known = columns.get(key) ?? new Set(); known.add(row.column_name); columns.set(key, known); }
const socket = new PGLiteSocketServer({ db: database, host: "127.0.0.1", port: databasePort, maxConnections: 3, inspect: false, debug: false });
await socket.start();
const pool = new Pool({ connectionString: `postgresql://postgres:postgres@127.0.0.1:${databasePort}/postgres`, max: 1, ssl: false });
pool.on("error", () => console.warn("Synthetic fixture connection unavailable."));

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${providerPort}`);
  try {
    if (request.method === "OPTIONS") return respond(response, 200, {}, { "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS" });
    if (url.pathname === "/health") return respond(response, 200, { ready: true });
    if (url.pathname === "/test/inspect") {
      const rows = {};
      for (const table of ["education.institutions", "education.programs", "education.semesters", "education.courses", "education.assignments", "health.hydration_entries", "finance.accounts", "finance.transactions", "finance.calculator_scenarios", "planner.items", "platform.user_preferences", "portfolio.drafts"]) rows[table] = Number((await pool.query(`select count(*) as count from ${table} where owner_id = $1 and deleted_at is null`, [OWNER])).rows[0].count);
      return respond(response, 200, { rows, reads: readCount, writes: writeCount });
    }
    if (url.pathname === "/auth/v1/token" && request.method === "POST") {
      const body = await jsonBody(request);
      if ((url.searchParams.get("grant_type") === "password" && body.email === EMAIL && body.password === PASSWORD) || (url.searchParams.get("grant_type") === "refresh_token" && body.refresh_token === "synthetic-refresh-token" && !revoked)) {
        revoked = false; return respond(response, 200, { access_token: token(), refresh_token: "synthetic-refresh-token", token_type: "bearer", expires_in: 86400, expires_at: Math.floor(Date.now() / 1000) + 86400, user: user() });
      }
      return respond(response, 400, { code: "invalid_credentials", msg: "Invalid synthetic credentials" });
    }
    const ownerId = subject(request);
    if (ownerId === null) return respond(response, 401, { code: "invalid_token", message: "Synthetic session denied" });
    if (url.pathname === "/auth/v1/user") return respond(response, 200, user(ownerId));
    if (url.pathname === "/auth/v1/logout" && request.method === "POST") { revoked = true; return respond(response, 200, {}); }
    if (!url.pathname.startsWith("/rest/v1/")) return respond(response, 404, { code: "fixture-not-found" });
    const schema = String(request.headers[request.method === "GET" ? "accept-profile" : "content-profile"] ?? "public");
    if (!exposed.includes(schema)) return respond(response, 406, { code: "PGRST106", message: "Schema is not exposed" });
    const table = url.pathname.slice("/rest/v1/".length); const known = columns.get(`${schema}.${table}`);
    const client = await pool.connect();
    try {
      await client.query("begin"); await client.query("set local role authenticated"); await client.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub: ownerId, role: "authenticated" })]);
      if (table === "rpc/save_draft" && schema === "portfolio" && request.method === "POST") {
        const body = await jsonBody(request); const result = await client.query("select portfolio.save_draft($1::jsonb, $2::integer) as saved", [JSON.stringify(body.candidate), body.expected_revision]); await client.query("commit"); writeCount++; return respond(response, 200, result.rows[0].saved);
      }
      if (!known || !/^[a-z][a-z0-9_]*$/.test(table)) throw new Error("fixture-table-denied");
      const identifier = (name) => { if (!known.has(name) || !/^[a-z][a-z0-9_]*$/.test(name)) throw new Error("fixture-column-denied"); return `"${name}"`; };
      const selection = (url.searchParams.get("select") ?? "*").split(",").map((name) => name === "*" ? "*" : identifier(name)).join(",");
      const parameters = []; const filters = [];
      for (const [name, filter] of url.searchParams) {
        if (["select", "offset", "limit", "order"].includes(name)) continue;
        if (filter === "is.null") filters.push(`${identifier(name)} is null`);
        else if (filter.startsWith("eq.")) { parameters.push(filter.slice(3)); filters.push(`${identifier(name)} = $${parameters.length}`); }
        else throw new Error("fixture-filter-denied");
      }
      const where = filters.length === 0 ? "" : ` where ${filters.join(" and ")}`; const qualified = `"${schema}"."${table}"`;
      let result;
      if (request.method === "GET") {
        const offset = Number(url.searchParams.get("offset") ?? 0); const limit = Number(url.searchParams.get("limit") ?? 1000);
        if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 0 || limit > 1000) throw new Error("fixture-page-denied");
        result = await client.query(`select ${selection} from ${qualified}${where} order by id offset ${offset} limit ${limit}` , parameters); readCount++;
      } else if (request.method === "POST" || request.method === "PATCH") {
        const body = await jsonBody(request); if (typeof body !== "object" || body === null || Array.isArray(body)) throw new Error("fixture-row-denied"); const names = Object.keys(body);
        const values = names.map((name) => { parameters.push(name === "payload" || typeof body[name] === "object" && body[name] !== null && !Array.isArray(body[name]) ? JSON.stringify(body[name]) : body[name]); return `$${parameters.length}`; });
        const sql = request.method === "POST" ? `insert into ${qualified} (${names.map(identifier).join(",")}) values (${values.join(",")}) returning ${selection}` : `update ${qualified} set ${names.map((name, index) => `${identifier(name)} = ${values[index]}`).join(",")}${where} returning ${selection}`;
        result = await client.query(sql, parameters); writeCount++;
      } else throw new Error("fixture-method-denied");
      await client.query("commit");
      const single = String(request.headers.accept ?? "").includes("application/vnd.pgrst.object+json");
      if (single && result.rows.length !== 1) return respond(response, 406, { code: "PGRST116", details: `The result contains ${result.rows.length} rows`, message: "Cannot coerce result to a single object" });
      return respond(response, 200, single ? result.rows[0] : result.rows, { "content-range": `0-${Math.max(0, result.rows.length - 1)}/*` });
    } catch (failure) { await client.query("rollback"); console.warn(`Synthetic REST ${schema}.${table} failed (${typeof failure.code === "string" ? failure.code : "fixture-contract"}).`); return respond(response, 400, { code: failure.code ?? "PGRST100", message: "Synthetic provider contract rejected this operation" }); }
    finally { client.release(); }
  } catch { return respond(response, 500, { code: "fixture-unavailable" }); }
});
await new Promise((resolve, reject) => { server.once("error", reject); server.listen(providerPort, "127.0.0.1", resolve); });
const web = spawn(process.execPath, [fileURLToPath(new URL("../../node_modules/next/dist/bin/next", import.meta.url)), "start", "--port", String(webPort), "--hostname", "127.0.0.1"], {
  cwd: fileURLToPath(new URL("../web", import.meta.url)), windowsHide: true, stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production", APERTURE_AUTH_DEV_BYPASS: "false", APERTURE_OWNER_ID: OWNER, APERTURE_OWNER_EMAIL: EMAIL, NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${providerPort}`, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "synthetic-public-key", APERTURE_WEB_ORIGIN: `http://127.0.0.1:${webPort}`, APERTURE_RECOVERY_ENABLED: "true", DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:${databasePort}/postgres`, APERTURE_STRAVA_MODE: "disabled", APERTURE_PORTFOLIO_PUBLIC: "false", SUPABASE_SERVICE_ROLE_KEY: "" },
});
let closing = false;
async function close() { if (closing) return; closing = true; web.kill(); server.close(); await pool.end(); await socket.stop(); await database.close(); }
web.on("exit", () => { void close().then(() => { process.exitCode = 0; }); });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { void close().then(() => { process.exitCode = 0; }); });
