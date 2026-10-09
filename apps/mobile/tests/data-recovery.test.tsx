import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { createBackupService } from "@aperture/backup";
import { createBackupFeatureAdapters, createPreviewRepositorySet } from "@aperture/supabase-repositories";
import { BackupProvider, DataRecoveryScreen } from "../src/features/settings";

const OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("mobile data recovery", () => {
  it("uses the configured server and exact confirmations for reviewed mutations", async () => {
    const repositories = createPreviewRepositorySet();
    const service = createBackupService({ adapters: createBackupFeatureAdapters(repositories), clock: { now: () => "2040-06-01T08:00:00.000Z" }, idGenerator: { generate: () => "00000000-0000-4000-8000-000000000901" }, transactionRunner: { async run() { throw new Error("client mutations denied"); } } });
    const confirmation = `REPLACE ${OWNER} digest state`; const deleteConfirmation = `DELETE ${OWNER} education 1 state`;
    const restore = jest.fn(async () => {}); const deleteData = jest.fn(async () => {});
    const recovery = { status: async () => ({ enabled: true }), previewRestore: async () => ({ valid: true, mode: "replace" as const, issues: [], conflicts: 1, additions: 0, replacements: 1, deletions: 1, stateChecksum: "state", confirmation }), restore, previewDeletion: async () => ({ ownerId: OWNER, featureIds: ["education"], recordCount: 1, stateChecksum: "state", confirmation: deleteConfirmation }), deleteData };
    const view = await render(<BackupProvider runtime={{ ownerId: OWNER, canMutate: true, service, recovery }}><DataRecoveryScreen /></BackupProvider>);
    await view.findByRole("button", { name: "Preview selected deletion" }); await fireEvent.press(view.getByRole("button", { name: "Generate full backup" })); await view.findByText(/Generated 0 records/); await fireEvent.press(view.getByRole("button", { name: "Validate replacement" })); await view.findByLabelText("Restore confirmation");
    await fireEvent.changeText(view.getByLabelText("Restore confirmation"), "incorrect"); await fireEvent.press(view.getByRole("button", { name: "Apply reviewed restore" })); expect(restore).not.toHaveBeenCalled();
    await fireEvent.changeText(view.getByLabelText("Restore confirmation"), confirmation); await fireEvent.press(view.getByRole("button", { name: "Apply reviewed restore" })); await view.findByText(/Archive restored/); expect(restore).toHaveBeenCalledTimes(1);
    await fireEvent.press(view.getByRole("button", { name: "Preview selected deletion" })); await view.findByLabelText("Deletion confirmation"); await fireEvent.changeText(view.getByLabelText("Deletion confirmation"), deleteConfirmation); await fireEvent.press(view.getByRole("button", { name: "Delete reviewed data" })); await view.findByText(/Selected data deleted/); expect(deleteData).toHaveBeenCalledTimes(1);
  });
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
