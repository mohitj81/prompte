import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/utils/database"
import Notification from "@/models/notification"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notificationId = params.id
    const notification = await Notification.findById(notificationId)

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if (notification.toUser.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not notification recipient" }, { status: 403 })
    }

    notification.read = true
    await notification.save()

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notificationId = params.id
    const notification = await Notification.findById(notificationId)

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if (notification.toUser.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not notification recipient" }, { status: 403 })
    }

    await Notification.deleteOne({ _id: notificationId })

    return NextResponse.json({ message: "Notification deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}
