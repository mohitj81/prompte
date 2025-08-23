"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserPlus, UserMinus, Users, FileText, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  _id: string
  username: string
  email: string
  image: string
  role: string
}

interface UserStats {
  promptCount: number
  followerCount: number
  followingCount: number
  totalLikes: number
}

interface UserProfileCardProps {
  user: User
  showFollowButton?: boolean
  compact?: boolean
}

export default function UserProfileCard({ user, showFollowButton = true, compact = false }: UserProfileCardProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isFollowing, setIsFollowing] = useState(false)
  const [stats, setStats] = useState<UserStats>({
    promptCount: 0,
    followerCount: 0,
    followingCount: 0,
    totalLikes: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUserStats()
    if (session?.user && showFollowButton) {
      checkFollowStatus()
    }
  }, [user._id, session])

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/user/${user._id}/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
    }
  }

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/user/${user._id}/follow-status`)
      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.isFollowing)
      }
    } catch (error) {
      console.error("Error checking follow status:", error)
    }
  }

  const handleFollow = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/user/${user._id}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        setStats((prev) => ({
          ...prev,
          followerCount: isFollowing ? prev.followerCount - 1 : prev.followerCount + 1,
        }))
        toast({
          title: "Success",
          description: isFollowing ? `Unfollowed ${user.username}` : `Now following ${user.username}`,
        })
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.image || "/placeholder.svg"} alt={user.username} />
          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{user.username}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{stats.promptCount} prompts</span>
            <span>•</span>
            <span>{stats.followerCount} followers</span>
          </div>
        </div>
        {showFollowButton && session?.user?.id !== user._id && (
          <Button size="sm" variant={isFollowing ? "outline" : "default"} onClick={handleFollow} disabled={loading}>
            {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image || "/placeholder.svg"} alt={user.username} />
            <AvatarFallback className="text-xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg truncate">{user.username}</h3>
              {user.role === "admin" && <Badge variant="secondary">Admin</Badge>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="font-bold">{stats.promptCount}</span>
                </div>
                <div className="text-xs text-gray-500">Prompts</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="font-bold">{stats.followerCount}</span>
                </div>
                <div className="text-xs text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="font-bold">{stats.followingCount}</span>
                </div>
                <div className="text-xs text-gray-500">Following</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                  <Heart className="w-4 h-4" />
                  <span className="font-bold">{stats.totalLikes}</span>
                </div>
                <div className="text-xs text-gray-500">Likes</div>
              </div>
            </div>

            {showFollowButton && session?.user?.id !== user._id && (
              <Button
                onClick={handleFollow}
                disabled={loading}
                variant={isFollowing ? "outline" : "default"}
                className="w-full"
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
