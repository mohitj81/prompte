import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import Comment from "@/models/comment"
import Prompt from "@/models/prompt"
import Notification from "@/models/notification"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const promptId = params.id
    const comments = await Comment.find({ prompt: promptId })
      .populate("creator", "username image")
      .sort({ createdAt: 1 })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments for prompt:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const promptId = params.id
    const { text, parentCommentId } = await request.json()
    const userId = session.user.id

    const prompt = await Prompt.findById(promptId)
    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    const newComment = new Comment({
      creator: userId,
      prompt: promptId,
      text,
      parentComment: parentCommentId || null,
    })

    await newComment.save()
    await newComment.populate("creator", "username image")

    // Increment comment count on prompt
    prompt.commentCount = (prompt.commentCount || 0) + 1
    await prompt.save()

    // Create notification for prompt owner
    if (prompt.creator.toString() !== userId) {
      await Notification.create({
        type: "comment",
        fromUser: userId,
        toUser: prompt.creator,
        entityId: promptId,
        message: "commented on your prompt",
      })
    }

    // If it's a reply, notify the parent comment's creator
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId)
      if (parentComment && parentComment.creator.toString() !== userId) {
        await Notification.create({
          type: "comment_reply",
          fromUser: userId,
          toUser: parentComment.creator,
          entityId: parentCommentId,
          message: "replied to your comment",
        })
      }
    }

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
