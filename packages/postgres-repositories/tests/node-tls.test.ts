import { X509Certificate } from "node:crypto";
import { Client } from "pg";
import { describe, expect, it } from "vitest";
import { createSecurePostgresPool } from "../src/node.js";
import { SUPABASE_DATABASE_CA } from "../src/supabase-ca.js";

describe("Node PostgreSQL TLS trust", () => {
  it("bundles the independently published, self-signed Supabase CA", () => {
    const certificate = new X509Certificate(SUPABASE_DATABASE_CA);
    expect(certificate.ca).toBe(true);
    expect(certificate.subject).toBe(certificate.issuer);
    expect(certificate.verify(certificate.publicKey)).toBe(true);
    expect(certificate.fingerprint256.replaceAll(":", "").toLowerCase()).toBe("807025ad50d4ed219d2c9c7d299c004f824eb00cf7f65afef607d07b72e6cafa");
    expect(Date.parse(certificate.validFrom)).toBeLessThan(Date.now());
    expect(Date.parse(certificate.validTo)).toBeGreaterThan(Date.now());
  });

  it.each([
    "aws-0-ap-south-1.pooler.supabase.com",
    "db.ajzaohkydmzvuvhrsidu.supabase.co",
  ])("passes the provider CA to pg with verification enabled for %s", async (host) => {
    const pool = createSecurePostgresPool(`postgresql://fixture:unused@${host}:5432/postgres?ssl=0&sslmode=no-verify&sslrootcert=untrusted.pem&sslcert=unused&sslkey=unused&sslnegotiation=direct&uselibpqcompat=true`, 1);
    try {
      expect(pool.options.ssl).toEqual({ rejectUnauthorized: true, ca: SUPABASE_DATABASE_CA });
      expect(new Client(pool.options)).toHaveProperty("connectionParameters.ssl", pool.options.ssl);
      expect(new URL(pool.options.connectionString!).search).toBe("");
    } finally { await pool.end(); }
  });

  it.each([
    "database.example.invalid",
    "aws-0-ap-south-1.pooler.supabase.com.attacker.invalid",
    "attacker-pooler.supabase.com",
    "db.ajzaohkydmzvuvhrsidu.supabase.co.attacker.invalid",
    "ajzaohkydmzvuvhrsidu.supabase.co",
  ])("keeps default verified trust for unrelated host %s", async (host) => {
    const pool = createSecurePostgresPool(`postgresql://fixture:unused@${host}/postgres?sslmode=disable`, 1);
    try { expect(pool.options.ssl).toEqual({ rejectUnauthorized: true }); }
    finally { await pool.end(); }
  });

  it("preserves the loopback-only local development connection", async () => {
    const pool = createSecurePostgresPool("postgresql://fixture:unused@127.0.0.1:54332/postgres", 1);
    try { expect(pool.options.ssl).toBe(false); }
    finally { await pool.end(); }
  });
});
