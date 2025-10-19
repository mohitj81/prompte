# python/adaptive_prompt_generator.py
import sys
import os
import json
import pickle
from pathlib import Path
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors

# Path to store/load user data
DATA_DIR = Path(__file__).parent / "user_data"
DATA_DIR.mkdir(exist_ok=True)

def load_user_data(user_email: str):
    user_file = DATA_DIR / f"{user_email.replace('@', '_at_')}.pkl"
    if user_file.exists():
        with open(user_file, "rb") as f:
            return pickle.load(f)
    return {"prompts": []}

def save_user_data(user_email: str, data):
    user_file = DATA_DIR / f"{user_email.replace('@', '_at_')}.pkl"
    with open(user_file, "wb") as f:
        pickle.dump(data, f)

def train_model(prompts: List[str]):
    """
    Train a simple TF-IDF + NearestNeighbors model on previous prompts
    """
    vectorizer = TfidfVectorizer(stop_words="english")
    X = vectorizer.fit_transform(prompts)
    model = NearestNeighbors(n_neighbors=min(5, len(prompts)), metric="cosine")
    model.fit(X)
    return vectorizer, model

def generate_adaptive_prompt(topic: str, user_email: str):
    # Load user data
    user_data = load_user_data(user_email)
    previous_prompts = user_data.get("prompts", [])

    if not previous_prompts:
        new_prompt = f"Create a prompt about '{topic}'."
    else:
        # Train model
        vectorizer, model = train_model(previous_prompts)

        # Find closest previous prompt(s)
        topic_vec = vectorizer.transform([topic])
        distances, indices = model.kneighbors(topic_vec)

        similar_prompts = [previous_prompts[i] for i in indices[0] if i < len(previous_prompts)]

        new_prompt = f"Create a new prompt about '{topic}'. " \
                     f"Some ideas from your previous prompts: {'; '.join(similar_prompts)}"

    # Save new prompt to user data
    user_data["prompts"].append(new_prompt)
    save_user_data(user_email, user_data)

    return new_prompt

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python adaptive_prompt_generator.py generate <topic> <user_email>")
        sys.exit(1)

    action = sys.argv[1]
    topic = sys.argv[2]
    user_email = sys.argv[3]

    if action == "generate":
        prompt = generate_adaptive_prompt(topic, user_email)
        print(prompt)
    else:
        print("Unknown action:", action)
        sys.exit(1)
