import { describe, expect, it } from "vitest";

import { createFinanceMemoryRepository } from "../../src/index.js";
import { NOW, OWNER_A, repositoryFixtures } from "../fixtures/finance-fixtures.js";

interface RuntimeEntity extends Readonly<Record<string, unknown>> {
  readonly id: string;
  readonly ownerId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface RuntimeRepository {
  create(input: unknown): Promise<RuntimeEntity>;
  update(id: string, ownerId: string, input: unknown): Promise<RuntimeEntity>;
  delete(id: string, ownerId: string): Promise<void>;
  findById(id: string, ownerId: string): Promise<RuntimeEntity | null>;
  findMany(query: unknown): Promise<{ readonly items: readonly RuntimeEntity[]; readonly nextCursor?: string }>;
}

function runtimeRepositories() {
  return createFinanceMemoryRepository({ now: () => NOW }) as unknown as Readonly<Record<string, RuntimeRepository>>;
}

describe("Finance memory repository contract", () => {
  it("implements every declared aggregate repository", () => {
    expect(Object.keys(runtimeRepositories()).sort()).toEqual(repositoryFixtures.map(({ key }) => key).sort());
  });

  for (const fixture of repositoryFixtures) {
    it(`${fixture.key} supports create, get, update, list, delete, and owner scope`, async () => {
      const adapter = runtimeRepositories()[fixture.key];
      expect(adapter).toBeDefined();
      const repository = adapter!;
      const created = await repository.create(structuredClone(fixture.input));
      expect(created).toMatchObject({ ownerId: OWNER_A, source: "manual", createdAt: NOW, updatedAt: NOW });
      expect(await repository.findById(created.id, OWNER_A)).toEqual(created);
      expect(await repository.findById(created.id, "other-owner")).toBeNull();
      const updated = await repository.update(created.id, OWNER_A, {});
      expect(updated).toEqual(created);
      expect((await repository.findMany({ ownerId: OWNER_A })).items).toEqual([created]);
      expect((await repository.findMany({ ownerId: "other-owner" })).items).toEqual([]);
      await repository.delete(created.id, OWNER_A);
      expect(await repository.findById(created.id, OWNER_A)).toBeNull();
    });
  }
});
