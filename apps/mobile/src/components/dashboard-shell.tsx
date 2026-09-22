import { featureRegistry, type FeatureEnablementOverrides, type FeatureId } from "@aperture/feature-registry";
import { usePathname, useRouter, type Href } from "expo-router";
import { Component, useMemo, useState, type ErrorInfo, type ReactNode } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { preloadFeatureFrontend } from "../generated/plugin-frontends.generated";
import { apertureTheme } from "../theme/foundation";

const { colors, spacing, radius } = apertureTheme;

function routeIsActive(pathname: string, path: string): boolean {
  return pathname === path || path !== "/" && pathname.startsWith(`${path}/`);
}

function glyph(icon: string): string {
  return ({ sun: "☀", book: "▤", heart: "♥", wallet: "◇", calculator: "±", settings: "⚙" } as Record<string, string>)[icon] ?? "•";
}

export function MobileDashboardShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [overrides, setOverrides] = useState<FeatureEnablementOverrides>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigation = featureRegistry.navigation("mobile", overrides);
  const results = useMemo(() => featureRegistry.search(query, "mobile", overrides), [query, overrides]);
  const activeRoute = featureRegistry.findRoute("mobile", pathname);
  const activeFeature = activeRoute ? featureRegistry.getFeature(activeRoute.featureId) : undefined;
  const activeFeatureEnabled = activeFeature ? featureRegistry.isEnabled(activeFeature.id, overrides) : true;

  const go = (path: string) => {
    setSearchOpen(false);
    setQuery("");
    router.push(path as Href);
  };
  const toggleFeature = (featureId: FeatureId) => {
    const feature = featureRegistry.getFeature(featureId);
    if (!feature?.disableAllowed) return;
    setOverrides((current) => ({ ...current, [featureId]: !featureRegistry.isEnabled(featureId, current) }));
  };

  return <View style={styles.shell}>
    <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
      <View style={styles.header}>
        <Pressable accessibilityRole="link" accessibilityLabel="Open Today" onPress={() => go("/today")} style={styles.brand}>
          <View style={[styles.brandMark, activeFeature ? { backgroundColor: activeFeature.theme.accent } : null]}><Text style={styles.brandMarkText}>A</Text></View>
          <View><Text style={styles.brandName}>Aperture</Text><Text style={styles.brandDetail}>{activeFeature?.displayName ?? "Personal dashboard"}</Text></View>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Search Aperture" onPress={() => setSearchOpen(true)} style={styles.searchButton}><Text style={styles.searchGlyph}>⌕</Text><Text style={styles.searchText}>Search</Text></Pressable>
      </View>
    </SafeAreaView>
    <View style={styles.content}>{activeFeature && !activeFeatureEnabled ? <View style={styles.disabledState}><Text style={styles.stateEyebrow}>Feature paused</Text><Text style={styles.stateTitle}>{activeFeature.displayName} is disabled for this session</Text><Text style={styles.stateDescription}>Your saved data is unchanged. Re-enable the feature to return to its workspace.</Text><Pressable accessibilityRole="button" onPress={() => toggleFeature(activeFeature.id as FeatureId)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Enable {activeFeature.displayName}</Text></Pressable></View> : children}</View>
    <SafeAreaView edges={["bottom"]} style={styles.navigationSafeArea}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navigation} accessibilityRole="tablist">
        {navigation.map((item) => {
          const active = routeIsActive(pathname, item.path);
          return <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected: active }} onPressIn={() => preloadFeatureFrontend(item.featureId as FeatureId)} onPress={() => go(item.path)} style={[styles.navigationItem, active ? { backgroundColor: featureRegistry.getFeature(item.featureId)?.theme.surface, borderColor: featureRegistry.getFeature(item.featureId)?.theme.accent } : null]}><Text style={[styles.navigationGlyph, active ? { color: featureRegistry.getFeature(item.featureId)?.theme.accent } : null]}>{glyph(item.icon)}</Text><Text style={[styles.navigationLabel, active ? styles.navigationLabelActive : null]}>{item.label}</Text></Pressable>;
        })}
      </ScrollView>
    </SafeAreaView>
    <Modal visible={searchOpen} animationType="fade" presentationStyle="pageSheet" onRequestClose={() => setSearchOpen(false)}>
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalHeading}><View><Text style={styles.stateEyebrow}>Navigate</Text><Text style={styles.modalTitle}>Search Aperture</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Close search" onPress={() => setSearchOpen(false)} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable></View>
        <TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Search features and pages…" placeholderTextColor={colors.muted} accessibilityLabel="Search routes" style={styles.searchInput} />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.results}>
          {results.length === 0 ? <Text style={styles.emptyText}>No matching page.</Text> : results.map((result) => <Pressable key={result.id} accessibilityRole="link" accessibilityLabel={`${result.label}, ${result.featureName}`} onPress={() => go(result.path)} style={styles.result}><View style={styles.resultCopy}><Text style={styles.resultTitle}>{result.label}</Text><Text style={styles.resultDescription}>{result.featureName} · {result.description}</Text></View><Text style={styles.resultArrow}>›</Text></Pressable>)}
          <Text style={styles.toggleHeading}>Session feature visibility</Text>
          {featureRegistry.listFeatures().filter(({ disableAllowed }) => disableAllowed).map((feature) => {
            const enabled = featureRegistry.isEnabled(feature.id, overrides);
            return <Pressable key={feature.id} accessibilityRole="switch" accessibilityLabel={`${feature.displayName} feature`} accessibilityState={{ checked: enabled }} onPress={() => toggleFeature(feature.id as FeatureId)} style={styles.toggle}><Text style={styles.toggleLabel}>{feature.displayName}</Text><Text style={[styles.toggleValue, enabled ? styles.toggleValueEnabled : null]}>{enabled ? "On" : "Off"}</Text></Pressable>;
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </View>;
}

export function MobileShellLoading() {
  return <SafeAreaView style={styles.loading}><ActivityIndicator color="#087f72" /><Text style={styles.stateDescription}>Loading your private workspace…</Text></SafeAreaView>;
}

interface ErrorBoundaryState { readonly error: Error | null }

export class MobileDashboardErrorBoundary extends Component<{ readonly children: ReactNode }, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { error: null };
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState { return { error }; }
  public componentDidCatch(error: Error, information: ErrorInfo): void { console.error(error, information); }
  public render() {
    if (!this.state.error) return this.props.children;
    return <SafeAreaView style={styles.disabledState}><Text style={styles.stateEyebrow}>Workspace interrupted</Text><Text style={styles.stateTitle}>This page could not be loaded</Text><Text style={styles.stateDescription}>The error boundary kept Aperture available. Try rendering the page again.</Text><Pressable accessibilityRole="button" onPress={() => this.setState({ error: null })} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Try again</Text></Pressable></SafeAreaView>;
  }
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.canvas },
  headerSafeArea: { backgroundColor: colors.header },
  header: { minHeight: 58, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  brand: { minWidth: 0, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  brandMark: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderColor: "rgba(255,255,255,.4)", borderWidth: 1 },
  brandMarkText: { color: "#ffffff", fontFamily: "serif", fontWeight: "800", fontSize: 21 },
  brandName: { color: "#ffffff", fontWeight: "900", fontSize: 17 },
  brandDetail: { color: colors.headerMuted, fontSize: 11 },
  searchButton: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: "rgba(255,255,255,.2)", borderRadius: radius.md, backgroundColor: "rgba(255,255,255,.08)" },
  searchGlyph: { color: "#ffffff", fontSize: 20 }, searchText: { color: "#ffffff", fontWeight: "700" },
  content: { flex: 1 },
  navigationSafeArea: { backgroundColor: "#ffffff", borderTopColor: colors.line, borderTopWidth: 1 },
  navigation: { minWidth: "100%", paddingHorizontal: spacing.sm, paddingTop: spacing.sm, gap: spacing.xs },
  navigationItem: { minWidth: 74, minHeight: 50, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderWidth: 1, borderColor: "transparent", borderRadius: radius.md },
  navigationGlyph: { color: colors.muted, fontSize: 18, fontWeight: "800" },
  navigationLabel: { color: colors.muted, fontSize: 10, fontWeight: "700", marginTop: 2 }, navigationLabelActive: { color: colors.ink, fontWeight: "900" },
  modalSafeArea: { flex: 1, padding: spacing.lg, backgroundColor: colors.canvas },
  modalHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.lg },
  modalTitle: { color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: "900", marginTop: spacing.xs },
  closeButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderColor: colors.line, borderWidth: 1, borderRadius: radius.pill, backgroundColor: colors.surface }, closeText: { color: colors.muted, fontSize: 27 },
  searchInput: { minHeight: 52, marginTop: spacing.lg, paddingHorizontal: spacing.md, color: colors.ink, backgroundColor: colors.surface, borderColor: "#aac0bb", borderWidth: 2, borderRadius: radius.md, fontSize: 16 },
  results: { paddingVertical: spacing.md, gap: spacing.xs },
  result: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: radius.md }, resultCopy: { flex: 1, gap: spacing.xs }, resultTitle: { color: colors.ink, fontWeight: "800", fontSize: 16 }, resultDescription: { color: colors.muted, lineHeight: 18 }, resultArrow: { color: "#087f72", fontSize: 28 },
  emptyText: { color: colors.muted, padding: spacing.lg, textAlign: "center" },
  toggleHeading: { color: colors.muted, marginTop: spacing.lg, marginBottom: spacing.xs, fontSize: 12, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" },
  toggle: { minHeight: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: radius.md }, toggleLabel: { color: colors.ink, fontWeight: "700" }, toggleValue: { color: colors.muted, fontWeight: "900" }, toggleValueEnabled: { color: "#087f72" },
  disabledState: { flex: 1, alignItems: "flex-start", justifyContent: "center", padding: spacing.xl, gap: spacing.md, backgroundColor: colors.canvas },
  stateEyebrow: { color: "#087f72", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" }, stateTitle: { color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: "900" }, stateDescription: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  primaryButton: { minHeight: 48, justifyContent: "center", paddingHorizontal: spacing.lg, backgroundColor: "#087f72", borderRadius: radius.md }, primaryButtonText: { color: "#ffffff", fontWeight: "900" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, backgroundColor: colors.canvas },
});
