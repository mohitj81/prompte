import { NextResponse } from "next/server"
import { connectToDB } from "@/utils/database"
import Collection from "@/models/collection"

export async function GET() {
  try {
    await connectToDB()

    const publicCollections = await Collection.find({ isPublic: true })
      .populate("creator", "username image")
      .populate({
        path: "prompts",
        populate: {
          path: "creator",
          select: "username image",
        },
      })
      .sort({ createdAt: -1 })

    return NextResponse.json(publicCollections)
  } catch (error) {
    console.error("Error fetching public collections:", error)
    return NextResponse.json({ error: "Failed to fetch public collections" }, { status: 500 })
  }
}
