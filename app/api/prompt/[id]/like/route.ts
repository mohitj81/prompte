import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import Prompt from "@/models/prompt"
import Notification from "@/models/notification"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDB()

    const promptId = params.id
    const userId = session.user.id

    const prompt = await Prompt.findById(promptId).populate("creator", "username email image")

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    const isLiked = prompt.likes.includes(userId)

    if (isLiked) {
      // Unlike
      prompt.likes = prompt.likes.filter((id: any) => id.toString() !== userId)
      // Remove notification if it exists
      await Notification.deleteOne({
        type: "like",
        fromUser: userId,
        toUser: prompt.creator._id,
        entityId: promptId,
      })
    } else {
      // Like
      prompt.likes.push(userId)
      // Add notification
      if (prompt.creator._id.toString() !== userId) {
        await Notification.create({
          user: prompt.creator._id,
          message: `${session.user.name} liked your prompt "${prompt.title}"`,
          type: "like",
          relatedPrompt: promptId,
          fromUser: userId,
        })
      }
    }

    await prompt.save()

    return NextResponse.json({ message: "Prompt like status updated", isLiked: !isLiked, likes: prompt.likes.length })
  } catch (error) {
    console.error("Error updating prompt like status:", error)
    return NextResponse.json({ error: "Failed to update prompt like status" }, { status: 500 })
  }
}
