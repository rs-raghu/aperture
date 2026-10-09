"use client";

import type { BackupService, RecoveryClient } from "@aperture/backup";
import { createContext, useContext, type ReactNode } from "react";

export interface BackupWebRuntime {
  readonly service: BackupService;
  readonly ownerId: string;
  readonly canMutate: boolean;
  readonly recovery?: RecoveryClient;
}

const BackupContext = createContext<BackupWebRuntime | null>(null);

export function BackupProvider({ runtime, children }: { readonly runtime: BackupWebRuntime; readonly children: ReactNode }) {
  return <BackupContext.Provider value={runtime}>{children}</BackupContext.Provider>;
}

export function useBackup(): BackupWebRuntime {
  const value = useContext(BackupContext);
  if (value === null) throw new Error("useBackup must be used within BackupProvider.");
  return value;
}
