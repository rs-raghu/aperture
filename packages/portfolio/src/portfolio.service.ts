import { emptyPortfolioContent, newPortfolioEntry, PortfolioConflictError, portfolioContentSchema, portfolioDraftSchema, publicPortfolioSchema, type PortfolioRepository, type PortfolioDraft, type PublicPortfolio } from "./portfolio.types.js";
import { z } from "@aperture/validation";

export function createPortfolioService(dependencies: { readonly repository: PortfolioRepository; readonly clock: { now(): string }; readonly idGenerator: { generate(): string } }) {
  const owner = (ownerId: string) => z.string().uuid().parse(ownerId);
  async function getDraft(ownerId: string): Promise<PortfolioDraft> {
    owner(ownerId); const current = await dependencies.repository.find(ownerId);
    if (current !== null) { const valid = portfolioDraftSchema.parse(current); if (valid.ownerId !== ownerId) throw new Error("Portfolio owner mismatch."); return valid; }
    const now = dependencies.clock.now();
    return portfolioDraftSchema.parse({ id: dependencies.idGenerator.generate(), ownerId, revision: 0, createdAt: now, updatedAt: now, content: emptyPortfolioContent(), publication: null });
  }
  async function save(current: PortfolioDraft, expectedRevision: number, changes: Partial<Pick<PortfolioDraft, "content" | "publication">>): Promise<PortfolioDraft> {
    if (current.revision !== expectedRevision) throw new PortfolioConflictError();
    const record = portfolioDraftSchema.parse({ ...current, ...changes, revision: current.revision + 1, updatedAt: dependencies.clock.now() });
    if (!await dependencies.repository.save(record, expectedRevision)) throw new PortfolioConflictError(); return record;
  }
  return {
    createEntry: () => newPortfolioEntry(dependencies.idGenerator.generate()),
    getDraft,
    async saveDraft(ownerId: string, content: unknown, expectedRevision: number) { return save(await getDraft(ownerId), expectedRevision, { content: portfolioContentSchema.parse(content) }); },
    async preparePublication(ownerId: string, expectedRevision: number, confirmation: string) {
      owner(ownerId); if (confirmation !== `PUBLISH PORTFOLIO ${ownerId}`) throw new Error("Preparing a public snapshot requires the exact owner confirmation.");
      const current = await getDraft(ownerId); const publication = publicPortfolioSchema.parse({ content: current.content, publishedAt: dependencies.clock.now() });
      return save(current, expectedRevision, { publication });
    },
    async unpublish(ownerId: string, expectedRevision: number) { return save(await getDraft(ownerId), expectedRevision, { publication: null }); },
    async readPublic(ownerId: string, configured: boolean): Promise<PublicPortfolio | null> {
      if (!configured) return null;
      const current = await dependencies.repository.find(owner(ownerId)); if (current === null) return null;
      const record = portfolioDraftSchema.parse(current); if (record.ownerId !== ownerId) throw new Error("Portfolio owner mismatch.");
      return record.publication === null ? null : publicPortfolioSchema.parse(record.publication);
    },
  };
}
