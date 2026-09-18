import { describe, expect, it } from "vitest";
import type { FinancialAccount, Transaction } from "@aperture/finance";

import { FinanceMemoryRepositoryError, createFinanceMemoryRepository } from "../../src/index.js";
import { NOW, OWNER_A, OWNER_B } from "../fixtures/finance-fixtures.js";

const money = (amount: string, currency = "USD") => ({ amount, currency });

describe("Finance memory query behavior", () => {
  it("isolates factory instances and owners", async () => {
    const first = createFinanceMemoryRepository({ now: () => NOW });
    const second = createFinanceMemoryRepository({ now: () => NOW });
    const created = await first.accounts.create({ ownerId: OWNER_A, name: "Checking", accountType: "bank", currency: "USD" });
    await first.accounts.create({ ownerId: OWNER_B, name: "Other", accountType: "bank", currency: "USD" });
    expect((await first.accounts.findMany({ ownerId: OWNER_A })).items).toEqual([created]);
    expect((await second.accounts.findMany({ ownerId: OWNER_A })).items).toEqual([]);
  });

  it("defensively clones nested decimal strings on writes and reads", async () => {
    const repository = createFinanceMemoryRepository({ now: () => NOW }).assets;
    const input = { ownerId: OWNER_A, name: "Home", assetType: "property" as const, currentValue: money("300000.0000"), valuedOn: "2040-01-01" };
    const created = await repository.create(input);
    input.currentValue.amount = "1";
    (created.currentValue as { amount: string }).amount = "2";
    const stored = await repository.findById(created.id, OWNER_A);
    expect(stored?.currentValue.amount).toBe("300000.0000");
  });

  it("provides deterministic ordering, stable pages, and mutation-sensitive cursors", async () => {
    const repository = createFinanceMemoryRepository({ now: () => NOW }).accounts;
    await repository.create({ ownerId: OWNER_A, name: "Bravo", accountType: "bank", currency: "USD" });
    await repository.create({ ownerId: OWNER_A, name: "Alpha", accountType: "cash", currency: "USD" });
    await repository.create({ ownerId: OWNER_A, name: "Charlie", accountType: "bank", currency: "INR" });
    const first = await repository.findMany({ ownerId: OWNER_A, limit: 1 });
    expect(first.items.map(({ name }: FinancialAccount) => name)).toEqual(["Alpha"]);
    const second = await repository.findMany({ ownerId: OWNER_A, limit: 1, cursor: first.nextCursor });
    expect(second.items.map(({ name }: FinancialAccount) => name)).toEqual(["Bravo"]);
    const third = await repository.findMany({ ownerId: OWNER_A, limit: 1, cursor: second.nextCursor });
    expect(third.items.map(({ name }: FinancialAccount) => name)).toEqual(["Charlie"]);

    const stale = await repository.findMany({ ownerId: OWNER_A, limit: 1 });
    await repository.create({ ownerId: OWNER_A, name: "Delta", accountType: "bank", currency: "USD" });
    await expect(repository.findMany({ ownerId: OWNER_A, limit: 1, cursor: stale.nextCursor })).rejects.toMatchObject({ code: "finance-memory-invalid-query" });
  });

  it("filters accounts and transactions by owner, account, category, currency, and date while preserving decimals", async () => {
    const repositories = createFinanceMemoryRepository({ now: () => NOW });
    const usdAccount = await repositories.accounts.create({ ownerId: OWNER_A, name: "USD", accountType: "bank", currency: "USD" });
    await repositories.accounts.create({ ownerId: OWNER_A, name: "INR", accountType: "bank", currency: "INR" });
    expect((await repositories.accounts.findMany({ ownerId: OWNER_A, accountType: "bank", currency: "USD" })).items.map(({ name }: FinancialAccount) => name)).toEqual(["USD"]);

    await repositories.transactions.create({ ownerId: OWNER_A, accountId: usdAccount.id, categoryId: "food", description: "Older USD", transactionType: "expense", amount: money("12.3400"), occurredAt: "2040-01-02T10:00:00Z" });
    await repositories.transactions.create({ ownerId: OWNER_A, accountId: usdAccount.id, categoryId: "food", description: "Newer USD", transactionType: "expense", amount: money("8.6600"), occurredAt: "2040-01-03T10:00:00Z" });
    await repositories.transactions.create({ ownerId: OWNER_A, accountId: "other-account", categoryId: "travel", description: "INR", transactionType: "expense", amount: money("1000.0000", "INR"), occurredAt: "2040-01-03T12:00:00Z" });
    await repositories.transactions.create({ ownerId: OWNER_B, accountId: usdAccount.id, categoryId: "food", description: "Other owner", transactionType: "expense", amount: money("99.0000"), occurredAt: "2040-01-03T14:00:00Z" });

    const result = await repositories.transactions.findMany({ ownerId: OWNER_A, accountId: usdAccount.id, categoryId: "food", currency: "USD", range: { startsOn: "2040-01-02", endsOn: "2040-01-03" } });
    expect(result.items.map(({ description }: Transaction) => description)).toEqual(["Newer USD", "Older USD"]);
    expect(result.items.map(({ amount }: Transaction) => amount.amount)).toEqual(["8.6600", "12.3400"]);
    const inr = await repositories.transactions.findMany({ ownerId: OWNER_A, currency: "INR" });
    expect(inr.items).toHaveLength(1);
    expect(inr.items[0]?.amount).toEqual(money("1000.0000", "INR"));
  });

  it("reports duplicate, missing, immutable, invalid entity, and invalid query failures", async () => {
    const repository = createFinanceMemoryRepository({ now: () => NOW }).accounts;
    const created = await repository.create({ ownerId: OWNER_A, name: "Checking", accountType: "bank", currency: "USD" });
    await expect(repository.create(created as never)).rejects.toMatchObject({ code: "finance-memory-duplicate-id" });
    await expect(repository.update(created.id, OWNER_B, { name: "No" })).rejects.toMatchObject({ code: "finance-memory-record-not-found" });
    await expect(repository.update(created.id, OWNER_A, { id: "changed" } as never)).rejects.toMatchObject({ code: "finance-memory-immutable-identity" });
    await expect(repository.create({ ownerId: OWNER_A, name: "Bad", accountType: "bank", currency: "usd" })).rejects.toMatchObject({ code: "finance-memory-invalid-entity" });
    await expect(repository.findMany({ ownerId: OWNER_A, limit: 0 })).rejects.toMatchObject({ code: "finance-memory-invalid-query" });
    await expect(repository.findMany({ ownerId: OWNER_A, cursor: "bad" })).rejects.toBeInstanceOf(FinanceMemoryRepositoryError);
  });
});
