import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { topic, purpose, audience, tone, style, keywords, length, creativity, specificity } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 })
    }

    const prompt = `
      You are an expert AI prompt writer. Your task is to generate a highly detailed and effective prompt based on the user's specifications.
      The generated prompt should be ready to be used directly in an AI model.

      Here are the user's requirements:
      - **Topic:** ${topic}
      - **Purpose:** ${purpose}
      - **Target Audience:** ${audience}
      - **Desired Tone:** ${tone}
      - **Writing Style:** ${style}
      - **Key Keywords/Concepts to Include:** ${keywords.join(", ")}
      - **Desired Length:** ${length} (e.g., "short paragraph", "detailed essay", "bullet points")
      - **Creativity Level (1-10):** ${creativity} (1=very literal, 10=highly imaginative)
      - **Specificity Level (1-10):** ${specificity} (1=general, 10=extremely precise)

      Based on these details, craft a comprehensive and clear AI prompt.
      Ensure the prompt includes clear instructions for the AI, defines any necessary constraints, and guides the AI towards the desired output.
      Do not include any conversational text or introductions/conclusions outside of the prompt itself. Just provide the prompt.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"), // Using GPT-4o as requested
      prompt: prompt,
      temperature: creativity / 10, // Map creativity to temperature
    })

    return NextResponse.json({ generatedPrompt: text })
  } catch (error) {
    console.error("Error generating prompt with AI:", error)
    return NextResponse.json({ error: "Failed to generate prompt with AI" }, { status: 500 })
  }
}
