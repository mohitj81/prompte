import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const {
      topic,
      purpose,
      audience,
      tone,
      style,
      keywords,
      length,
      creativity,
      specificity,
    } = await request.json();

    const prompt = `
You are an expert AI prompt writer. Generate a detailed prompt based on these details:
- Topic: ${topic}
- Purpose: ${purpose}
- Target Audience: ${audience}
- Tone: ${tone}
- Style: ${style}
- Keywords: ${keywords.join(", ")}
- Length: ${length}
- Creativity (1-10): ${creativity}
- Specificity (1-10): ${specificity}

Output only the final prompt text.
`;

    const client = new OpenAI({
      apiKey: process.env.HF_TOKEN,
      baseURL: "https://router.huggingface.co/v1",
    });

    const completion = await client.chat.completions.create({
      model: "google/gemma-2-2b-it:nebius",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 256,
    });

    const generatedPrompt = completion.choices[0].message?.content?.trim() || "No output generated.";

    return NextResponse.json({ generatedPrompt });
  } catch (error) {
    console.error("Error generating prompt with Hugging Face:", error);
    return NextResponse.json(
      { error: "Failed to generate prompt with Hugging Face" },
      { status: 500 }
    );
  }
}
