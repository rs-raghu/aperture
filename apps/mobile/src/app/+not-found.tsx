import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apertureTheme } from "../theme/foundation";

export default function NotFoundScreen() {
  return <SafeAreaView style={styles.screen}><View style={styles.content}><Text style={styles.eyebrow}>404</Text><Text style={styles.title}>That Aperture page does not exist</Text><Text style={styles.description}>Return to the registered dashboard features.</Text><Link href={"/today" as never} asChild><Pressable accessibilityRole="link" style={styles.button}><Text style={styles.buttonText}>Open Today</Text></Pressable></Link></View></SafeAreaView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, justifyContent: "center", backgroundColor: apertureTheme.colors.canvas }, content: { padding: 28, gap: 14 }, eyebrow: { color: "#087f72", fontWeight: "900", letterSpacing: 1.2 }, title: { color: apertureTheme.colors.ink, fontSize: 32, lineHeight: 38, fontWeight: "900" }, description: { color: apertureTheme.colors.muted, fontSize: 16, lineHeight: 24 }, button: { minHeight: 48, alignSelf: "flex-start", justifyContent: "center", paddingHorizontal: 20, borderRadius: 12, backgroundColor: "#087f72" }, buttonText: { color: "#ffffff", fontWeight: "900" } });
