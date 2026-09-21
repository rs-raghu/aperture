import { Link, useRouter, type Href } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { financeColors as colors, financeSpacing as spacing } from "../styles/tokens";
import type { FinanceMobileError } from "../view-models/finance-error";

export function Screen({ children, testID }: { readonly children: ReactNode; readonly testID?: string }) {
  return <SafeAreaView style={styles.safeArea} testID={testID}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>{children}</ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

export function PageHeader({ title, description, eyebrow }: { readonly title: string; readonly description: string; readonly eyebrow?: string }) {
  return <View style={styles.header} accessibilityRole="header">{eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}<Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text></View>;
}

export function PreviewNotice() {
  return <View style={styles.notice} accessibilityRole="summary"><Text style={styles.noticeTitle}>Development preview</Text><Text style={styles.noticeText}>Finance data uses a synthetic test identity, stays in memory, and resets when the app reloads. Never enter bank passwords, PINs, one-time codes, card security codes, or other banking credentials.</Text></View>;
}

export function Panel({ title, description, children }: { readonly title: string; readonly description?: string; readonly children: ReactNode }) {
  return <View style={styles.panel}><Text style={styles.panelTitle}>{title}</Text>{description ? <Text style={styles.panelDescription}>{description}</Text> : null}<View style={styles.panelBody}>{children}</View></View>;
}

export interface TextFieldProps {
  readonly label: string; readonly value: string; readonly onChangeText: (value: string) => void; readonly name: string;
  readonly error?: string; readonly hint?: string; readonly placeholder?: string; readonly keyboardType?: KeyboardTypeOptions;
  readonly multiline?: boolean; readonly required?: boolean; readonly autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export function TextField({ label, value, onChangeText, name, error, hint, required, autoCapitalize = "sentences", ...props }: TextFieldProps) {
  return <View style={styles.field}><Text style={styles.label}>{label}{required ? " *" : ""}</Text><TextInput {...props} value={value} onChangeText={onChangeText} style={[styles.input, props.multiline ? styles.textArea : null, error ? styles.inputError : null]} accessibilityLabel={label} accessibilityHint={error ?? hint} testID={`finance-field-${name}`} autoCapitalize={autoCapitalize} autoCorrect={false} placeholderTextColor="#81758d" />{error || hint ? <Text style={error ? styles.fieldError : styles.hint}>{error ?? hint}</Text> : null}</View>;
}

export interface ChoiceOption<TValue extends string> { readonly value: TValue; readonly label: string }

export function ChoiceField<TValue extends string>({ label, value, options, onChange, error, required }: { readonly label: string; readonly value: TValue; readonly options: readonly ChoiceOption<TValue>[]; readonly onChange: (value: TValue) => void; readonly error?: string; readonly required?: boolean }) {
  return <View style={styles.field} accessibilityRole="radiogroup"><Text style={styles.label}>{label}{required ? " *" : ""}</Text><View style={styles.choiceRow}>{options.map((option) => { const selected = value === option.value; return <Pressable key={option.value} style={[styles.choice, selected ? styles.choiceSelected : null]} accessibilityRole="radio" accessibilityLabel={`${label}: ${option.label}`} accessibilityState={{ selected }} onPress={() => onChange(option.value)}><Text style={[styles.choiceText, selected ? styles.choiceTextSelected : null]}>{option.label}</Text></Pressable>; })}</View>{error ? <Text style={styles.fieldError}>{error}</Text> : null}</View>;
}

export function ActionButton({ label, onPress, pending = false, disabled = false, tone = "primary", pressed }: { readonly label: string; readonly onPress: () => void; readonly pending?: boolean; readonly disabled?: boolean; readonly tone?: "primary" | "secondary" | "danger"; readonly pressed?: boolean }) {
  const unavailable = pending || disabled;
  return <Pressable accessibilityRole="button" accessibilityLabel={pending ? `${label}, in progress` : label} accessibilityState={{ disabled: unavailable, busy: pending, ...(pressed === undefined ? {} : { selected: pressed }) }} disabled={unavailable} onPress={onPress} style={[styles.button, tone === "primary" ? styles.buttonPrimary : tone === "danger" ? styles.buttonDanger : styles.buttonSecondary, unavailable ? styles.disabled : null]}>{pending ? <ActivityIndicator color={tone === "secondary" ? colors.ink : "#ffffff"} /> : null}<Text style={tone === "secondary" ? styles.buttonSecondaryText : styles.buttonText}>{pending ? "Working…" : label}</Text></Pressable>;
}

export function ErrorBanner({ error }: { readonly error: FinanceMobileError | null }) {
  return error ? <View style={styles.errorBanner} accessible accessibilityRole="alert" accessibilityLiveRegion="assertive" accessibilityLabel={`Unable to continue. ${error.message}`}><Text style={styles.errorTitle}>Unable to continue</Text><Text style={styles.errorText}>{error.message}</Text></View> : null;
}

export function LoadingState() {
  return <View style={styles.loading} accessibilityRole="progressbar" accessibilityLabel="Loading Finance data"><ActivityIndicator color={colors.primary} /><Text style={styles.muted}>Loading Finance data…</Text></View>;
}

export function EmptyState({ title, description, href, action }: { readonly title: string; readonly description: string; readonly href?: string; readonly action?: string }) {
  const router = useRouter();
  return <View style={styles.empty}><Text style={styles.emptyMark} accessibilityElementsHidden>◇</Text><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.centerMuted}>{description}</Text>{href && action ? <ActionButton label={action} onPress={() => router.push(href as Href)} /> : null}</View>;
}

export function StatusBadge({ value }: { readonly value: string }) {
  const label = value.replaceAll("_", " ");
  return <View style={styles.badge} accessible accessibilityLabel={`Status: ${label}`}><Text style={styles.badgeText}>Status: {label}</Text></View>;
}

export function Metric({ label, value, detail }: { readonly label: string; readonly value: string; readonly detail: string }) {
  return <View style={styles.metric} accessible accessibilityLabel={`${label}: ${value}. ${detail}`}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue} numberOfLines={2} adjustsFontSizeToFit>{value}</Text><Text style={styles.metricDetail}>{detail}</Text></View>;
}

export function RecordCard({ title, details, status, children }: { readonly title: string; readonly details: readonly string[]; readonly status?: string; readonly children?: ReactNode }) {
  return <View style={styles.record}><View style={styles.recordHeader}><Text style={styles.recordTitle}>{title}</Text>{status ? <StatusBadge value={status} /> : null}</View>{details.map((detail, index) => <Text key={`${String(index)}-${detail}`} style={styles.recordDetail} selectable>{detail}</Text>)}{children ? <View style={styles.actions}>{children}</View> : null}</View>;
}

export function RecordList<TItem>({ items, keyExtractor, renderItem, accessibilityLabel }: { readonly items: readonly TItem[]; readonly keyExtractor: (item: TItem) => string; readonly renderItem: (item: TItem) => ReactNode; readonly accessibilityLabel: string }) {
  return <FlatList horizontal accessibilityLabel={accessibilityLabel} data={[...items]} keyExtractor={keyExtractor} renderItem={({ item }) => <View style={styles.recordListItem}>{renderItem(item)}</View>} contentContainerStyle={styles.recordList} showsHorizontalScrollIndicator />;
}

export function NavigationCard({ href, title, description }: { readonly href: string; readonly title: string; readonly description: string }) {
  return <Link href={href as Href} asChild><Pressable style={styles.navigationCard} accessibilityRole="link" accessibilityLabel={`${title}. ${description}`}><View style={styles.navigationCopy}><Text style={styles.navigationTitle}>{title}</Text><Text style={styles.muted}>{description}</Text></View><Text style={styles.navigationArrow} accessibilityElementsHidden>›</Text></Pressable></Link>;
}

export function SuccessMessage({ message }: { readonly message: string }) {
  return <View style={styles.success} accessibilityRole="alert"><Text style={styles.successText}>{message}</Text></View>;
}

export function humanize(value: string): string {
  const acronyms = new Set(["apy", "cagr", "cgpa", "emi", "gpa", "id", "irr", "roi", "xirr"]);
  return value.replaceAll("_", " ").replace(/([a-z])([A-Z])/g, "$1 $2").split(" ").map((word) => acronyms.has(word.toLocaleLowerCase()) ? word.toLocaleUpperCase() : word.replace(/^./, (character) => character.toUpperCase())).join(" ");
}
export function formatMoney(value: { readonly amount: string; readonly currency: string }): string { return `${value.currency} ${value.amount}`; }

const styles = StyleSheet.create({
  flex: { flex: 1 }, safeArea: { flex: 1, backgroundColor: colors.canvas }, screen: { padding: spacing.lg, paddingBottom: 64, gap: spacing.lg, width: "100%", maxWidth: 760, alignSelf: "center" },
  header: { gap: spacing.sm, paddingTop: spacing.sm }, eyebrow: { color: colors.primary, fontSize: 13, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: "900" }, title: { color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: "800" }, description: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  notice: { backgroundColor: colors.warningSurface, borderColor: "#e3c36c", borderWidth: 1, borderRadius: 14, padding: spacing.md, gap: spacing.xs }, noticeTitle: { color: colors.warning, fontWeight: "800" }, noticeText: { color: colors.ink, lineHeight: 20 },
  panel: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.lg, gap: spacing.xs, elevation: 2 }, panelTitle: { color: colors.ink, fontWeight: "800", fontSize: 20, lineHeight: 26 }, panelDescription: { color: colors.muted, lineHeight: 20 }, panelBody: { gap: spacing.md, paddingTop: spacing.md },
  field: { gap: spacing.xs }, label: { color: colors.ink, fontWeight: "700", fontSize: 15 }, input: { minHeight: 48, borderColor: colors.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: 10, backgroundColor: colors.surface, color: colors.ink, fontSize: 16 }, inputError: { borderColor: colors.danger, borderWidth: 2 }, textArea: { minHeight: 96, textAlignVertical: "top" }, hint: { color: colors.muted, fontSize: 13, lineHeight: 18 }, fieldError: { color: colors.danger, fontSize: 13, lineHeight: 18, fontWeight: "600" },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, choice: { minHeight: 44, justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 22, paddingHorizontal: spacing.md, backgroundColor: colors.surface }, choiceSelected: { backgroundColor: colors.ink, borderColor: colors.ink }, choiceText: { color: colors.ink, fontWeight: "700" }, choiceTextSelected: { color: "#ffffff" },
  button: { minHeight: 48, borderRadius: 12, paddingHorizontal: spacing.lg, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm }, buttonPrimary: { backgroundColor: colors.primary }, buttonSecondary: { backgroundColor: colors.surface, borderColor: colors.ink, borderWidth: 1 }, buttonDanger: { backgroundColor: colors.danger }, buttonText: { color: "#ffffff", fontWeight: "800" }, buttonSecondaryText: { color: colors.ink, fontWeight: "800" }, disabled: { opacity: 0.5 },
  errorBanner: { backgroundColor: colors.dangerSurface, borderColor: "#e8a39d", borderWidth: 1, borderRadius: 12, padding: spacing.md, gap: spacing.xs }, errorTitle: { color: colors.danger, fontWeight: "800" }, errorText: { color: colors.ink, lineHeight: 20 }, loading: { minHeight: 96, alignItems: "center", justifyContent: "center", gap: spacing.sm }, muted: { color: colors.muted, lineHeight: 20, flexShrink: 1 }, centerMuted: { color: colors.muted, lineHeight: 20, textAlign: "center" },
  empty: { alignItems: "center", padding: spacing.xl, gap: spacing.sm }, emptyMark: { color: colors.primary, fontSize: 34 }, emptyTitle: { color: colors.ink, fontWeight: "800", fontSize: 18, textAlign: "center" }, badge: { alignSelf: "flex-start", backgroundColor: "#efe7f8", borderColor: "#c4a5df", borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }, badgeText: { color: "#51247f", fontSize: 12, fontWeight: "800", textTransform: "capitalize" },
  metric: { minWidth: 145, backgroundColor: "#f0e8f8", borderRadius: 14, padding: spacing.md, gap: spacing.xs }, metricLabel: { color: colors.muted, fontWeight: "700" }, metricValue: { color: colors.ink, fontWeight: "900", fontSize: 23 }, metricDetail: { color: colors.muted, fontSize: 12 }, record: { borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: spacing.md, gap: spacing.sm, backgroundColor: colors.surface }, recordList: { gap: spacing.md, paddingBottom: spacing.xs }, recordListItem: { width: 290 }, recordHeader: { gap: spacing.sm }, recordTitle: { color: colors.ink, fontSize: 17, lineHeight: 23, fontWeight: "800" }, recordDetail: { color: colors.muted, lineHeight: 20 }, actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.xs },
  navigationCard: { minHeight: 72, flexDirection: "row", alignItems: "center", borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: spacing.md, backgroundColor: colors.surface }, navigationCopy: { flex: 1, gap: spacing.xs }, navigationTitle: { color: colors.ink, fontWeight: "800", fontSize: 17 }, navigationArrow: { color: colors.primary, fontSize: 32, fontWeight: "700", paddingLeft: spacing.sm },
  success: { backgroundColor: colors.successSurface, borderRadius: 12, padding: spacing.md }, successText: { color: "#17633c", fontWeight: "700" },
});
