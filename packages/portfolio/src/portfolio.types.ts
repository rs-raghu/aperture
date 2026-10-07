import { z } from "@aperture/validation";

const uuid = z.string().uuid(); const instant = z.string().datetime({ offset: true });
export function safePortfolioLink(value: string, allowEmail = false): boolean {
  if (value === "") return true;
  if (allowEmail && /^mailto:[^\s@?]+@[^\s@?]+$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}
const link = z.string().max(2048).refine((value) => safePortfolioLink(value), "Use an HTTPS link without embedded credentials.");
const contactLink = z.string().max(2048).refine((value) => safePortfolioLink(value, true), "Use an HTTPS link or an explicitly chosen mailto address.");
const entryShape = { id: uuid, title: z.string().trim().min(1).max(180), subtitle: z.string().trim().max(180), description: z.string().trim().max(3000), period: z.string().trim().max(100) };
export const portfolioEntrySchema = z.strictObject({ ...entryShape, url: link }).readonly();
export type PortfolioEntry = z.infer<typeof portfolioEntrySchema>;
const entries = z.array(portfolioEntrySchema).max(100).refine((rows) => new Set(rows.map((row) => row.id)).size === rows.length, "Section identifiers must be unique.").readonly();
export const portfolioContentSchema = z.strictObject({
  profile: z.strictObject({ displayName: z.string().trim().max(120), headline: z.string().trim().max(200), biography: z.string().trim().max(6000), location: z.string().trim().max(120) }).readonly(),
  skills: entries, projects: entries, experience: entries, educationHighlights: entries, certifications: entries,
  contactLinks: z.array(z.strictObject({ ...entryShape, url: contactLink }).readonly()).max(30).refine((rows) => rows.every((row) => row.url !== "") && new Set(rows.map((row) => row.id)).size === rows.length, "Contact links need a destination and unique identifiers.").readonly(),
  resumeUrl: link,
}).readonly();
export type PortfolioContent = z.infer<typeof portfolioContentSchema>;
export const publicPortfolioSchema = z.strictObject({ content: portfolioContentSchema.refine((content) => content.profile.displayName.length > 0 && content.profile.headline.length > 0 && content.profile.biography.length > 0, "Add a name, headline, and biography before preparing a public snapshot."), publishedAt: instant }).readonly();
export type PublicPortfolio = z.infer<typeof publicPortfolioSchema>;
export const portfolioDraftSchema = z.strictObject({ id: uuid, ownerId: uuid, revision: z.number().int().nonnegative().safe(), createdAt: instant, updatedAt: instant, content: portfolioContentSchema, publication: publicPortfolioSchema.nullable() }).refine((record) => Date.parse(record.updatedAt) >= Date.parse(record.createdAt), "Update time must follow creation time.").readonly();
export type PortfolioDraft = z.infer<typeof portfolioDraftSchema>;
export interface PortfolioRepository { find(ownerId: string): Promise<PortfolioDraft | null>; save(value: PortfolioDraft, expectedRevision: number): Promise<boolean>; }
export interface PortfolioRecoveryRepository extends PortfolioRepository { deleteAll(ownerId: string): Promise<void>; restore(value: PortfolioDraft): Promise<void>; }
export interface PortfolioRuntime { readonly ownerId: string; readonly service: ReturnType<typeof import("./portfolio.service.js").createPortfolioService>; }
export class PortfolioConflictError extends Error { public readonly name = "PortfolioConflictError"; public constructor() { super("The portfolio changed on another device. Reload before saving again."); } }
export const PORTFOLIO_SECTIONS = [
  { key: "skills", title: "Skills", itemLabel: "Skill", subtitleLabel: "Focus or proficiency" },
  { key: "projects", title: "Projects", itemLabel: "Project", subtitleLabel: "Role or technologies" },
  { key: "experience", title: "Experience", itemLabel: "Role", subtitleLabel: "Organization" },
  { key: "educationHighlights", title: "Education highlights", itemLabel: "Achievement", subtitleLabel: "Institution" },
  { key: "certifications", title: "Certifications", itemLabel: "Certification", subtitleLabel: "Issuer" },
  { key: "contactLinks", title: "Contact links", itemLabel: "Link label", subtitleLabel: "Context" },
] as const;
export type PortfolioSectionKey = typeof PORTFOLIO_SECTIONS[number]["key"];
export const PORTFOLIO_PROFILE_FIELDS = [{ key: "displayName", label: "Display name" }, { key: "headline", label: "Headline" }, { key: "biography", label: "Biography" }, { key: "location", label: "Location" }] as const;
export const PORTFOLIO_ENTRY_FIELDS = [{ key: "title", label: "Title" }, { key: "subtitle", label: "Organization or context" }, { key: "description", label: "Description" }, { key: "period", label: "Period or date" }, { key: "url", label: "Link" }] as const;
export function updatePortfolioEntry(content: PortfolioContent, section: PortfolioSectionKey, id: string, field: typeof PORTFOLIO_ENTRY_FIELDS[number]["key"], value: string): PortfolioContent { return { ...content, [section]: content[section].map((entry) => entry.id === id ? { ...entry, [field]: value } : entry) }; }
export function portfolioErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) { const issue = error.issues[0]; return issue === undefined ? "Check your portfolio fields." : `${issue.path.join(".") || "Portfolio"}: ${issue.message}`; }
  return error instanceof Error ? error.message : "The portfolio operation could not be completed.";
}
export function emptyPortfolioContent(): PortfolioContent { return { profile: { displayName: "", headline: "", biography: "", location: "" }, skills: [], projects: [], experience: [], educationHighlights: [], certifications: [], contactLinks: [], resumeUrl: "" }; }
export function newPortfolioEntry(id: string): PortfolioEntry { return { id, title: "", subtitle: "", description: "", period: "", url: "" }; }
