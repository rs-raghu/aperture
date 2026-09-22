import { featureRegistry } from "@aperture/feature-registry";
import type { TodayDashboard } from "@aperture/today";
import { useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apertureTheme } from "../../theme/foundation";
import { useToday } from "./provider";

const definitions = featureRegistry.widgets("mobile");

export function TodayShellScreen() {
  const { service, ownerId, now } = useToday();
  const router = useRouter();
  const [date, setDate] = useState(() => now().slice(0, 10));
  const [enabled, setEnabled] = useState(() => new Set(definitions.filter(({ defaultEnabled }) => defaultEnabled).map(({ id }) => id)));
  const [dashboard, setDashboard] = useState<TodayDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void service.getDashboard({ ownerId, date, enabledWidgetIds: [...enabled] }).then((value) => { if (active) { setDashboard(value); setError(null); } }).catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "Unable to load Today."); });
    return () => { active = false; };
  }, [date, enabled, ownerId, service]);
  const toggle = (id: string) => setEnabled((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.screen}>
    <View style={styles.header}><Text style={styles.eyebrow}>TODAY</Text><Text style={styles.title}>One place for what matters now</Text><Text style={styles.copy}>Manifest-backed contributions from your plan, studies, health, and finances.</Text></View>
    <View style={styles.card}><Text style={styles.label}>Dashboard date</Text><TextInput accessibilityLabel="Dashboard date" style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" /></View>
    {error ? <View style={styles.error} accessibilityRole="alert"><Text style={styles.errorText}>{error}</Text></View> : null}
    <View style={styles.summary}><View><Text style={styles.metric}>{dashboard?.totalItems ?? 0}</Text><Text style={styles.caption}>Items</Text></View><View><Text style={styles.metric}>{dashboard?.overdueItems ?? 0}</Text><Text style={styles.caption}>Overdue</Text></View><View><Text style={styles.metric}>{dashboard?.widgets.length ?? enabled.size}</Text><Text style={styles.caption}>Widgets</Text></View></View>
    <View style={styles.card}><Text style={styles.cardTitle}>Quick actions</Text><View style={styles.wrap}>{dashboard?.quickActions.map((action) => <Pressable accessibilityRole="link" key={action.id} onPress={() => router.push(action.href as Href)} style={styles.chip}><Text style={styles.chipText}>{action.label}</Text></Pressable>)}</View><Text style={styles.cardTitle}>Visible widgets</Text><View style={styles.wrap}>{definitions.map((widget) => <Pressable accessibilityRole="switch" accessibilityState={{ checked: enabled.has(widget.id) }} accessibilityLabel={`${widget.title} widget`} key={widget.id} onPress={() => toggle(widget.id)} style={[styles.chip, enabled.has(widget.id) ? styles.chipActive : null]}><Text style={[styles.chipText, enabled.has(widget.id) ? styles.chipTextActive : null]}>{widget.title}</Text></Pressable>)}</View></View>
    {!dashboard ? <ActivityIndicator accessibilityLabel="Loading Today" color={apertureTheme.colors.focus} /> : dashboard.widgets.map((widget) => <View style={styles.card} key={widget.definition.id}><Text style={styles.eyebrow}>{widget.definition.featureName.toUpperCase()}</Text><Text style={styles.cardTitle}>{widget.definition.title}</Text><Text style={styles.copy}>{widget.definition.description}</Text>{widget.state === "unavailable" ? <Text style={styles.errorText}>{widget.message}</Text> : widget.items.length === 0 ? <Text style={styles.empty}>Nothing matching this date.</Text> : widget.items.map((item) => <Pressable accessibilityRole="link" onPress={() => router.push(item.href as Href)} style={styles.item} key={item.id}><View style={styles.itemCopy}><Text style={styles.itemTitle}>{item.title}</Text><Text style={[styles.caption, item.overdue ? styles.overdue : null]}>{item.overdue ? "Overdue · " : ""}{item.detail ?? item.kind}</Text></View><Text style={styles.arrow}>›</Text></Pressable>)}</View>)}
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: apertureTheme.colors.canvas }, screen: { padding: 20, paddingBottom: 70, gap: 16 }, header: { gap: 8, paddingVertical: 8 }, eyebrow: { color: "#9b641b", fontWeight: "900", fontSize: 12, letterSpacing: 1.2 }, title: { color: apertureTheme.colors.ink, fontSize: 31, lineHeight: 37, fontWeight: "900" }, copy: { color: apertureTheme.colors.muted, lineHeight: 21 }, card: { gap: 12, backgroundColor: "#fff", borderColor: "#ccd8d5", borderWidth: 1, borderRadius: 18, padding: 18 }, cardTitle: { color: apertureTheme.colors.ink, fontSize: 20, fontWeight: "900" }, label: { color: apertureTheme.colors.ink, fontWeight: "800" }, input: { minHeight: 48, borderColor: "#aebfbb", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, color: apertureTheme.colors.ink }, summary: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#eaf2f1", borderRadius: 18, padding: 18 }, metric: { color: apertureTheme.colors.ink, fontSize: 28, fontWeight: "900", textAlign: "center" }, caption: { color: apertureTheme.colors.muted, fontSize: 13 }, wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, chip: { borderColor: "#9fb6b2", borderWidth: 1, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9 }, chipActive: { backgroundColor: apertureTheme.colors.ink }, chipText: { color: apertureTheme.colors.ink, fontWeight: "800" }, chipTextActive: { color: "#fff" }, item: { flexDirection: "row", alignItems: "center", borderTopColor: "#e3e9e7", borderTopWidth: 1, paddingTop: 12 }, itemCopy: { flex: 1, gap: 4 }, itemTitle: { color: apertureTheme.colors.ink, fontWeight: "800", fontSize: 16 }, arrow: { color: apertureTheme.colors.focus, fontSize: 28 }, overdue: { color: "#9a3030", fontWeight: "800" }, empty: { color: apertureTheme.colors.muted, fontStyle: "italic" }, error: { backgroundColor: "#fff0ee", borderRadius: 12, padding: 14 }, errorText: { color: "#8a2929", fontWeight: "700" },
});
