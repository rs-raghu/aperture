import { createElement, type ReactNode } from "react";
import { createPortfolioMemoryRepository, createPortfolioService, type PortfolioRuntime } from "@aperture/portfolio";
import { createSupabasePortfolioRepository } from "@aperture/portfolio/supabase";
import { createPortfolioBackupAdapter } from "@aperture/portfolio/backup";
import type { FeatureDataContext, FeatureDataContribution } from "../../lib/data/feature-data-contribution";
import { PortfolioProvider } from "./provider";
export class PortfolioDataContribution implements FeatureDataContribution {
  readonly featureId = "portfolio";
  readonly runtime: PortfolioRuntime;
  readonly backupAdapters: FeatureDataContribution["backupAdapters"];
  constructor(context: FeatureDataContext) {
    const repository = context.client === null ? createPortfolioMemoryRepository() : createSupabasePortfolioRepository(context.client);
    this.runtime = { ownerId: context.ownerId, service: createPortfolioService({ repository, clock: context.clock, idGenerator: context.idGenerator }) };
    this.backupAdapters = [createPortfolioBackupAdapter(repository)];
  }
  wrap(children: ReactNode) { return createElement(PortfolioProvider, { runtime: this.runtime }, children); }
}
export function createPortfolioDataContribution(context: FeatureDataContext): PortfolioDataContribution { return new PortfolioDataContribution(context); }
