import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import Prompt from "@/models/prompt"
import { spawn } from "child_process"

export async function GET() {
  try {
    await connectToDB()
    const prompts = await Prompt.find({})
      .populate("creator", "username email image")
      .sort({ createdAt: -1 })

    return NextResponse.json(prompts)
  } catch (error) {
    console.error("Error fetching prompts:", error)
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDB()

    const { title, prompt, tags, sampleResult } = await request.json()

    // Get user ID from session
    const User = (await import("@/models/user")).default
    const user = await User.findOne({ email: session.user.email })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const newPrompt = new Prompt({
      creator: user._id,
      title,
      prompt,
      tags: tags || [],
      sampleResult,
    })

    await newPrompt.save()
    await newPrompt.populate("creator", "username email image")

    // ---- AUTOMATIC CATEGORIZATION ----
    const python = spawn("python", ["./ml/predict.py", prompt])
    let data = "", errorData = ""

    python.stdout.on("data", (chunk) => data += chunk.toString())
    python.stderr.on("data", (chunk) => errorData += chunk.toString())

    python.on("close", async (code) => {
      if (code === 0 && !errorData) {
        try {
          const result = JSON.parse(data)
          await newPrompt.updateOne({
            category: result.predictedCategory,
            difficulty: result.difficulty,
            confidence: result.confidence,
          })
          console.log("✅ Prompt categorized automatically!")
        } catch (err) {
          console.error("JSON parse error:", err)
        }
      } else {
        console.error("Python error:", errorData)
      }
    })

    // Return the prompt immediately; categorization happens in background
    return NextResponse.json(newPrompt, { status: 201 })

  } catch (error) {
    console.error("Error creating prompt:", error)
    return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 })
  }
}
