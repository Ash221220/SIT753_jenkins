import { decode } from "base64-arraybuffer";
import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "./supabase";

export async function uploadImageToSupabase(imageUri: string) {
  try {
    // Resize/compress image before uploading
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      {
        compress: 0.6,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (!manipulatedImage.base64) {
      throw new Error("Could not convert image to base64.");
    }

    const fileName = `${Date.now()}.jpg`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from("food_images")
      .upload(filePath, decode(manipulatedImage.base64), {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from("food_images")
      .getPublicUrl(filePath);

    return {
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
}