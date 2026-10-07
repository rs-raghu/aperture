import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
export function PortfolioPublicLinkScreen() {
  const [error, setError] = useState<string | null>(null);
  async function open() { try { const origin = new URL(process.env.EXPO_PUBLIC_APERTURE_WEB_URL ?? ""); if (origin.protocol !== "https:" || origin.username || origin.password) throw new Error("Configure your HTTPS Aperture web origin to open the public portfolio."); await Linking.openURL(new URL("/portfolio", origin).toString()); } catch (failure) { setError(failure instanceof Error ? failure.message : "The public portfolio could not be opened."); } }
  return <SafeAreaView style={styles.safe}><View style={styles.card}><Text style={styles.title}>Public portfolio</Text><Text style={styles.copy}>Your responsive professional presentation opens on your configured web server. It remains unavailable until publication is explicitly enabled and a curated snapshot is prepared.</Text>{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}<Pressable accessibilityRole="button" style={styles.button} onPress={() => void open()}><Text style={styles.buttonText}>Open public portfolio</Text></Pressable></View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: "#f3f5f2", padding: 20 }, card: { padding: 20, backgroundColor: "#fff", borderRadius: 18, gap: 18 }, title: { color: "#173b35", fontWeight: "900", fontSize: 28 }, copy: { color: "#52645f", lineHeight: 23 }, error: { color: "#852622" }, button: { backgroundColor: "#173b35", padding: 14, minHeight: 48, borderRadius: 10 }, buttonText: { color: "#fff", fontWeight: "800" } });
