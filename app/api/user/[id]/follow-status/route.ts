import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import Follow from "@/models/follow"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ isFollowing: false, error: "Unauthorized" }, { status: 401 })
    }

    const targetUserId = params.id
    const currentUserId = session.user.id

    if (targetUserId === currentUserId) {
      return NextResponse.json({ isFollowing: false, isSelf: true })
    }

    const follow = await Follow.findOne({ follower: currentUserId, following: targetUserId })

    return NextResponse.json({ isFollowing: !!follow, isSelf: false })
  } catch (error) {
    console.error("Error fetching follow status:", error)
    return NextResponse.json({ error: "Failed to fetch follow status" }, { status: 500 })
  }
}
