export const dynamic = "force-dynamic";


import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import User from "@/models/user"
import Prompt from "@/models/prompt"
import Comment from "@/models/comment"
import Notification from "@/models/notification"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await User.findOne({ email: session.user.email })
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 })
    }

    const totalUsers = await User.countDocuments()
    const totalPrompts = await Prompt.countDocuments()
    const totalComments = await Comment.countDocuments()
    const totalNotifications = await Notification.countDocuments()

    const latestUsers = await User.find({}).sort({ createdAt: -1 }).limit(5)
    const latestPrompts = await Prompt.find({}).sort({ createdAt: -1 }).limit(5)

    // Example: Prompts by category
    const promptsByCategory = await Prompt.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    // Example: User activity (e.g., prompts created per user)
    const userPromptCounts = await Prompt.aggregate([
      { $group: { _id: "$creator", count: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "creatorInfo" } },
      { $unwind: "$creatorInfo" },
      { $project: { _id: 0, username: "$creatorInfo.username", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalPrompts,
        totalComments,
        totalNotifications,
      },
      latestUsers,
      latestPrompts,
      promptsByCategory,
      userPromptCounts,
    })
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch admin dashboard data" }, { status: 500 })
  }
}
