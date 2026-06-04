import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomButton from "../components/CustomButton";
import { colors } from "../constants/colors";
import { uploadImageToSupabase } from "../lib/storage";
import { supabase } from "../lib/supabase";

const API_URL = "http://192.168.1.104:8000/predict";

export default function CaptureScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Gallery permission is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Camera permission is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const getPredictionFromAPI = async (localImageUri: string) => {
    const formData = new FormData();

    formData.append("file", {
      uri: localImageUri,
      name: "food.jpg",
      type: "image/jpeg",
    } as any);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Prediction API failed.");
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === "AbortError") {
        throw new Error("Prediction request timed out. Check backend.");
      }
      throw error;
    }
  };

  const handlePredict = async () => {
    if (!imageUri) {
      Alert.alert("No image selected", "Please select or capture an image first.");
      return;
    }

    try {
      setUploading(true);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        Alert.alert("Login required", "Please log in before scanning food.");
        router.replace("/login");
        return;
      }

      const userId = userData.user.id;

      const prediction = await getPredictionFromAPI(imageUri);
      const predictedFood = prediction.predictedFood;
      const confidence = `${prediction.confidence}%`;
      const nutrition = prediction.nutrition;

      const uploadResult = await uploadImageToSupabase(imageUri);

      const { data: imageRow, error: imageInsertError } = await supabase
        .from("food_images")
        .insert([
          {
            image_url: uploadResult.publicUrl,
            user_id: userId,
          },
        ])
        .select()
        .single();

      if (imageInsertError) throw imageInsertError;

      const { data: predictionRow, error: predictionInsertError } =
        await supabase
          .from("predictions")
          .insert([
            {
              image_id: imageRow.id,
              user_id: userId,
              predicted_label: predictedFood,
              confidence,
              calories: nutrition?.calories ?? null,
              protein: nutrition?.protein ?? null,
              carbohydrates: nutrition?.carbohydrates ?? null,
              fat: nutrition?.fat ?? null,
              source_food: nutrition?.sourceFood ?? null,
            },
          ])
          .select()
          .single();

      if (predictionInsertError) throw predictionInsertError;

      router.push({
        pathname: "/result",
        params: {
          imageUri: uploadResult.publicUrl,
          imageId: imageRow.id,
          predictionId: predictionRow.id,
          predictedFood,
          confidence,
          nutritionInfo: JSON.stringify(nutrition),
        },
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Scan your food</Text>
      <Text style={styles.subtitle}>
        Take or upload a clear image of your meal to identify food and estimate
        nutrition.
      </Text>

      <View style={styles.previewCard}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.emptyPreview}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>📷</Text>
            </View>
            <Text style={styles.emptyTitle}>No image selected</Text>
            <Text style={styles.emptyText}>Choose from gallery or open camera.</Text>
          </View>
        )}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.smallAction}
          onPress={pickImage}
          disabled={uploading}
        >
          <Text style={styles.smallActionIcon}>🖼️</Text>
          <Text style={styles.smallActionText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.smallAction}
          onPress={takePhoto}
          disabled={uploading}
        >
          <Text style={styles.smallActionIcon}>📸</Text>
          <Text style={styles.smallActionText}>Camera</Text>
        </TouchableOpacity>
      </View>

      {uploading && (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Analysing your food image...</Text>
        </View>
      )}

      <CustomButton
        title={uploading ? "Predicting..." : "Predict Food"}
        onPress={handlePredict}
        disabled={uploading}
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
    paddingBottom: 50,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 10,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 26,
  },
  previewCard: {
    height: 340,
    backgroundColor: colors.card,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  emptyPreview: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 38,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
  },
  smallAction: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallActionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  smallActionText: {
    color: colors.textPrimary,
    fontWeight: "900",
  },
  loadingCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderGreen,
  },
  loadingText: {
    color: colors.primaryDark,
    fontWeight: "800",
    marginTop: 8,
  },
});