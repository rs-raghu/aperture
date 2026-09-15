import { useCallback, useMemo, useState } from "react";
import type { HealthMeasurementType } from "@aperture/health";
import { ActionButton, ChoiceField, EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, PreviewNotice, RecordCard, RecordList, Screen, TextField } from "../components/ui";
import { useHealthAction } from "../hooks/use-health-action";
import { useHealthQuery } from "../hooks/use-health-query";
import { useHealth } from "../providers/health-provider";
import { formatHealthDateTime, formatHealthQuantity, toHealthIsoTimestamp } from "../view-models/formatting";

const types: readonly HealthMeasurementType[] = ["weight", "height", "waist", "hip"];

export function MeasurementsScreen() {
  const { service, context } = useHealth();
  const action = useHealthAction();
  const [type, setType] = useState<HealthMeasurementType>("weight");
  const [value, setValue] = useState("");
  const [observedAt, setObservedAt] = useState("");
  const [filter, setFilter] = useState<HealthMeasurementType | "all">("all");
  const load = useCallback(async () => (await service.listHealthMeasurements(context)).items, [service, context]);
  const query = useHealthQuery(load);
  const visible = useMemo(() => (query.data ?? []).filter((item) => filter === "all" || item.type === filter), [query.data, filter]);
  const submit = () => { const unit = type === "weight" ? "kilogram" as const : type === "height" ? "centimeter" as const : "meter" as const; void action.execute(() => service.recordHealthMeasurement(context, { type, measurement: { value, unit }, observedAt: toHealthIsoTimestamp(observedAt) })).then((saved) => { if (saved) { setValue(""); setObservedAt(""); } }); };
  return <Screen testID="health-measurements-screen"><PageHeader title="Measurements" description="Record body observations with explicit units and no interpretation." /><PreviewNotice /><Panel title="Record measurement"><ChoiceField label="Measurement type" value={type} options={types.map((item) => ({ value: item, label: item }))} onChange={setType} required /><TextField name="measurement" label="Value" required value={value} onChangeText={setValue} keyboardType="decimal-pad" error={action.error?.fieldErrors.measurement} /><TextField name="observedAt" label="Observed at" required value={observedAt} onChangeText={setObservedAt} placeholder="YYYY-MM-DDTHH:mm:ssZ" keyboardType="numbers-and-punctuation" error={action.error?.fieldErrors.observedAt} /><ErrorBanner error={action.error} /><ActionButton label="Record measurement" pending={action.pending} onPress={submit} /></Panel><Panel title="Measurement history"><ChoiceField label="Measurement filter" value={filter} options={[{ value: "all", label: "All" }, ...types.map((item) => ({ value: item, label: item }))]} onChange={setFilter} /><ErrorBanner error={query.error} />{query.loading ? <LoadingState /> : !visible.length ? <EmptyState title="No measurements found" description="Record a measurement or change the filter." /> : <RecordList items={visible} keyExtractor={(item) => item.id} accessibilityLabel="Health measurement records" renderItem={(item) => <RecordCard title={item.type} details={[formatHealthQuantity(item.measurement), formatHealthDateTime(item.observedAt)]}><ActionButton label={`Delete ${item.type} measurement`} tone="danger" pending={action.pending} onPress={() => void action.execute(() => service.deleteHealthMeasurement(context, item.id))} /></RecordCard>} />}</Panel></Screen>;
}
