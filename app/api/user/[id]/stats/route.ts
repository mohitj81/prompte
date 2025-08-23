import { NextResponse } from "next/server"
import { connectToDB } from "@/utils/database"
import User from "@/models/user"
import Prompt from "@/models/prompt"
import Comment from "@/models/comment"
import Follow from "@/models/follow"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const userId = params.id

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const promptCount = await Prompt.countDocuments({ creator: userId })
    const commentCount = await Comment.countDocuments({ creator: userId })
    const followersCount = await Follow.countDocuments({ following: userId })
    const followingCount = await Follow.countDocuments({ follower: userId })

    // Calculate total likes received on user's prompts
    const totalLikesReceivedResult = await Prompt.aggregate([
      { $match: { creator: user._id } },
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
    const totalLikesReceived = totalLikesReceivedResult.length > 0 ? totalLikesReceivedResult[0].totalLikes : 0

    // Calculate total views on user's prompts
    const totalViewsReceivedResult = await Prompt.aggregate([
      { $match: { creator: user._id } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ])
    const totalViewsReceived = totalViewsReceivedResult.length > 0 ? totalViewsReceivedResult[0].totalViews : 0

    return NextResponse.json({
      promptCount,
      commentCount,
      followersCount,
      followingCount,
      totalLikesReceived,
      totalViewsReceived,
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
  }
}
