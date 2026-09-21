import { Redirect } from "expo-router";
import { View } from "react-native";
import { useMobileAuth } from "../lib/auth/mobile-auth-provider";

export default function IndexRoute() {
  const authentication = useMobileAuth();
  if (authentication.loading) return <View />;
  return <Redirect href={(authentication.user === null ? "/sign-in" : "/education") as never} />;
}
