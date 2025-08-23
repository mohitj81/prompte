import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import Comment from "@/models/comment"
import Notification from "@/models/notification"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDB()

    const commentId = params.id
    const userId = session.user.id

    const comment = await Comment.findById(commentId).populate("author", "username")

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    const isLiked = comment.likes.includes(userId)

    if (isLiked) {
      // Unlike
      comment.likes = comment.likes.filter((id: any) => id.toString() !== userId)
      // Remove notification if it exists
      await Notification.deleteOne({
        type: "comment_like",
        fromUser: userId,
        toUser: comment.author._id,
        entityId: commentId,
      })
    } else {
      // Like
      comment.likes.push(userId)
      // Add notification
      if (comment.author._id.toString() !== userId) {
        await Notification.create({
          type: "comment_like",
          fromUser: userId,
          toUser: comment.author._id,
          entityId: commentId,
          message: "liked your comment",
        })
      }
    }

    await comment.save()

    return NextResponse.json({ message: "Comment like status updated", isLiked: !isLiked, likes: comment.likes.length })
  } catch (error) {
    console.error("Error updating comment like status:", error)
    return NextResponse.json({ error: "Failed to update comment like status" }, { status: 500 })
  }
}
