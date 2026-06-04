import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import CustomButton from "../components/CustomButton";
import { colors } from "../constants/colors";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert("Login failed", error.message);
      return;
    }

    router.replace("/");
  };

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert("Signup failed", error.message);
      return;
    }

    Alert.alert("Account created", "You can now log in.");
    setMode("login");
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topCircle}>
          <Text style={styles.logoIcon}>🥗</Text>
        </View>

        <Text style={styles.title}>
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </Text>

        <Text style={styles.subtitle}>
          {mode === "login"
            ? "Log in to continue tracking your food scans and nutrition history."
            : "Create an account to save predictions, corrections and food history."}
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <CustomButton
            title={mode === "login" ? "Login" : "Create Account"}
            onPress={mode === "login" ? signIn : signUp}
          />

          <View style={{ height: 14 }} />

          <CustomButton
            title={
              mode === "login"
                ? "New here? Create Account"
                : "Already have an account? Login"
            }
            onPress={() => setMode(mode === "login" ? "signup" : "login")}
            secondary
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 70,
    paddingBottom: 40,
  },
  topCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  logoIcon: {
    fontSize: 44,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 30,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: "800",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.cardSoft,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
});