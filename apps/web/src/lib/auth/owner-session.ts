import { createSupabaseAuthenticationService } from "@aperture/auth";
import type { PlatformUser } from "@aperture/platform-contracts";

import { readWebAuthenticationConfiguration } from "./configuration";
import { createWebServerSupabaseClient } from "./supabase-server";

export async function getWebOwner(): Promise<PlatformUser | null> {
  const configuration = readWebAuthenticationConfiguration();
  if (configuration.mode === "development-bypass") {
    const now = new Date().toISOString();
    return {
      id: configuration.ownerId!,
      ownerId: configuration.ownerId!,
      email: configuration.ownerEmail,
      displayName: "Development owner",
      createdAt: now,
      updatedAt: now,
    };
  }
  const client = await createWebServerSupabaseClient();
  return createSupabaseAuthenticationService(client, configuration).getCurrentUser();
}
