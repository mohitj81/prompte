import { NextResponse } from "next/server"
import { connectToDB } from "@/utils/database"
import Prompt from "@/models/prompt"

export async function GET() {
  try {
    await connectToDB()

    const popularTags = await Prompt.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }, // Limit to top 15 popular tags
    ])

    return NextResponse.json(popularTags)
  } catch (error) {
    console.error("Error fetching popular tags:", error)
    return NextResponse.json({ error: "Failed to fetch popular tags" }, { status: 500 })
  }
}
