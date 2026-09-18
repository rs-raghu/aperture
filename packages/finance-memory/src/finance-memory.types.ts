export interface CreateFinanceMemoryRepositoryOptions {
  readonly cloneValues?: boolean;
  readonly now?: () => string;
  readonly generateId?: (collection: string, sequence: number) => string;
}
