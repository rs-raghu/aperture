export type MobileStorageClassification = "public_preference" | "session_sensitive";
export interface MobileStorageRecord { readonly key: string; readonly value: string; readonly classification: MobileStorageClassification; }
export interface MobileStorageContract { get(key: string): Promise<MobileStorageRecord | null>; set(record: MobileStorageRecord): Promise<void>; remove(key: string): Promise<void>; }
