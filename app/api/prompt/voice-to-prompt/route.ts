import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 })
    }

    // Convert speech transcript to structured prompt
    const { text: prompt } = await generateText({
      model: openai("gpt-4o"),
      prompt: `You are an expert prompt engineer. Convert this spoken transcript into a well-structured, clear AI prompt that captures the user's intent.

Rules:
1. Make it specific and actionable
2. Add proper context and constraints
3. Structure it for optimal AI response
4. Maintain the original intent but improve clarity
5. If the speech is unclear, make reasonable assumptions

Spoken transcript: "${transcript}"

Return only the structured prompt, nothing else.`,
    })

    return NextResponse.json({
      prompt: prompt.trim(),
    })
  } catch (error) {
    console.error("Error converting voice to prompt:", error)
    return NextResponse.json({ error: "Failed to convert voice to prompt" }, { status: 500 })
  }
}
