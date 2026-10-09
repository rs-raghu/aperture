import type { ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BackupFeatureAdapter } from "@aperture/backup";
export interface FeatureDataContext { readonly ownerId: string; readonly client: SupabaseClient | null; readonly clock: { now(): string }; readonly idGenerator: { generate(): string }; }
export interface FeatureDataContribution { readonly featureId: string; readonly backupAdapters: readonly BackupFeatureAdapter[]; wrap(children: ReactNode): ReactNode; }
export type FeatureDataContributionFactory = (context: FeatureDataContext) => FeatureDataContribution;
