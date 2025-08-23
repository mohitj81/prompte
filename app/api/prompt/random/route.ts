import { type NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/utils/database"
import Prompt from "@/models/prompt"

export async function GET(request: NextRequest) {
  try {
    await connectToDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const trending = searchParams.get("trending") === "true"
    const creative = searchParams.get("creative") === "true"

    // Build aggregation pipeline
    const pipeline: any[] = []

    // Match stage
    const matchConditions: any = {}

    if (category) {
      matchConditions.category = category
    }

    if (creative) {
      matchConditions.$or = [{ category: "writing" }, { category: "design" }, { category: "entertainment" }]
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions })
    }

    // Add sorting for trending
    if (trending) {
      pipeline.push({
        $addFields: {
          trendingScore: {
            $add: [{ $size: "$likes" }, { $multiply: [{ $ifNull: ["$views", 0] }, 0.1] }],
          },
        },
      })
      pipeline.push({ $sort: { trendingScore: -1 } })
    }

    // Sample random document
    pipeline.push({ $sample: { size: 1 } })

    // Populate creator
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "creator",
      },
    })

    pipeline.push({
      $unwind: "$creator",
    })

    // Project only needed fields
    pipeline.push({
      $project: {
        title: 1,
        prompt: 1,
        tags: 1,
        category: 1,
        likes: 1,
        createdAt: 1,
        "creator._id": 1,
        "creator.username": 1,
        "creator.image": 1,
      },
    })

    const result = await Prompt.aggregate(pipeline)

    if (result.length === 0) {
      return NextResponse.json({ error: "No prompts found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching random prompt:", error)
    return NextResponse.json({ error: "Failed to fetch random prompt" }, { status: 500 })
  }
}
