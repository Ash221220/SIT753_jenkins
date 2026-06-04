from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from retrain import run_retraining
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import io

import os
import requests
from dotenv import load_dotenv

app = FastAPI()

load_dotenv()
USDA_API_KEY = os.getenv("USDA_API_KEY")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model("best_food_model.keras")

with open("labels.json", "r") as f:
    class_names = json.load(f)

IMG_SIZE = (224, 224)

FOOD_QUERY_MAP = {
    "avocado_toast": "avocado toast",
    "chicken_parmigiana": "chicken parmigiana",
    "fish_and_chips": "fish and chips",
    "meat_pie": "meat pie",
    "pasta": "pasta",
    "roast_chicken": "roast chicken",
    "salad": "salad",
    "sandwich": "sandwich",
    "sausage_roll": "sausage roll",
    "vegemite_toast": "vegemite toast",
}

def get_nutrition_from_usda(predicted_food: str):
    query = FOOD_QUERY_MAP.get(predicted_food, predicted_food.replace("_", " "))

    url = "https://api.nal.usda.gov/fdc/v1/foods/search"

    params = {
        "api_key": USDA_API_KEY,
        "query": query,
        "pageSize": 1,
    }

    response = requests.get(url, params=params, timeout=10)

    if response.status_code != 200:
        return None

    data = response.json()

    if "foods" not in data or len(data["foods"]) == 0:
        return None

    food = data["foods"][0]
    nutrients = food.get("foodNutrients", [])

    nutrition = {
        "sourceFood": food.get("description", query),
        "calories": None,
        "protein": None,
        "carbohydrates": None,
        "fat": None,
    }

    for nutrient in nutrients:
        name = nutrient.get("nutrientName", "").lower()
        value = nutrient.get("value")

        if value is None:
            continue

        if "energy" in name:
            nutrition["calories"] = round(value, 2)
        elif "protein" in name:
            nutrition["protein"] = round(value, 2)
        elif "carbohydrate" in name:
            nutrition["carbohydrates"] = round(value, 2)
        elif name in ["total lipid (fat)", "total fat"]:
            nutrition["fat"] = round(value, 2)

    return nutrition


def preprocess_image(image: Image.Image):
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)

    img_array = np.array(image)
    img_array = np.expand_dims(img_array, axis=0)

    return img_array

@app.get("/")
def home():
    return {"message": "Food prediction API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    processed_image = preprocess_image(image)
    predictions = model.predict(processed_image)

    predicted_index = int(np.argmax(predictions[0]))
    predicted_food = class_names[predicted_index]
    confidence = float(np.max(predictions[0])) * 100

    nutrition = get_nutrition_from_usda(predicted_food)

    return {
        "predictedFood": predicted_food,
        "confidence": round(confidence, 2),
        "nutrition": nutrition
    }
    
@app.post("/check-retraining")
def check_retraining(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_retraining)

    return {
        "message": "Retraining check started in background"
    }