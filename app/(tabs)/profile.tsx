import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import CustomButton from "../../components/CustomButton";
import { colors } from "../../constants/colors";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [predictionCount, setPredictionCount] = useState<number>(0);
  const [correctionCount, setCorrectionCount] = useState<number>(0);

  const loadProfile = useCallback(async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      router.replace("/login");
      return;
    }

    setEmail(data.user.email ?? null);
    setUserId(data.user.id);

    const { count: predictions } = await supabase
      .from("predictions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", data.user.id);

    const { count: corrections } = await supabase
      .from("corrections")
      .select("*", { count: "exact", head: true })
      .eq("user_id", data.user.id);

    setPredictionCount(predictions ?? 0);
    setCorrectionCount(corrections ?? 0);
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Logout failed", error.message);
      return;
    }

    router.replace("/login");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {email ? email.charAt(0).toUpperCase() : "U"}
        </Text>
      </View>

      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>
        Manage your account and view your Snaprition activity.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Logged in as</Text>
        <Text style={styles.email}>{email ?? "No user found"}</Text>

        <Text style={styles.label}>User ID</Text>
        <Text style={styles.userId}>{userId ?? "N/A"}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{predictionCount}</Text>
          <Text style={styles.statLabel}>Predictions</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{correctionCount}</Text>
          <Text style={styles.statLabel}>Corrections</Text>
        </View>
      </View>

      <CustomButton
        title="View History"
        onPress={() => router.push("/history")}
      />

      <View style={{ height: 14 }} />

      <CustomButton title="Logout" onPress={logout} secondary />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 36,
    marginBottom: 18,
  },
  avatarText: {
    color: colors.white,
    fontSize: 38,
    fontWeight: "900",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 28,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  email: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 18,
  },
  userId: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: 26,
    padding: 20,
    alignItems: "center",
  },
  statValue: {
    color: colors.primaryDark,
    fontSize: 30,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.textSecondary,
    fontWeight: "800",
    marginTop: 4,
  },
});