import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import Collection from "@/models/collection"
import User from "@/models/user"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const collections = await Collection.find({ creator: user._id })
      .populate("creator", "username image")
      .populate({
        path: "prompts",
        populate: {
          path: "creator",
          select: "username image",
        },
      })
      .sort({ createdAt: -1 })

    return NextResponse.json(collections)
  } catch (error) {
    console.error("Error fetching collections:", error)
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDB()

    const { name, description, isPublic, prompts } = await request.json()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const newCollection = new Collection({
      creator: user._id,
      name,
      description,
      isPublic: isPublic || false,
      prompts: prompts || [],
    })

    await newCollection.save()
    await newCollection.populate("creator", "username email image")

    return NextResponse.json(newCollection, { status: 201 })
  } catch (error) {
    console.error("Error creating collection:", error)
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 })
  }
}
