"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, Trash2, Loader2 } from "lucide-react"
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

export default function NotificationDropdown() {
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

  const unreadCount = notifications.filter((n) => !n.read).length

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-bold text-lg text-gray-900 dark:text-white">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700 my-2" />
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 py-4">No notifications.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${notification.read ? "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400" : "bg-blue-50/50 dark:bg-blue-900/20 text-gray-900 dark:text-white"}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={notification.fromUser.image || "/placeholder-user.jpg"}
                    alt={notification.fromUser.username}
                  />
                  <AvatarFallback>{notification.fromUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Link href={getNotificationLink(notification)} className="flex-grow text-sm">
                  <p>
                    <span className="font-semibold">{notification.fromUser.username}</span> {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </Link>
                {!notification.read && (
                  <Button variant="ghost" size="icon" onClick={() => markAsRead(notification._id)} className="h-7 w-7">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="sr-only">Mark as read</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteNotification(notification._id)}
                  className="h-7 w-7"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span className="sr-only">Delete notification</span>
                </Button>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700 my-2" />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="w-full text-center text-blue-600 dark:text-blue-400 hover:underline">
            View All Notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
