import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "@aperture/validation";
import { StravaError, type StravaCipher } from "./strava.types.js";

const tokensSchema = z.strictObject({ accessToken: z.string().min(1).max(4096), refreshToken: z.string().min(1).max(4096), expiresAt: z.number().int().positive().safe(), athleteId: z.string().regex(/^\d+$/) });

export function createStravaTokenCipher(base64Key: string): StravaCipher {
  const key = Buffer.from(base64Key, "base64");
  if (key.length !== 32 || key.toString("base64") !== base64Key) throw new StravaError("strava-invalid-key", "The Strava encryption key must be 32 bytes encoded as canonical base64.");
  return {
    async encrypt(ownerId, tokens) {
      const nonce = randomBytes(12);
      const cipher = createCipheriv("aes-256-gcm", key, nonce);
      cipher.setAAD(Buffer.from(`aperture:strava:v1:${ownerId}`));
      const encrypted = Buffer.concat([cipher.update(JSON.stringify(tokensSchema.parse(tokens)), "utf8"), cipher.final()]);
      return `v1.${nonce.toString("base64url")}.${encrypted.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}`;
    },
    async decrypt(ownerId, value) {
      try {
        const parts = value.split(".");
        if (parts.length !== 4 || parts[0] !== "v1") throw new Error("Invalid encrypted envelope");
        const nonce = Buffer.from(parts[1]!, "base64url"); const tag = Buffer.from(parts[3]!, "base64url");
        if (nonce.length !== 12 || tag.length !== 16) throw new Error("Invalid encrypted metadata");
        const cipher = createDecipheriv("aes-256-gcm", key, nonce);
        cipher.setAAD(Buffer.from(`aperture:strava:v1:${ownerId}`)); cipher.setAuthTag(tag);
        return tokensSchema.parse(JSON.parse(Buffer.concat([cipher.update(Buffer.from(parts[2]!, "base64url")), cipher.final()]).toString("utf8")));
      } catch { throw new StravaError("strava-credential-unavailable", "Stored Strava credentials cannot be decrypted. Reconnect the integration."); }
    },
    digest(value) { return createHash("sha256").update(value).digest("hex"); },
    equals(left, right) { const a = Buffer.from(left); const b = Buffer.from(right); return a.length === b.length && timingSafeEqual(a, b); },
  };
}
