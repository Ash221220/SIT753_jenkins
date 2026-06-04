import { Stack } from "expo-router";
import { colors } from "../constants/colors";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "900",
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen name="capture" options={{ title: "Scan Food" }} />

      <Stack.Screen name="result" options={{ title: "Prediction Result" }} />

      <Stack.Screen name="correction" options={{ title: "Correct Prediction" }} />

      <Stack.Screen name="history" options={{ title: "History" }} />

      <Stack.Screen name="login" options={{ title: "Login" }} />

      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}