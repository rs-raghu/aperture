import type { BackupService, RecoveryClient } from "@aperture/backup";
import { createContext, useContext, type ReactNode } from "react";

export interface BackupMobileRuntime { readonly service: BackupService; readonly ownerId: string; readonly canMutate: boolean; readonly recovery?: RecoveryClient; }
const BackupContext = createContext<BackupMobileRuntime | null>(null);
export function BackupProvider({ runtime, children }: { readonly runtime: BackupMobileRuntime; readonly children: ReactNode }) { return <BackupContext.Provider value={runtime}>{children}</BackupContext.Provider>; }
export function useBackup(): BackupMobileRuntime { const value = useContext(BackupContext); if (value === null) throw new Error("useBackup must be used within BackupProvider."); return value; }
