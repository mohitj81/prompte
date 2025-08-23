import { NextResponse } from "next/server"
import { connectToDB } from "@/utils/database"
import Prompt from "@/models/prompt"

export async function GET() {
  try {
    await connectToDB()

    const featuredPrompts = await Prompt.find({ featured: true })
      .populate("creator", "username email image")
      .sort({ createdAt: -1 })
      .limit(6) // Limit to a reasonable number for a featured section

    return NextResponse.json(featuredPrompts)
  } catch (error) {
    console.error("Error fetching featured prompts:", error)
    return NextResponse.json({ error: "Failed to fetch featured prompts" }, { status: 500 })
  }
}
