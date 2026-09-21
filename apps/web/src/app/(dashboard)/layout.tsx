import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { FinanceProvider } from "@/features/finance";
import { getWebOwner } from "@/lib/auth/owner-session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { readonly children: ReactNode }) {
  let owner;
  try {
    owner = await getWebOwner();
  } catch {
    redirect("/sign-in?error=configuration");
  }
  if (owner === null) redirect("/sign-in");
  return <FinanceProvider>{children}</FinanceProvider>;
}
