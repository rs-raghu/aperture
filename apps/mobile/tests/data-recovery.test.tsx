import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { createBackupService } from "@aperture/backup";
import { createBackupFeatureAdapters, createPreviewRepositorySet } from "@aperture/supabase-repositories";
import { BackupProvider, DataRecoveryScreen } from "../src/features/settings";

const OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("mobile data recovery", () => {
  it("generates plaintext backup JSON and validates replacement before mutation", async () => {
    const repositories = createPreviewRepositorySet();
    const runtime = {
      ownerId: OWNER, canMutate: false,
      service: createBackupService({
        adapters: createBackupFeatureAdapters(repositories),
        clock: { now: () => "2040-06-01T08:00:00.000Z" }, idGenerator: { generate: () => "00000000-0000-4000-8000-000000000901" },
        transactionRunner: { async run() { throw new Error("mutations unavailable"); } },
      }),
    };
    const view = await render(<BackupProvider runtime={runtime}><DataRecoveryScreen /></BackupProvider>);
    expect(view.getByText("Keep a recovery copy")).toBeTruthy();
    expect(view.getByText(/Privacy warning/)).toBeTruthy();
    await fireEvent.press(view.getByRole("button", { name: "Generate full backup" }));
    await waitFor(() => expect(view.getByText(/Generated 0 records/)).toBeTruthy());
    await fireEvent.press(view.getByRole("button", { name: "Validate replacement" }));
    await waitFor(() => expect(view.getByText(/Ready for reviewed restore/)).toBeTruthy());
  });
});
