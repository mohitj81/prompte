import { type NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/utils/database"
import Prompt from "@/models/prompt"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDB()

    const prompts = await Prompt.find({ creator: params.id })
      .populate("creator", "username email image")
      .sort({ createdAt: -1 })

    return NextResponse.json(prompts)
  } catch (error) {
    console.error("Error fetching user prompts:", error)
    return NextResponse.json({ error: "Failed to fetch user prompts" }, { status: 500 })
  }
}
