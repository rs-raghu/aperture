import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apertureTheme } from "../../theme/foundation";

export function TodayShellScreen() {
  return <SafeAreaView style={styles.screen}><View style={styles.card}><Text style={styles.eyebrow}>Today</Text><Text style={styles.title}>Your daily dashboard is ready for contributions</Text><Text style={styles.description}>The modular shell, widget registry, and feature contribution points are active. The complete Today and Planner workflow arrives in Phase 33.</Text></View></SafeAreaView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: apertureTheme.colors.canvas }, card: { gap: 12 }, eyebrow: { color: "#b16f19", fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" }, title: { color: apertureTheme.colors.ink, fontSize: 32, lineHeight: 38, fontWeight: "900" }, description: { color: apertureTheme.colors.muted, fontSize: 16, lineHeight: 24 } });
