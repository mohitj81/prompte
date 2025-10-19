import pandas as pd
import re
import os

df = pd.read_csv("data/prompts.csv")

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

df["prompt"] = df["prompt"].apply(clean_text)

os.makedirs("data", exist_ok=True)
df.to_csv("data/prompts_clean.csv", index=False)

print("✅ Preprocessing done, cleaned prompts saved to data/prompts_clean.csv")
