export function formatHealthDateTime(value?: string): string {
  return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not set";
}

export function toHealthIsoTimestamp(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

export function formatHealthQuantity(value: { readonly value: string | number; readonly unit: string } | undefined): string {
  return value ? `${value.value} ${value.unit.replaceAll("_", " ")}` : "Not recorded";
}
