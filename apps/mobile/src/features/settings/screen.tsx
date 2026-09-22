import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apertureTheme } from "../../theme/foundation";

export function SettingsShellScreen() {
  return <SafeAreaView style={styles.screen}><View style={styles.card}><Text style={styles.eyebrow}>Settings</Text><Text style={styles.title}>Dashboard foundations are active</Text><Text style={styles.description}>Use Search to control session feature visibility. Durable owner-scoped preferences and privacy controls arrive in Phase 34.</Text></View></SafeAreaView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: apertureTheme.colors.canvas }, card: { gap: 12 }, eyebrow: { color: "#4d6470", fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" }, title: { color: apertureTheme.colors.ink, fontSize: 32, lineHeight: 38, fontWeight: "900" }, description: { color: apertureTheme.colors.muted, fontSize: 16, lineHeight: 24 } });
