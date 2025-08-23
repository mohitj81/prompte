import { NextResponse } from "next/server"
import { connectToDB } from "@/utils/database"
import Prompt from "@/models/prompt"

export async function GET() {
  try {
    await connectToDB()

    const popularCategories = await Prompt.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }, // Limit to top 10 popular categories
    ])

    return NextResponse.json(popularCategories)
  } catch (error) {
    console.error("Error fetching popular categories:", error)
    return NextResponse.json({ error: "Failed to fetch popular categories" }, { status: 500 })
  }
}
