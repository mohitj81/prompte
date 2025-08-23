import { NextResponse } from "next/server"
import { connectToDB } from "@/utils/database"
import Prompt from "@/models/prompt"

export async function GET(request: Request) {
  try {
    await connectToDB()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const tags = searchParams.get("tags") ? searchParams.get("tags")?.split(",") : []

    const filter: any = {}

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { prompt: { $regex: query, $options: "i" } },
        { sampleResult: { $regex: query, $options: "i" } },
      ]
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags.map((tag) => new RegExp(tag, "i")) }
    }

    const prompts = await Prompt.find(filter)
      .populate("creator", "username email image")
      .sort({ createdAt: -1 })
      .limit(20) // Limit results for search

    return NextResponse.json(prompts)
  } catch (error) {
    console.error("Error searching prompts:", error)
    return NextResponse.json({ error: "Failed to search prompts" }, { status: 500 })
  }
}
