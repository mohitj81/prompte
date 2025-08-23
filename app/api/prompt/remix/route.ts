import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { originalPrompt, tone, style, subjectChange, additionalInstructions } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 })
    }

    const prompt = `
      You are an AI prompt remixer. Your goal is to transform an existing AI prompt based on new parameters.
      Here is the original prompt:
      "${originalPrompt}"

      Please remix this prompt with the following changes:
      - **Tone:** ${tone || "Keep original tone"}
      - **Style:** ${style || "Keep original style"}
      - **Subject Change:** ${subjectChange || "No specific subject change, focus on tone/style."}
      - **Additional Instructions:** ${additionalInstructions || "None."}

      Generate the remixed prompt. Ensure it is a complete and coherent prompt ready for an AI model.
      Do not include any conversational text or introductions/conclusions outside of the remixed prompt itself. Just provide the remixed prompt.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"), // Using GPT-4o
      prompt: prompt,
      temperature: 0.7, // A moderate temperature for creative remixing
    })

    return NextResponse.json({ remixedPrompt: text })
  } catch (error) {
    console.error("Error remixing prompt with AI:", error)
    return NextResponse.json({ error: "Failed to remix prompt with AI" }, { status: 500 })
  }
}
