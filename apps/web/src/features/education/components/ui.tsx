import Link from "next/link";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { EducationUiError } from "../view-models/education-error";

export function PageHeader({ eyebrow, title, description, action }: { readonly eyebrow: string; readonly title: string; readonly description: string; readonly action?: ReactNode }) {
  return <header className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</header>;
}

export function Panel({ title, description, children, className = "" }: { readonly title: string; readonly description?: string; readonly children: ReactNode; readonly className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-heading"><h2>{title}</h2>{description && <p>{description}</p>}</div>{children}</section>;
}

export function Field({ label, name, error, hint, children }: { readonly label: string; readonly name: string; readonly error?: string | undefined; readonly hint?: string | undefined; readonly children: ReactNode }) {
  const messageId = `${name}-message`;
  return <div className="field"><label htmlFor={name}>{label}</label>{children}{(error || hint) && <p id={messageId} className={error ? "field-error" : "field-hint"}>{error ?? hint}</p>}</div>;
}

export function TextInput({ label, error, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { readonly label: string; readonly error?: string | undefined; readonly hint?: string | undefined }) {
  const id = props.id ?? String(props.name);
  return <Field label={label} name={id} error={error} hint={hint}><input {...props} id={id} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-message` : undefined} /></Field>;
}

export function SelectInput({ label, error, hint, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { readonly label: string; readonly error?: string | undefined; readonly hint?: string | undefined; readonly children: ReactNode }) {
  const id = props.id ?? String(props.name);
  return <Field label={label} name={id} error={error} hint={hint}><select {...props} id={id} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-message` : undefined}>{children}</select></Field>;
}

export function TextArea({ label, error, hint, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { readonly label: string; readonly error?: string | undefined; readonly hint?: string | undefined }) {
  const id = props.id ?? String(props.name);
  return <Field label={label} name={id} error={error} hint={hint}><textarea {...props} id={id} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-message` : undefined} /></Field>;
}

export function ErrorBanner({ error }: { readonly error: EducationUiError | null }) {
  return error ? <div className="error-banner" role="alert"><strong>Unable to continue</strong><span>{error.message}</span></div> : null;
}

export function LoadingState() { return <div className="loading-state" role="status"><span className="spinner" />Loading Education data…</div>; }

export function EmptyState({ title, description, href, action }: { readonly title: string; readonly description: string; readonly href?: string; readonly action?: string }) {
  return <div className="empty-state"><span aria-hidden="true">◇</span><h3>{title}</h3><p>{description}</p>{href && action && <Link className="button button-primary" href={href}>{action}</Link>}</div>;
}

export function StatusBadge({ value }: { readonly value: string }) {
  return <span className={`status-badge status-${value.replaceAll("_", "-")}`}>{value.replaceAll("_", " ")}</span>;
}

export function SubmitButton({ pending, children }: { readonly pending: boolean; readonly children: ReactNode }) {
  return <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Saving…" : children}</button>;
}

export function formatDateTime(value?: string): string {
  return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not set";
}

export function formatDate(value?: string): string {
  return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) : "Not set";
}

export function toIsoTimestamp(value: string): string {
  if (!value) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}
