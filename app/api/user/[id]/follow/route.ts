import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import Follow from "@/models/follow"
import User from "@/models/user"
import Notification from "@/models/notification"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const targetUserId = params.id
    const currentUserId = session.user.id

    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    const existingFollow = await Follow.findOne({ follower: currentUserId, following: targetUserId })

    if (existingFollow) {
      // Unfollow
      await Follow.deleteOne({ _id: existingFollow._id })
      // Remove notification
      await Notification.deleteOne({
        type: "follow",
        fromUser: currentUserId,
        toUser: targetUserId,
      })
      return NextResponse.json({ message: "Unfollowed successfully", isFollowing: false })
    } else {
      // Follow
      const newFollow = new Follow({
        follower: currentUserId,
        following: targetUserId,
      })
      await newFollow.save()
      // Add notification
      await Notification.create({
        type: "follow",
        fromUser: currentUserId,
        toUser: targetUserId,
        message: "started following you",
      })
      return NextResponse.json({ message: "Followed successfully", isFollowing: true }, { status: 201 })
    }
  } catch (error) {
    console.error("Error updating follow status:", error)
    return NextResponse.json({ error: "Failed to update follow status" }, { status: 500 })
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

    await Follow.findOneAndDelete({
      follower: user._id,
      following: params.id,
    })

    return NextResponse.json({ message: "Successfully unfollowed user" })
  } catch (error) {
    console.error("Error unfollowing user:", error)
    return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 })
  }
}
