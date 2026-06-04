import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CustomButton from "../components/CustomButton";
import { colors } from "../constants/colors";
import { supabase } from "../lib/supabase";

export default function HistoryScreen() {
  const router = useRouter();

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setHistory([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const { data, error } = await supabase
      .from("predictions")
      .select(`
        id,
        predicted_label,
        confidence,
        calories,
        protein,
        carbohydrates,
        fat,
        source_food,
        created_at,
        is_correct,
        food_images (
          image_url
        )
      `)
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("History fetch error:", error);
    } else {
      setHistory(data || []);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading prediction history...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.pageTitle}>Food history</Text>

      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyCircle}>
            <Text style={styles.emptyIcon}>🍽️</Text>
          </View>

          <Text style={styles.emptyTitle}>No scans yet</Text>

          <Text style={styles.emptyText}>
            Scan your first meal to view predictions and nutrition history here.
          </Text>

          <View style={{ height: 18 }} />

          <CustomButton
            title="Scan Food"
            onPress={() => router.push("/capture")}
          />
        </View>
      ) : (
        history.map((item) => (
          <View key={item.id} style={styles.card}>
            {item.food_images?.image_url && (
              <Image
                source={{ uri: item.food_images.image_url }}
                style={styles.image}
              />
            )}

            <View style={styles.headerRow}>
              <View style={styles.foodTitleBox}>
                <Text style={styles.food}>{item.predicted_label}</Text>
                <Text style={styles.metaText}>Confidence: {item.confidence}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  item.is_correct === false && styles.correctedBadge,
                  item.is_correct === true && styles.correctBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.is_correct === false && styles.correctedStatusText,
                    item.is_correct === true && styles.correctStatusText,
                  ]}
                >
                  {item.is_correct === null
                    ? "Review"
                    : item.is_correct
                    ? "Correct"
                    : "Corrected"}
                </Text>
              </View>
            </View>

            <Text style={styles.sourceText}>
              Source: {item.source_food ?? "N/A"}
            </Text>

            <View style={styles.nutritionRow}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {item.calories ?? "N/A"}
                </Text>
                <Text style={styles.nutritionLabel}>kcal</Text>
              </View>

              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {item.protein ?? "N/A"}g
                </Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>

              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {item.carbohydrates ?? "N/A"}g
                </Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>

              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{item.fat ?? "N/A"}g</Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
            </View>
          </View>
        ))
      )}
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
    paddingBottom: 70,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontWeight: "700",
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 32,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  emptyCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 190,
    borderRadius: 24,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  foodTitleBox: {
    flex: 1,
  },
  food: {
    fontSize: 23,
    fontWeight: "900",
    color: colors.textPrimary,
    textTransform: "capitalize",
    marginBottom: 4,
  },
  metaText: {
    color: colors.textSecondary,
    fontWeight: "700",
  },
  sourceText: {
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  statusBadge: {
    backgroundColor: colors.cardSoft,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  correctBadge: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  correctedBadge: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "900",
  },
  correctStatusText: {
    color: colors.primary,
  },
  correctedStatusText: {
    color: "#C2410C",
  },
  nutritionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  nutritionItem: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  nutritionValue: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: "900",
  },
  nutritionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
});