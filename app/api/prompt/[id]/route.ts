import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import Prompt from "@/models/prompt"
import Notification from "@/models/notification"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const promptId = params.id
    const prompt = await Prompt.findById(promptId).populate("creator", "username email image")

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    // Increment view count
    prompt.views = (prompt.views || 0) + 1
    await prompt.save()

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error("Error fetching prompt:", error)
    return NextResponse.json({ error: "Failed to fetch prompt" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const promptId = params.id
    const {
      title,
      prompt: newPromptText,
      tags,
      sampleResult,
      sampleOutputImage,
      category,
      difficulty,
      isTemplate,
      templateVariables,
    } = await request.json()

    const existingPrompt = await Prompt.findById(promptId)

    if (!existingPrompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    if (existingPrompt.creator.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not prompt owner" }, { status: 403 })
    }

    existingPrompt.title = title
    existingPrompt.prompt = newPromptText
    existingPrompt.tags = tags || []
    existingPrompt.sampleResult = sampleResult || ""
    existingPrompt.sampleOutputImage = sampleOutputImage || "" // Update image field
    existingPrompt.category = category || "other"
    existingPrompt.difficulty = difficulty || "beginner"
    existingPrompt.isTemplate = isTemplate || false
    existingPrompt.templateVariables = templateVariables || []

    await existingPrompt.save()

    return NextResponse.json(existingPrompt)
  } catch (error) {
    console.error("Error updating prompt:", error)
    return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const promptId = params.id
    const prompt = await Prompt.findById(promptId)

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    if (prompt.creator.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not prompt owner" }, { status: 403 })
    }

    await Prompt.deleteOne({ _id: promptId })
    // Remove related notifications
    await Notification.deleteMany({ entityId: promptId, type: { $in: ["like", "comment", "save"] } })

    return NextResponse.json({ message: "Prompt deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting prompt:", error)
    return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 })
  }
}
