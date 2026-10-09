import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createBackupService } from "@aperture/backup";
import { createBackupFeatureAdapters, createPreviewRepositorySet } from "@aperture/supabase-repositories";
import { BackupProvider, DataRecoveryScreen } from "@/features/settings";

const OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function runtime() {
  const repositories = createPreviewRepositorySet();
  let sequence = 0;
  return {
    ownerId: OWNER,
    canMutate: false,
    service: createBackupService({
      adapters: createBackupFeatureAdapters(repositories),
      clock: { now: () => "2040-06-01T08:00:00.000Z" },
      idGenerator: { generate: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}` },
      transactionRunner: { async run() { throw new Error("mutations unavailable"); } },
    }),
  };
}

describe("web data recovery", () => {
  it("applies server-reviewed restores and deletions only after exact confirmation", async () => {
    const value = runtime();
    const restore = vi.fn(async () => {}); const deleteData = vi.fn(async () => {});
    const confirmation = `REPLACE ${OWNER} digest state`; const deleteConfirmation = `DELETE ${OWNER} education 1 state`;
    const recovery = { status: async () => ({ enabled: true }), previewRestore: async () => ({ valid: true, mode: "replace" as const, issues: [], conflicts: 1, additions: 0, replacements: 1, deletions: 1, stateChecksum: "state", confirmation }), restore, previewDeletion: async () => ({ ownerId: OWNER, featureIds: ["education"], recordCount: 1, stateChecksum: "state", confirmation: deleteConfirmation }), deleteData };
    render(<BackupProvider runtime={{ ...value, canMutate: true, recovery }}><DataRecoveryScreen /></BackupProvider>);
    await screen.findByRole("button", { name: "Preview selected deletion" });
    fireEvent.click(screen.getByRole("button", { name: "Download JSON backup" })); await screen.findByText(/Generated 0 records/);
    fireEvent.change(screen.getByLabelText("Import mode"), { target: { value: "replace" } }); fireEvent.click(screen.getByRole("button", { name: "Validate and preview" })); await screen.findByText("Ready for reviewed restore");
    fireEvent.change(screen.getByLabelText("Restore confirmation"), { target: { value: "incorrect" } }); expect(screen.getByRole("button", { name: "Apply reviewed restore" }).hasAttribute("disabled")).toBe(true); expect(restore).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Restore confirmation"), { target: { value: confirmation } }); fireEvent.click(screen.getByRole("button", { name: "Apply reviewed restore" })); await screen.findByText(/Archive restored/); expect(restore).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Preview selected deletion" })); await screen.findByText(/Delete 1 records from education/);
    expect(screen.getByRole("button", { name: "Delete reviewed data" }).hasAttribute("disabled")).toBe(true);
    fireEvent.change(screen.getByLabelText("Deletion confirmation"), { target: { value: deleteConfirmation } }); fireEvent.click(screen.getByRole("button", { name: "Delete reviewed data" })); await screen.findByText(/Selected data deleted/); expect(deleteData).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Validate and preview" })); await screen.findByText("Ready for reviewed restore"); fireEvent.change(screen.getByLabelText("Backup JSON"), { target: { value: "{}" } }); expect(screen.queryByRole("button", { name: "Apply reviewed restore" })).toBeNull();
  });
  it("creates feature-scoped exports and validates a dry-run without mutation", async () => {
    const value = runtime();
    render(<BackupProvider runtime={value}><DataRecoveryScreen /></BackupProvider>);
    expect(screen.getByRole("heading", { name: "Keep a recovery copy" })).toBeTruthy();
    expect(screen.getByText(/Plaintext export/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Export Health"));
    fireEvent.click(screen.getByLabelText("Export Finance"));
    fireEvent.click(screen.getByLabelText("Export Planner"));
    fireEvent.click(screen.getByLabelText("Export Settings"));
    fireEvent.click(screen.getByRole("button", { name: "Download JSON backup" }));
    expect(await screen.findByText(/Generated 0 records/)).toBeTruthy();

    const backup = await value.service.export(OWNER, ["education"]);
    fireEvent.change(screen.getByLabelText("Backup JSON"), { target: { value: value.service.serialize(backup) } });
    fireEvent.change(screen.getByLabelText("Import mode"), { target: { value: "replace" } });
    fireEvent.click(screen.getByRole("button", { name: "Validate and preview" }));
    await waitFor(() => expect(screen.getByText("Ready for reviewed restore")).toBeTruthy());
    expect(screen.getByText(/Required confirmation/)).toBeTruthy();
    expect(screen.getByText(/0 additions · 0 replacements · 0 deletions/)).toBeTruthy();
  });
});
