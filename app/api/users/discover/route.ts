import { NextResponse } from "next/server"
import { connectToDB } from "@/utils/database"
import User from "@/models/user"

export async function GET() {
  try {
    await connectToDB()

    // Fetch a few users for discovery
    const users = await User.find({}).select("username image").limit(10)

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching discover users:", error)
    return NextResponse.json({ error: "Failed to fetch discover users" }, { status: 500 })
  }
}
