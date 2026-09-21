import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

import { useMobileAuth } from "../../lib/auth/mobile-auth-provider";

export default function SignInScreen() {
  const authentication = useMobileAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setMessage(null);
    try {
      await authentication.signIn(email, password);
    } catch {
      setMessage("Sign-in failed. Check the configured owner account and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Text style={styles.brand}>APERTURE</Text>
        <Text style={styles.title}>Private sign in</Text>
        <Text style={styles.copy}>This personal workspace accepts its configured owner account only.</Text>
        {(message ?? authentication.error) === null ? null : <Text accessibilityRole="alert" style={styles.error}>{message ?? authentication.error}</Text>}
        <TextInput accessibilityLabel="Email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="Owner email" style={styles.input} value={email} />
        <TextInput accessibilityLabel="Password" autoCapitalize="none" autoComplete="current-password" onChangeText={setPassword} placeholder="Password" secureTextEntry style={styles.input} value={password} />
        <Pressable accessibilityRole="button" disabled={submitting} onPress={() => void submit()} style={styles.button}>
          <Text style={styles.buttonText}>{submitting ? "Signing in…" : "Sign in"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f6f2", justifyContent: "center", padding: 24 },
  card: { backgroundColor: "#ffffff", borderRadius: 18, padding: 24, gap: 14 },
  brand: { color: "#315c4b", fontSize: 13, fontWeight: "800", letterSpacing: 2 },
  title: { color: "#173c32", fontSize: 28, fontWeight: "800" },
  copy: { color: "#52645e", fontSize: 16, lineHeight: 22 },
  error: { color: "#9d2f2f", fontSize: 14 },
  input: { borderColor: "#c6d3cd", borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  button: { alignItems: "center", backgroundColor: "#315c4b", borderRadius: 10, padding: 14 },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});
