import { NextResponse } from "next/server"
import { connectToDB } from "@/utils/database"
import Prompt from "@/models/prompt"

export async function GET() {
  try {
    await connectToDB()

    // Fetch only the needed fields for performance
    const prompts = await Prompt.find({}, "title prompt likes saves views creator createdAt sampleOutputImage")
      .populate("creator", "username email image")

    // Calculate popularity score dynamically
    const sortedPrompts = prompts
      .map((prompt) => {
        const likeCount = prompt.likes?.length || 0
        const saveCount = prompt.saves?.length || 0 // safely handles missing saves
        const viewCount = prompt.views || 0
        const popularityScore = likeCount + saveCount + viewCount / 10
        return {
          ...prompt.toObject(),
          popularityScore,
        }
      })
      .sort((a, b) => b.popularityScore - a.popularityScore) // Sort descending
      .slice(0, 6) // Take top 6

    return NextResponse.json(sortedPrompts)
  } catch (error) {
    console.error("Error fetching featured prompts:", error)
    return NextResponse.json({ error: "Failed to fetch featured prompts" }, { status: 500 })
  }
}
