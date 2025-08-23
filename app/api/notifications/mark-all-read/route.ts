import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import Notification from "@/models/notification"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PATCH() {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await Notification.updateMany({ toUser: session.user.id, read: false }, { $set: { read: true } })

    return NextResponse.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 })
  }
}
