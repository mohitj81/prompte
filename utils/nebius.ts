// utils/nebius.ts
import fetch from "node-fetch"; // or global fetch in Node 18+

export interface StyleAnalysis {
  averageLength: number;
  frequentWords: string[];
  categories: Record<string, number>;
  tone?: string;
}

export async function analyzePromptStyle(prompts: string[]): Promise<StyleAnalysis> {
  const input = prompts.join("\n");

  const response = await fetch(process.env.NEBIUS_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEBIUS_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemma-2-2b-it:nebius",
      input,
    }),
  });

  if (!response.ok) {
    throw new Error(`Nebius API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Assuming the model returns something like:
  // { averageLength: 50, frequentWords: ["AI","cyber"], categories: {writing: 3, coding: 2}, tone: "technical" }
  return data as StyleAnalysis;
}

export async function generatePromptInStyle(styleProfile: StyleAnalysis, topic: string): Promise<string> {
  const prompt = `Generate a prompt about "${topic}" in the following style:
Frequent words: ${styleProfile.frequentWords.join(", ")}
Average length: ${styleProfile.averageLength} words
Tone: ${styleProfile.tone || "neutral"}
Categories: ${Object.keys(styleProfile.categories).join(", ")}
`;

  const response = await fetch(process.env.NEBIUS_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEBIUS_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemma-2-2b-it:nebius",
      input: prompt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Nebius API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.output || data.text || JSON.stringify(data);
}
