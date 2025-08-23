import { NextResponse } from "next/server"
import { connectToDB } from "@/utils/database"
import User from "@/models/user"
import Prompt from "@/models/prompt"
import Comment from "@/models/comment"

export async function GET() {
  try {
    await connectToDB()

    const totalUsers = await User.countDocuments()
    const totalPrompts = await Prompt.countDocuments()
    const totalComments = await Comment.countDocuments()

    // Calculate total likes across all prompts
    const totalLikesResult = await Prompt.aggregate([
      {
        $project: {
          likesCount: { $size: "$likes" },
        },
      },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: "$likesCount" },
        },
      },
    ])
    const totalLikes = totalLikesResult.length > 0 ? totalLikesResult[0].totalLikes : 0

    // Calculate total views across all prompts
    const totalViewsResult = await Prompt.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ])
    const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0

    // Get number of unique categories
    const uniqueCategories = await Prompt.distinct("category")
    const totalCategories = uniqueCategories.length

    return NextResponse.json({
      totalUsers,
      totalPrompts,
      totalComments,
      totalLikes,
      totalViews,
      totalCategories,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
