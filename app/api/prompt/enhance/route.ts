import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Enhance the prompt
    const { text: enhanced } = await generateText({
      model: openai("gpt-4o"),
      prompt: `You are an expert prompt engineer. Take this prompt and make it significantly better by:
      1. Making it more specific and detailed
      2. Adding context and constraints where helpful
      3. Improving clarity and structure
      4. Making it more likely to produce high-quality results

      Original prompt: "${prompt}"

      Return only the enhanced prompt, nothing else.`,
    })

    // Analyze the original prompt
    const { text: analysisText } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Analyze this AI prompt and provide a JSON response with the following structure:
      {
        "tone": "creative/professional/casual/technical/etc",
        "complexity": "beginner/intermediate/advanced",
        "intent": "content generation/analysis/creative writing/etc",
        "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
      }

      Prompt to analyze: "${prompt}"

      Return only valid JSON, no other text.`,
    })

    let analysis
    try {
      analysis = JSON.parse(analysisText)
    } catch {
      analysis = {
        tone: "neutral",
        complexity: "intermediate",
        intent: "general",
        suggestions: [
          "Consider adding more specific context",
          "Define the desired output format",
          "Include examples if helpful",
        ],
      }
    }

    return NextResponse.json({
      enhanced: enhanced.trim(),
      analysis,
    })
  } catch (error) {
    console.error("Error enhancing prompt:", error)
    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 })
  }
}
