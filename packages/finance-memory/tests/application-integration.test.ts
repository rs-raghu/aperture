import { describe, expect, it } from "vitest";
import { allFinanceCalculatorPlugins, createFinanceApplicationService } from "@aperture/finance";

import { createFinanceMemoryRepository } from "../src/index.js";
import { NOW, OWNER_A, OWNER_B } from "./fixtures/finance-fixtures.js";

const money = (amount: string, currency = "USD") => ({ amount, currency });

describe("Finance application and memory repository integration", () => {
  it("runs an owner-scoped account and transaction workflow without changing decimal strings", async () => {
    let sequence = 0;
    const repositories = createFinanceMemoryRepository({ now: () => NOW });
    const service = createFinanceApplicationService({
      repositories,
      calculatorRegistry: allFinanceCalculatorPlugins,
      clock: { now: () => NOW },
      idGenerator: { next: (scope) => `${scope.replaceAll(" ", "-")}-${++sequence}` },
    });
    const owner = { ownerId: OWNER_A } as const;

    const account = await service.accounts.create(owner, { name: "Checking", accountType: "bank", currency: "USD" });
    const category = await service.categories.create(owner, { name: "Food", kind: "expense" });
    const transaction = await service.transactions.create(owner, {
      accountId: account.id,
      categoryId: category.id,
      description: "Lunch",
      transactionType: "expense",
      amount: money("12.3400"),
      occurredAt: "2040-01-02T10:00:00Z",
    });

    expect(transaction.amount.amount).toBe("12.3400");
    expect((await service.transactions.list(owner, { accountId: account.id, currency: "USD" })).items).toEqual([transaction]);
    expect((await service.summaries.transactions(owner, "USD")).expenses.amount).toBe("12.34");
    await expect(service.transactions.get({ ownerId: OWNER_B }, transaction.id)).rejects.toMatchObject({ code: "finance-not-found" });
  });
});
