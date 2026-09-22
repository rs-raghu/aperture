"use client";

import { featureRegistry } from "@aperture/feature-registry";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = featureRegistry.secondaryNavigation("planner", "web");

export function PlannerShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  return <section className="planner-shell" aria-label="Planner workspace">
    <nav className="planner-nav" aria-label="Planner">{navigation.map((item) => <Link key={item.id} href={item.path} aria-current={pathname === item.path ? "page" : undefined}>{item.label}</Link>)}</nav>
    <aside className="preview-notice" role="note"><strong>Private plan</strong> — Planner records are owner scoped and synchronized with the same repository as the rest of your dashboard.</aside>
    <main className="planner-main">{children}</main>
  </section>;
}
