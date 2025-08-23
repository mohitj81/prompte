import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import User from "@/models/user"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email }).select("-password") // Exclude password if it exists

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return NextResponse.json({ error: "Failed to fetch user settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username, image } = await request.json()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (username) user.username = username
    if (image) user.image = image

    await user.save()

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user settings:", error)
    return NextResponse.json({ error: "Failed to update user settings" }, { status: 500 })
  }
}
