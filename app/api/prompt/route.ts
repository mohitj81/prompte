import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import Prompt from "@/models/prompt"
import { spawn } from "child_process"

export async function GET(request: NextRequest) {
  try {
    await connectToDB()

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const isTemplate = searchParams.get("isTemplate") === "true"
    const sortBy = searchParams.get("sortBy") || "latest"

    // Build dynamic query
    const filter: any = {}
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { prompt: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ]
    }
    if (category) filter.category = category
    if (difficulty) filter.difficulty = difficulty
    if (isTemplate) filter.isTemplate = true

    // Sorting
    const sortOptions: any =
      sortBy === "oldest"
        ? { createdAt: 1 }
        : sortBy === "likes"
          ? { likes: -1 }
          : { createdAt: -1 }

    const prompts = await Prompt.find(filter)
      .populate("creator", "username email image")
      .sort(sortOptions)

    return NextResponse.json(prompts)
  } catch (error) {
    console.error("❌ Error fetching prompts:", error)
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

    // Find user by email
    const User = (await import("@/models/user")).default
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const newPrompt = new Prompt({
      creator: user._id,
      title,
      prompt,
      tags: tags || [],
      sampleResult,
    })

    await newPrompt.save()
    await newPrompt.populate("creator", "username email image")

    // ---- AUTOMATIC CATEGORIZATION USING PYTHON ----
    const python = spawn("python", ["./ml/predict.py", prompt])
    let data = "", errorData = ""

    python.stdout.on("data", (chunk) => (data += chunk.toString()))
    python.stderr.on("data", (chunk) => (errorData += chunk.toString()))

    python.on("close", async (code) => {
      if (code === 0 && !errorData) {
        try {
          const result = JSON.parse(data)
          await newPrompt.updateOne({
            category: result.predictedCategory,
            difficulty: result.difficulty,
            confidence: result.confidence,
          })
          console.log(`✅ Prompt categorized as '${result.predictedCategory}'`)
        } catch (err) {
          console.error("⚠️ JSON parse error:", err)
        }
      } else {
        console.error("⚠️ Python script error:", errorData)
      }
    })

    // Return immediately; categorization runs in background
    return NextResponse.json(newPrompt, { status: 201 })
  } catch (error) {
    console.error("❌ Error creating prompt:", error)
    return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 })
  }
}
