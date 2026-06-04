import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomButton from "../components/CustomButton";
import { colors } from "../constants/colors";
import { supabase } from "../lib/supabase";

const API_RETRAIN_URL = "http://192.168.1.104:8000/check-retraining";

const FOOD_CLASSES = [
  "Avocado Toast",
  "Vegemite Toast",
  "Meat Pie",
  "Sausage Roll",
  "Fish and Chips",
  "Chicken Parmigiana",
  "Roast Chicken",
  "Pasta",
  "Sandwich",
  "Salad",
];

export default function CorrectionScreen() {
  const { predictionId } = useLocalSearchParams();
  const router = useRouter();

  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const saveCorrection = async () => {
    if (!selectedFood) {
      Alert.alert("Select food", "Please select the correct food.");
      return;
    }

    try {
      setSaving(true);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        Alert.alert("Login required", "Please log in before saving corrections.");
        router.replace("/login");
        return;
      }

      const userId = userData.user.id;

      const { error } = await supabase.from("corrections").insert([
        {
          prediction_id: predictionId,
          corrected_label: selectedFood,
          user_id: userId,
        },
      ]);

      if (error) throw error;

      await supabase
        .from("predictions")
        .update({ is_correct: false })
        .eq("id", predictionId)
        .eq("user_id", userId);

      fetch(API_RETRAIN_URL, { method: "POST" }).catch((err) =>
        console.log("Retraining trigger failed:", err)
      );

      Alert.alert("Saved", "Correction saved for future retraining.");
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Could not save correction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Correct prediction</Text>

      <View style={styles.infoCard}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🧠</Text>
        </View>

        <Text style={styles.infoTitle}>Help the model learn</Text>

        <Text style={styles.infoText}>
          Choose the correct food label. Your feedback is saved and used for
          future retraining.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Select correct food</Text>

      <View style={styles.list}>
        {FOOD_CLASSES.map((food) => (
          <TouchableOpacity
            key={food}
            style={[
              styles.foodOption,
              selectedFood === food && styles.selectedFood,
            ]}
            onPress={() => setSelectedFood(food)}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.foodText,
                selectedFood === food && styles.selectedFoodText,
              ]}
            >
              {food}
            </Text>

            {selectedFood === food && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <CustomButton
        title={saving ? "Saving..." : "Save Correction"}
        onPress={saveCorrection}
        disabled={saving}
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
    paddingBottom: 70,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 22,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 34,
  },
  infoTitle: {
    color: colors.textPrimary,
    fontSize: 23,
    fontWeight: "900",
    marginBottom: 8,
  },
  infoText: {
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 14,
  },
  list: {
    marginBottom: 22,
  },
  foodOption: {
    backgroundColor: colors.card,
    padding: 17,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedFood: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  foodText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "900",
  },
  selectedFoodText: {
    color: colors.primaryDark,
  },
  check: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
  },
});