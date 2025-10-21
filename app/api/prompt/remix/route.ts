import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Remix request body:", body);

    const originalPrompt = body.prompt;
    const options = body.options || {};

    const tone = options.tone || "Keep original tone";
    const style = options.style || "Keep original style";
    const subjectChange =
      options.subject || "No specific subject change, focus on tone/style.";
    const additionalInstructions = options.constraints || "None.";

    if (!originalPrompt || originalPrompt.trim() === "") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!process.env.HF_TOKEN) {
      console.error("❌ Missing Hugging Face API key (HF_TOKEN)");
      return NextResponse.json(
        { error: "HF_TOKEN is not set in environment variables" },
        { status: 500 }
      );
    }

    // ✅ Construct the remix instruction prompt
    const remixPrompt = `
You are an AI prompt remixer. Your goal is to transform an existing AI prompt based on new parameters.

Original prompt:
"${originalPrompt}"

Please remix this prompt with the following changes:
- Tone: ${tone}
- Style: ${style}
- Subject Change: ${subjectChange}
- Additional Instructions: ${additionalInstructions}

Output only the remixed prompt text — no commentary, no intros or outros.
`;

    // ✅ Initialize OpenAI client but use Hugging Face as backend
    const client = new OpenAI({
      apiKey: process.env.HF_TOKEN,
      baseURL: "https://router.huggingface.co/v1",
    });

    console.log("Sending remix request to Hugging Face model...");

    // ✅ Use Gemma model via Nebius (just like your AI Writer)
    const completion = await client.chat.completions.create({
      model: "google/gemma-2-2b-it:nebius",
      messages: [{ role: "user", content: remixPrompt }],
      max_tokens: 256,
    });

    const remixedPrompt =
      completion.choices[0].message?.content?.trim() || "No remixed prompt generated.";

    console.log("✅ Remix successful!");
    return NextResponse.json({ remixedPrompt });
  } catch (error) {
    console.error("❌ Error remixing prompt with Hugging Face:", error);
    return NextResponse.json(
      { error: "Failed to remix prompt with Hugging Face" },
      { status: 500 }
    );
  }
}
