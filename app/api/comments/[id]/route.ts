import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import Comment from "@/models/comment"
import Notification from "@/models/notification"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const commentId = params.id
    const comment = await Comment.findById(commentId).populate("creator", "username image")

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error fetching comment:", error)
    return NextResponse.json({ error: "Failed to fetch comment" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const commentId = params.id
    const { text } = await request.json()

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    if (comment.creator.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not comment owner" }, { status: 403 })
    }

    comment.text = text
    await comment.save()

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const commentId = params.id
    const comment = await Comment.findById(commentId)

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    if (comment.creator.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not comment owner" }, { status: 403 })
    }

    await Comment.deleteOne({ _id: commentId })
    // Remove related notifications
    await Notification.deleteMany({ entityId: commentId, type: { $in: ["comment_like", "comment_reply"] } })

    return NextResponse.json({ message: "Comment deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
