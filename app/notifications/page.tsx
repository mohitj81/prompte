"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Bell, CheckCircle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Notification {
  _id: string
  type: "like" | "comment" | "follow" | "save" | "comment_like" | "comment_reply"
  fromUser: {
    _id: string
    username: string
    image: string
  }
  toUser: string
  entityId?: string // ID of the prompt/comment/etc.
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchNotifications = async () => {
    if (status !== "authenticated") return

    setLoading(true)
    try {
      const res = await fetch("/api/notifications")
      if (!res.ok) {
        throw new Error("Failed to fetch notifications")
      }
      const data = await res.json()
      setNotifications(data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [status])

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
      })
      if (!res.ok) {
        throw new Error("Failed to mark as read")
      }
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
      toast({
        title: "Marked as Read",
        description: "Notification has been marked as read.",
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
      })
      if (!res.ok) {
        throw new Error("Failed to mark all as read")
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast({
        title: "All Marked as Read",
        description: "All notifications have been marked as read.",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      })
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Failed to delete notification")
      }
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      toast({
        title: "Deleted",
        description: "Notification has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification.",
        variant: "destructive",
      })
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <span className="sr-only">Loading notifications...</span>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] text-gray-600 dark:text-gray-400">
        Please sign in to view your notifications.
      </div>
    )
  }

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case "like":
      case "comment":
      case "save":
        return `/prompt/${notification.entityId}`
      case "follow":
        return `/profile/${notification.fromUser._id}`
      case "comment_like":
      case "comment_reply":
        // For comment likes/replies, link to the prompt containing the comment
        // This might require fetching the comment to get its associated promptId
        // For simplicity, linking to the prompt detail page for now.
        return notification.entityId ? `/prompt/${notification.entityId}` : "#"
      default:
        return "#"
    }
  }

  return (
    <section className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 flex flex-row items-center justify-between">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-blue-600" /> Notifications
          </CardTitle>
          <Button onClick={markAllAsRead} variant="outline" size="sm" className="text-sm bg-transparent">
            Mark All as Read
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-8">
              <p className="text-lg font-medium mb-2">No new notifications.</p>
              <p>You're all caught up!</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                    notification.read
                      ? "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      : "bg-blue-50/50 dark:bg-blue-900/20 text-gray-900 dark:text-white font-medium shadow-sm"
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={notification.fromUser.image || "/placeholder-user.jpg"}
                      alt={notification.fromUser.username}
                    />
                    <AvatarFallback>{notification.fromUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <Link href={getNotificationLink(notification)} className="hover:underline">
                      <p>
                        <span className="font-semibold">{notification.fromUser.username}</span> {notification.message}
                      </p>
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <Button variant="ghost" size="icon" onClick={() => markAsRead(notification._id)}>
                        <CheckCircle className="w-5 h-5 text-green-500 hover:text-green-600" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification._id)}>
                      <Trash2 className="w-5 h-5 text-red-500 hover:text-red-600" />
                      <span className="sr-only">Delete notification</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
