import os
import time
import requests
import shutil
from supabase import create_client
from PIL import Image
from dotenv import load_dotenv
import tensorflow as tf

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

import time

RETRAIN_DIR = f"retraining_dataset_{int(time.time())}"

LABEL_MAP = {
    "Avocado Toast": "avocado_toast",
    "Chicken Parmigiana": "chicken_parmigiana",
    "Fish and Chips": "fish_and_chips",
    "Meat Pie": "meat_pie",
    "Pasta": "pasta",
    "Roast Chicken": "roast_chicken",
    "Salad": "salad",
    "Sandwich": "sandwich",
    "Sausage Roll": "sausage_roll",
    "Vegemite Toast": "vegemite_toast",

    "avocado_toast": "avocado_toast",
    "chicken_parmigiana": "chicken_parmigiana",
    "fish_and_chips": "fish_and_chips",
    "meat_pie": "meat_pie",
    "pasta": "pasta",
    "roast_chicken": "roast_chicken",
    "salad": "salad",
    "sandwich": "sandwich",
    "sausage_roll": "sausage_roll",
    "vegemite_toast": "vegemite_toast",
}

def clean_invalid_images(dataset_path):
    removed = 0

    for root, dirs, files in os.walk(dataset_path):
        for file in files:
            file_path = os.path.join(root, file)

            try:
                with Image.open(file_path) as img:
                    img = img.convert("RGB")

                    new_path = os.path.splitext(file_path)[0] + ".jpg"
                    img.save(new_path, "JPEG")

                if file_path != new_path:
                    os.remove(file_path)

            except Exception:
                print("Removing invalid image:", file_path)
                os.remove(file_path)
                removed += 1

    print("Invalid images removed:", removed)
    
def fetch_unused_corrections():
    response = (
        supabase
        .table("corrections")
        .select("""
            id,
            corrected_label,
            approved_for_retraining,
            used_for_retraining,
            predictions (
                id,
                food_images (
                    image_url
                )
            )
        """)
        .eq("approved_for_retraining", True)
        .eq("used_for_retraining", False)
        .execute()
    )

    return response.data


import io

def prepare_dataset(corrections):

    os.makedirs(RETRAIN_DIR, exist_ok=True)

    for item in corrections:
        raw_label = item["corrected_label"]
        label = LABEL_MAP.get(raw_label)

        if label is None:
            print("Skipping unknown label:", raw_label)
            continue

        image_url = item["predictions"]["food_images"]["image_url"]

        label_folder = os.path.join(RETRAIN_DIR, label)
        os.makedirs(label_folder, exist_ok=True)

        response = requests.get(image_url, timeout=20)

        if response.status_code != 200:
            print("Skipping failed image download:", image_url)
            continue

        try:
            image = Image.open(io.BytesIO(response.content)).convert("RGB")
            file_path = os.path.join(label_folder, f"{item['id']}.jpg")
            image.save(file_path, "JPEG")
        except Exception as e:
            print("Skipping invalid downloaded image:", image_url, e)
            continue

    print("Retraining dataset prepared.")


def mark_as_used(corrections):
    ids = [item["id"] for item in corrections]

    for correction_id in ids:
        supabase.table("corrections").update({
            "used_for_retraining": True
        }).eq("id", correction_id).execute()

    print("Corrections marked as used.")

def train_updated_model():
    BASE_DATASET = "base_dataset"
    UPDATED_DATASET = "combined_dataset"

    # Create combined_dataset only once from base_dataset
    if not os.path.exists(UPDATED_DATASET):
        print("Creating combined_dataset from base_dataset...")
        shutil.copytree(BASE_DATASET, UPDATED_DATASET)
    else:
        print("Using existing combined_dataset...")

    # Append only new corrected images into combined_dataset
    for label in os.listdir(RETRAIN_DIR):
        source_folder = os.path.join(RETRAIN_DIR, label)
        target_folder = os.path.join(UPDATED_DATASET, label)

        os.makedirs(target_folder, exist_ok=True)

        for img in os.listdir(source_folder):
            source_path = os.path.join(source_folder, img)
            target_path = os.path.join(target_folder, img)

            if not os.path.exists(target_path):
                shutil.copy(source_path, target_path)
                print("Added corrected image:", target_path)

    IMG_SIZE = (224, 224)
    BATCH_SIZE = 32

    clean_invalid_images(UPDATED_DATASET)

    train_ds = tf.keras.preprocessing.image_dataset_from_directory(
        UPDATED_DATASET,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )

    val_ds = tf.keras.preprocessing.image_dataset_from_directory(
        UPDATED_DATASET,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )

    class_names = train_ds.class_names
    print("Retraining classes:", class_names)

    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)

    model = tf.keras.models.load_model("best_food_model.keras")

    for layer in model.layers:
        layer.trainable = True

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.00005),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=15
    )

    model.save("best_food_model.keras")

    print("Updated model saved.")
    
def run_retraining():
    corrections = fetch_unused_corrections()

    print("Unused corrections:", len(corrections))

    if len(corrections) <20:
        print("Not enough corrections for retraining.")
        return False

    prepare_dataset(corrections)

    # For now, this script prepares data automatically.
    # Next step: plug in your TensorFlow training code here.

    train_updated_model()
    mark_as_used(corrections)

    print("Retraining pipeline completed.")
    return True


if __name__ == "__main__":
    run_retraining()