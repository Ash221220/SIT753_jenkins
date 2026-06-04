import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import CustomButton from "../components/CustomButton";
import { colors } from "../constants/colors";
import { supabase } from "../lib/supabase";

export default function ResultScreen() {
  const { imageUri, predictedFood, confidence, predictionId, nutritionInfo } =
    useLocalSearchParams();

  const router = useRouter();

  const nutritionData =
    typeof nutritionInfo === "string" ? JSON.parse(nutritionInfo) : null;

  const confidenceValue = Number(String(confidence).replace("%", ""));

  const handleCorrectPrediction = async () => {
    await supabase
      .from("predictions")
      .update({ is_correct: true })
      .eq("id", predictionId);

    router.replace("/");
  };

  const handleWrongPrediction = () => {
    router.push({
      pathname: "/correction",
      params: { predictionId },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Food detected</Text>

      <Image source={{ uri: imageUri as string }} style={styles.image} />

      <View style={styles.foodCard}>
        <Text style={styles.label}>Predicted Food</Text>
        <Text style={styles.foodName}>{predictedFood}</Text>

        <View style={styles.confidencePill}>
          <Text style={styles.confidenceText}>Confidence {confidence}</Text>
        </View>

        {confidenceValue < 60 && (
          <Text style={styles.warningText}>
            Low confidence. Please confirm whether this prediction is correct.
          </Text>
        )}
      </View>

      {nutritionData && (
        <View style={styles.nutritionCard}>
          <Text style={styles.sectionTitle}>Nutrition estimate</Text>
          <Text style={styles.sourceText}>
            Source: {nutritionData.sourceFood ?? "N/A"}
          </Text>

          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionBox}>
              <Text style={styles.nutritionValue}>
                {nutritionData.calories ?? "N/A"}
              </Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>

            <View style={styles.nutritionBox}>
              <Text style={styles.nutritionValue}>
                {nutritionData.protein ?? "N/A"}g
              </Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>

            <View style={styles.nutritionBox}>
              <Text style={styles.nutritionValue}>
                {nutritionData.carbohydrates ?? "N/A"}g
              </Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>

            <View style={styles.nutritionBox}>
              <Text style={styles.nutritionValue}>
                {nutritionData.fat ?? "N/A"}g
              </Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
          </View>
        </View>
      )}

      <CustomButton title="This is Correct" onPress={handleCorrectPrediction} />

      <View style={{ height: 14 }} />

      <CustomButton
        title="Wrong Prediction"
        onPress={handleWrongPrediction}
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
    paddingBottom: 60,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 22,
  },
  image: {
    width: "100%",
    height: 270,
    borderRadius: 34,
    marginBottom: 20,
    backgroundColor: colors.card,
  },
  foodCard: {
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
    letterSpacing: 1,
    marginBottom: 8,
  },
  foodName: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: "900",
    textTransform: "capitalize",
    marginBottom: 14,
  },
  confidencePill: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  confidenceText: {
    color: colors.primary,
    fontWeight: "900",
  },
  warningText: {
    color: colors.danger,
    marginTop: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  nutritionCard: {
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  sourceText: {
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 18,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  nutritionBox: {
    width: "47%",
    backgroundColor: colors.primaryLight,
    borderRadius: 22,
    padding: 16,
  },
  nutritionValue: {
    color: colors.primaryDark,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 4,
  },
  nutritionLabel: {
    color: colors.textSecondary,
    fontWeight: "800",
  },
});