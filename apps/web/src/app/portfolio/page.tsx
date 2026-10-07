import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioPresentation } from "@/features/portfolio/public-presentation";
import { readPublicPortfolio } from "@/features/portfolio/server";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const value = await readPublicPortfolio(); if (value === null) return { title: "Portfolio unavailable", robots: { index: false, follow: false } };
  const title = `${value.snapshot.content.profile.displayName} — ${value.snapshot.content.profile.headline}`; const description = value.snapshot.content.profile.biography.slice(0, 160);
  return { title, description, metadataBase: new URL(value.origin), alternates: { canonical: "/portfolio" }, robots: { index: true, follow: true }, openGraph: { title, description, type: "profile", url: `${value.origin}/portfolio` } };
}
export default async function PublicPortfolioPage() { const value = await readPublicPortfolio(); if (value === null) notFound(); return <PortfolioPresentation snapshot={value.snapshot} />; }
