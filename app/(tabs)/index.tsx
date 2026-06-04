import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import CustomButton from "../../components/CustomButton";
import { colors } from "../../constants/colors";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day 👋</Text>
          <Text style={styles.title}>Snaprition</Text>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>FOOD SCANNER</Text>
        <Text style={styles.heroTitle}>Scan your meal in seconds</Text>
        <Text style={styles.heroText}>
          Get food prediction, estimated calories and macros from a single photo.
        </Text>

        <CustomButton title="Scan Food" onPress={() => router.push("/capture")} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Model feedback loop</Text>
        <Text style={styles.cardText}>
          If a prediction is wrong, correct it once. The app stores that feedback
          for future retraining.
        </Text>
      </View>

      <View style={{ height: 14 }} />

      <CustomButton
        title="View History"
        onPress={() => router.push("/history")}
        secondary
      />

      <View style={{ height: 14 }} />

      <CustomButton
        title="Profile"
        onPress={() => router.push("/profile")}
        secondary
      />
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
    paddingTop: 60,
    paddingBottom: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 26,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: "900",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 20,
  },
  heroCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 32,
    padding: 24,
    marginBottom: 26,
  },
  heroLabel: {
    color: "#BCECC8",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 10,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
    marginBottom: 10,
  },
  heroText: {
    color: "#DDEFE2",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.textSecondary,
    fontWeight: "700",
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },
  cardText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
});