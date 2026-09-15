"use client";

import { useCallback, type FormEvent } from "react";
import { useHealth } from "../providers/health-provider";
import { useHealthAction } from "../hooks/use-health-action";
import { useHealthQuery } from "../hooks/use-health-query";
import { ErrorBanner, LoadingState, PageHeader, Panel, SelectInput, SubmitButton, TextInput } from "../components/ui";

export function ProfileScreen() {
  const { service, context } = useHealth();
  const action = useHealthAction();
  const load = useCallback(() => service.getHealthProfile(context), [service, context]);
  const query = useHealthQuery(load);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const measurementSystem = String(form.get("measurementSystem")) as "metric" | "imperial";
    const birthDate = String(form.get("birthDate") ?? "");
    const input = { measurementSystem, ...(birthDate ? { birthDate } : {}) };
    void action.execute(() => query.data === null
      ? service.createHealthProfile(context, input)
      : service.updateHealthProfile(context, query.data.id, input));
  };

  return <>
    <PageHeader eyebrow="Setup" title="Health profile" description="Choose display conventions for this local preview. Birth date is optional and is stored only in memory." />
    <div className="grid grid-2">
      <Panel title={query.data ? "Edit profile" : "Create profile"} description="One profile is allowed for the synthetic preview owner.">
        <ErrorBanner error={query.error ?? action.error} />
        {query.loading ? <LoadingState /> : <form className="form-grid" onSubmit={submit} key={query.data?.updatedAt ?? "new"}>
          <SelectInput label="Measurement system *" name="measurementSystem" defaultValue={query.data?.measurementSystem ?? "metric"}>
            <option value="metric">Metric</option><option value="imperial">Imperial</option>
          </SelectInput>
          <TextInput label="Birth date" name="birthDate" type="date" defaultValue={query.data?.birthDate ?? ""} />
          <div className="form-actions"><SubmitButton pending={action.pending}>{query.data ? "Save profile" : "Create profile"}</SubmitButton></div>
        </form>}
      </Panel>
      <Panel title="Privacy boundary" description="What this preview does with profile data.">
        <ul className="health-notes"><li>Uses a visible synthetic owner identifier.</li><li>Stores values only in the mounted in-memory runtime.</li><li>Does not authenticate, diagnose, recommend, upload, or synchronize.</li></ul>
      </Panel>
    </div>
  </>;
}
