# ml/fetch_and_clean.py
import pandas as pd
import re
from pymongo import MongoClient
import os

# === MongoDB Connection ===
MONGODB_URI = "mongodb+srv://mohitjangir814:Hastalavista.0@promptbook.shmonje.mongodb.net/?retryWrites=true&w=majority&appName=Promptbook"
client = MongoClient(MONGODB_URI)

db = client["promptshare"]
collection = db["prompts"]

# === Fetch Data ===
data = list(collection.find({}, {"_id": 0, "prompt": 1, "category": 1}))
if not data:
    raise ValueError("⚠️ No prompts found in promptshare.prompts — check collection name or contents.")

df = pd.DataFrame(data)
df = df.dropna(subset=["prompt", "category"])

# === Clean Text ===
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

df["prompt_clean"] = df["prompt"].apply(clean_text)

# === Save clean CSV ===
os.makedirs("data", exist_ok=True)
df.to_csv("data/prompts_clean.csv", index=False, encoding="utf-8")

print(f"✅ Exported {len(df)} cleaned prompts to data/prompts_clean.csv")
print(df.head())
