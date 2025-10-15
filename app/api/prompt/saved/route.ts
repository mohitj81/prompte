export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import SavedPrompt from "@/models/saved-prompt"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const savedPrompts = await SavedPrompt.find({ user: session.user.id })
      .populate({
        path: "prompt",
        populate: {
          path: "creator",
          select: "username email image",
        },
      })
      .sort({ createdAt: -1 })

    // Filter out null prompts if any were deleted
    const filteredSavedPrompts = savedPrompts.filter((sp) => sp.prompt !== null)

    return NextResponse.json(filteredSavedPrompts)
  } catch (error) {
    console.error("Error fetching saved prompts:", error)
    return NextResponse.json({ error: "Failed to fetch saved prompts" }, { status: 500 })
  }
}
