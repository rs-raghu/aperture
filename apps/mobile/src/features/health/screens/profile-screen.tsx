import { useCallback, useState } from "react";
import type { HealthProfile } from "@aperture/health";
import { ActionButton, ChoiceField, ErrorBanner, LoadingState, PageHeader, Panel, PreviewNotice, Screen, TextField } from "../components/ui";
import { useHealthAction } from "../hooks/use-health-action";
import { useHealthQuery } from "../hooks/use-health-query";
import { useHealth } from "../providers/health-provider";

export function ProfileScreen() {
  const { service, context } = useHealth();
  const load = useCallback(() => service.getHealthProfile(context), [service, context]);
  const query = useHealthQuery(load);
  return <Screen testID="health-profile-screen"><PageHeader title="Health profile" description="Choose display conventions for the synthetic mobile preview." /><PreviewNotice />{query.loading ? <LoadingState /> : <ProfileForm profile={query.data} />}<ErrorBanner error={query.error} /><Panel title="Privacy boundary" description="This local preview is volatile and observational."><></></Panel></Screen>;
}

function ProfileForm({ profile }: { readonly profile: HealthProfile | null }) {
  const { service, context } = useHealth();
  const action = useHealthAction();
  const [measurementSystem, setMeasurementSystem] = useState<"metric" | "imperial">(profile?.measurementSystem ?? "metric");
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const submit = () => void action.execute(() => profile ? service.updateHealthProfile(context, profile.id, { measurementSystem, ...(birthDate ? { birthDate } : {}) }) : service.createHealthProfile(context, { measurementSystem, ...(birthDate ? { birthDate } : {}) }));
  return <Panel title={profile ? "Edit profile" : "Create profile"}><ChoiceField label="Measurement system" value={measurementSystem} options={[{ value: "metric", label: "Metric" }, { value: "imperial", label: "Imperial" }]} onChange={setMeasurementSystem} required /><TextField name="birthDate" label="Birth date" value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" error={action.error?.fieldErrors.birthDate} /><ErrorBanner error={action.error} /><ActionButton label={profile ? "Save profile" : "Create profile"} pending={action.pending} onPress={submit} /></Panel>;
}
