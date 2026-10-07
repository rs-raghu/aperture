import { emptyPortfolioContent, newPortfolioEntry, type PortfolioContent } from "../src/index.js";
export const OWNER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
export const OWNER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
export function content(): PortfolioContent { return { ...emptyPortfolioContent(), profile: { displayName: "Synthetic professional", headline: "Build useful software", biography: "A deliberately curated synthetic biography.", location: "" }, projects: [{ ...newPortfolioEntry("00000000-0000-4000-8000-000000000003"), title: "Synthetic project", description: "A curated demonstration.", url: "https://example.invalid/project" }] }; }
