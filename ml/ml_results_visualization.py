import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, confusion_matrix

# ----------------------------
# 1️⃣ Temporary Dataset
# ----------------------------
data = {
    "prompt": [
        "Write a product ad",
        "Explain photosynthesis",
        "Plan a social media campaign",
        "Create a math quiz",
        "Design a business plan",
        "Write a story about friendship",
        "Marketing strategy for a new app",
        "Explain Newton's laws",
        "Draft a motivational speech",
        "Plan a new app launch"
    ],
    "true_category": [
        "marketing",
        "education",
        "marketing",
        "education",
        "marketing",
        "storytelling",
        "marketing",
        "education",
        "storytelling",
        "marketing"
    ],
    "predicted_category": [
        "marketing",
        "education",
        "marketing",
        "marketing",       # misclassified
        "marketing",
        "storytelling",
        "marketing",
        "education",
        "storytelling",
        "marketing"
    ],
    "confidence": [
        0.92, 0.88, 0.95, 0.55, 0.90, 0.97, 0.93, 0.85, 0.91, 0.94
    ]
}

df = pd.DataFrame(data)

# ----------------------------
# 2️⃣ Overall Accuracy
# ----------------------------
accuracy = accuracy_score(df['true_category'], df['predicted_category'])
print(f"Overall ML Model Accuracy: {accuracy*100:.2f}%")

# ----------------------------
# 3️⃣ Confusion Matrix
# ----------------------------
labels = df['true_category'].unique()
cm = confusion_matrix(df['true_category'], df['predicted_category'], labels=labels)

plt.figure(figsize=(8,6))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=labels, yticklabels=labels)
plt.xlabel("Predicted Category")
plt.ylabel("True Category")
plt.title("Confusion Matrix - ML Prompt Categorization")
plt.show()

# ----------------------------
# 4️⃣ Category-wise Accuracy
# ----------------------------
category_acc = df.groupby('true_category').apply(lambda x: (x['true_category'] == x['predicted_category']).mean())

plt.figure(figsize=(8,5))
category_acc.plot(kind='bar', color='skyblue')
plt.ylabel("Accuracy")
plt.ylim(0,1)
plt.title("Category-wise Accuracy")
plt.show()

# ----------------------------
# 5️⃣ Confidence Distribution
# ----------------------------
plt.figure(figsize=(8,4))
plt.hist(df['confidence'], bins=5, color='lightgreen', edgecolor='black')
plt.xlabel("Prediction Confidence")
plt.ylabel("Number of Prompts")
plt.title("Confidence Levels of ML Predictions")
plt.show()

# ----------------------------
# 6️⃣ Summary
# ----------------------------
print("\nCategory-wise Accuracy:")
print(category_acc)
print("\nAverage Confidence:", df['confidence'].mean())
