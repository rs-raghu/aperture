import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
