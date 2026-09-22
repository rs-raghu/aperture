import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getWebOwner } from "@/lib/auth/owner-session";
import { readWebAuthenticationConfiguration } from "@/lib/auth/configuration";
import { WebDataProvider, type WebDataConfiguration } from "@/lib/data/web-data-provider";
import { WebDashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { readonly children: ReactNode }) {
  let owner;
  try {
    owner = await getWebOwner();
  } catch {
    redirect("/sign-in?error=configuration");
  }
  if (owner === null) redirect("/sign-in");
  const authentication = readWebAuthenticationConfiguration();
  const dataConfiguration: WebDataConfiguration = authentication.mode === "development-bypass"
    ? { mode: "memory", ownerId: owner.ownerId }
    : {
        mode: "supabase",
        ownerId: owner.ownerId,
        supabaseUrl: authentication.supabaseUrl!,
        supabasePublishableKey: authentication.supabasePublishableKey!,
      };
  return <WebDataProvider configuration={dataConfiguration}><WebDashboardShell>{children}</WebDashboardShell></WebDataProvider>;
}
