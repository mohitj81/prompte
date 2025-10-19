#!/usr/bin/env python
import sys
import json
import joblib
import re
import os

# === Paths to saved model & vectorizer ===
MODEL_PATH = os.path.join("ml", "models", "model_ml.pkl")
VECTORIZER_PATH = os.path.join("ml", "models", "vectorizer.pkl")

# === Load model & vectorizer ===
try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
except Exception as e:
    print(json.dumps({"error": f"Failed to load model/vectorizer: {str(e)}"}))
    sys.exit(1)

# === Text cleaning function ===
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def predict_category(prompt):
    cleaned = clean_text(prompt)
    X_tfidf = vectorizer.transform([cleaned])
    pred_category = model.predict(X_tfidf)[0]
    
    # Get probability of predicted class
    probs = model.predict_proba(X_tfidf)[0]
    class_index = list(model.classes_).index(pred_category)
    confidence = round(float(probs[class_index]), 2)
    
    # Difficulty mapping: simple heuristic
    # (Optional: you can train a separate model for difficulty)
    if confidence >= 0.8:
        difficulty = "beginner"
    elif confidence >= 0.6:
        difficulty = "medium"
    else:
        difficulty = "advanced"

    return {
        "prompt": prompt,
        "predictedCategory": pred_category,
        "difficulty": difficulty,
        "confidence": confidence
    }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No prompt provided"}))
        sys.exit(1)

    prompt = sys.argv[1]
    result = predict_category(prompt)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
