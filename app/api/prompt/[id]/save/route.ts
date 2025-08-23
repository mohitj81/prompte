import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import SavedPrompt from "@/models/saved-prompt"
import User from "@/models/user"
import Notification from "@/models/notification"
import Prompt from "@/models/prompt"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const promptId = params.id
    const userId = session.user.id

    const existingSavedPrompt = await SavedPrompt.findOne({ user: userId, prompt: promptId })

    if (existingSavedPrompt) {
      // Unsave
      await SavedPrompt.deleteOne({ _id: existingSavedPrompt._id })
      // Remove notification if it exists
      const prompt = await Prompt.findById(promptId)
      if (prompt) {
        await Notification.deleteOne({
          type: "save",
          fromUser: userId,
          toUser: prompt.creator,
          entityId: promptId,
        })
      }
      return NextResponse.json({ message: "Prompt unsaved successfully", isSaved: false })
    } else {
      // Save
      const newSavedPrompt = new SavedPrompt({
        user: userId,
        prompt: promptId,
      })
      await newSavedPrompt.save()

      // Add notification
      const prompt = await Prompt.findById(promptId)
      if (prompt && prompt.creator.toString() !== userId) {
        await Notification.create({
          type: "save",
          fromUser: userId,
          toUser: prompt.creator,
          entityId: promptId,
          message: "saved your prompt",
        })
      }
      return NextResponse.json({ message: "Prompt saved successfully", isSaved: true }, { status: 201 })
    }
  } catch (error) {
    console.error("Error updating saved prompt status:", error)
    return NextResponse.json({ error: "Failed to update saved prompt status" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDB()

    // Get user from session
    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await SavedPrompt.findOneAndDelete({
      user: user._id,
      prompt: params.id,
    })

    return NextResponse.json({ message: "Prompt unsaved successfully" })
  } catch (error) {
    console.error("Error unsaving prompt:", error)
    return NextResponse.json({ error: "Failed to unsave prompt" }, { status: 500 })
  }
}
