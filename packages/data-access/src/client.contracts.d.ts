import type { RepositoryContext } from "./data-access.types.js";
import type { TransactionContract } from "./transaction.contracts.js";

export interface DataClient {
  readonly kind: string;
  createContext(): Promise<RepositoryContext>;
  beginTransaction(context: RepositoryContext): Promise<TransactionContract>;
}
