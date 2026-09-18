import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import type { FinanceUiError } from "../view-models/finance-error";

export function FinancePageHeader({ eyebrow, title, description }: { readonly eyebrow: string; readonly title: string; readonly description: string }) {
  return <header className="page-header"><div><p className="eyebrow finance-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div></header>;
}

export function FinancePanel({ title, description, children, className = "" }: { readonly title: string; readonly description?: string; readonly children: ReactNode; readonly className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-heading"><h2>{title}</h2>{description && <p>{description}</p>}</div>{children}</section>;
}

export function FinanceField({ label, name, error, hint, children }: { readonly label: string; readonly name: string; readonly error?: string | undefined; readonly hint?: string | undefined; readonly children: ReactNode }) {
  const messageId = `${name}-message`;
  return <div className="field"><label htmlFor={name}>{label}</label>{children}{(error || hint) && <p id={messageId} className={error ? "field-error" : "field-hint"}>{error ?? hint}</p>}</div>;
}

export function FinanceTextInput({ label, error, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { readonly label: string; readonly error?: string | undefined; readonly hint?: string | undefined }) {
  const id = props.id ?? String(props.name);
  return <FinanceField label={label} name={id} error={error} hint={hint}><input {...props} id={id} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-message` : undefined} /></FinanceField>;
}

export function FinanceSelectInput({ label, error, hint, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { readonly label: string; readonly error?: string | undefined; readonly hint?: string | undefined; readonly children: ReactNode }) {
  const id = props.id ?? String(props.name);
  return <FinanceField label={label} name={id} error={error} hint={hint}><select {...props} id={id} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-message` : undefined}>{children}</select></FinanceField>;
}

export function FinanceErrorBanner({ error }: { readonly error: FinanceUiError | null }) {
  return error ? <div className="error-banner" role="alert"><strong>Unable to continue</strong><span>{error.message}</span></div> : null;
}

export function FinanceLoadingState() {
  return <div className="loading-state" role="status"><span className="spinner" />Loading Finance data…</div>;
}

export function FinanceEmptyState({ title, description }: { readonly title: string; readonly description: string }) {
  return <div className="empty-state"><span aria-hidden="true">◇</span><h3>{title}</h3><p>{description}</p></div>;
}

export function FinanceStatusBadge({ value }: { readonly value: string }) {
  const label = value.replaceAll("_", " ");
  return <span className={`status-badge status-${value.replaceAll("_", "-")}`} aria-label={`Status: ${label}`}>{label}</span>;
}

export function FinanceSubmitButton({ pending, children }: { readonly pending: boolean; readonly children: ReactNode }) {
  return <button className="button button-primary finance-button" type="submit" disabled={pending}>{pending ? "Saving…" : children}</button>;
}

export function formatMoney(value: { readonly amount: string; readonly currency: string }): string {
  return `${value.currency} ${value.amount}`;
}

export function humanize(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()).replaceAll("Gpa", "GPA").replaceAll("Cgpa", "CGPA").replaceAll(" Id", " ID");
}

export function localDate(value: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}
