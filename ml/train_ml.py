# ml/train_ml.py
import pandas as pd
import re
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

# === Load data ===
csv_path = "data/prompts.csv"
if not os.path.exists(csv_path):
    raise FileNotFoundError(f"CSV file not found at {csv_path}. Run fetch_data.py first.")

df = pd.read_csv(csv_path)

# === Clean text ===
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+", "", text)       # remove URLs
    text = re.sub(r"[^a-z\s]", "", text)     # remove non-alpha characters
    text = re.sub(r"\s+", " ", text).strip() # collapse whitespace
    return text

df["prompt_clean"] = df["prompt"].apply(clean_text)

# === Filter categories with at least 2 samples ===
counts = df["category"].value_counts()
valid_categories = counts[counts >= 2].index
if len(valid_categories) < len(counts):
    print(f"⚠️ Some categories have <2 prompts and will be removed: {set(counts.index) - set(valid_categories)}")
df = df[df["category"].isin(valid_categories)]

# === Features and labels ===
X = df["prompt_clean"]
y = df["category"]

# === Split train/test ===
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# === TF-IDF Vectorizer ===
vectorizer = TfidfVectorizer(max_features=5000, stop_words="english")
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# === Logistic Regression model ===
model = LogisticRegression(max_iter=1000)
model.fit(X_train_tfidf, y_train)

# === Evaluation ===
y_pred = model.predict(X_test_tfidf)
print("✅ Classification Report:\n")
print(classification_report(y_test, y_pred))

# === Confusion Matrix ===
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', xticklabels=model.classes_, yticklabels=model.classes_, cmap='Blues')
plt.title("Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")
os.makedirs("ml/models", exist_ok=True)
plt.savefig("ml/models/confusion_matrix_ml.png")
plt.close()

# === Save model & vectorizer ===
joblib.dump(model, "ml/models/model_ml.pkl")
joblib.dump(vectorizer, "ml/models/vectorizer.pkl")

print("✅ ML model and vectorizer saved in ml/models/")
