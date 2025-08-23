"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PromptCard from "@/components/prompt-card"
import CollectionCard from "@/components/collection-card"
import { Loader2, Plus, Settings, Lightbulb, Users, MessageSquare, Heart, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Prompt {
  _id: string
  title: string
  prompt: string
  tags: string[]
  creator: {
    _id: string
    username: string
    email: string
    image: string
  }
  likes: string[]
  createdAt: string
  sampleResult?: string
  sampleOutputImage?: string
  category?: string
  difficulty?: string
  commentCount?: number
  isTemplate?: boolean
}

interface Collection {
  _id: string
  name: string
  description: string
  isPublic: boolean
  creator: {
    _id: string
    username: string
    image: string
  }
  prompts: Prompt[]
  createdAt: string
}

interface UserStats {
  promptCount: number
  commentCount: number
  followersCount: number
  followingCount: number
  totalLikesReceived: number
  totalViewsReceived: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([])
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([])
  const [userCollections, setUserCollections] = useState<Collection[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loadingPrompts, setLoadingPrompts] = useState(true)
  const [loadingSaved, setLoadingSaved] = useState(true)
  const [loadingCollections, setLoadingCollections] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const { toast } = useToast()

  const fetchUserPrompts = useCallback(
    async (userId: string) => {
      setLoadingPrompts(true)
      try {
        const res = await fetch(`/api/prompt/user/${userId}`)
        if (!res.ok) {
          throw new Error("Failed to fetch user prompts")
        }
        const data = await res.json()
        setUserPrompts(data)
      } catch (error) {
        console.error("Error fetching user prompts:", error)
        toast({
          title: "Error",
          description: "Failed to load your prompts.",
          variant: "destructive",
        })
      } finally {
        setLoadingPrompts(false)
      }
    },
    [toast],
  )

  const fetchSavedPrompts = useCallback(async () => {
    setLoadingSaved(true)
    try {
      const res = await fetch("/api/prompt/saved")
      if (!res.ok) {
        throw new Error("Failed to fetch saved prompts")
      }
      const data = await res.json()
      setSavedPrompts(data.map((item: any) => item.prompt)) // Extract prompt object
    } catch (error) {
      console.error("Error fetching saved prompts:", error)
      toast({
        title: "Error",
        description: "Failed to load your saved prompts.",
        variant: "destructive",
      })
    } finally {
      setLoadingSaved(false)
    }
  }, [toast])

  const fetchUserCollections = useCallback(async () => {
    setLoadingCollections(true)
    try {
      const res = await fetch("/api/collections")
      if (!res.ok) {
        throw new Error("Failed to fetch user collections")
      }
      const data = await res.json()
      setUserCollections(data)
    } catch (error) {
      console.error("Error fetching user collections:", error)
      toast({
        title: "Error",
        description: "Failed to load your collections.",
        variant: "destructive",
      })
    } finally {
      setLoadingCollections(false)
    }
  }, [toast])

  const fetchUserStats = useCallback(
    async (userId: string) => {
      setLoadingStats(true)
      try {
        const res = await fetch(`/api/user/${userId}/stats`)
        if (!res.ok) {
          throw new Error("Failed to fetch user stats")
        }
        const data = await res.json()
        setUserStats(data)
      } catch (error) {
        console.error("Error fetching user stats:", error)
        toast({
          title: "Error",
          description: "Failed to load user statistics.",
          variant: "destructive",
        })
      } finally {
        setLoadingStats(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchUserPrompts(session.user.id)
      fetchSavedPrompts()
      fetchUserCollections()
      fetchUserStats(session.user.id)
    } else if (status === "unauthenticated") {
      router.push("/signin")
    }
  }, [status, session, router, fetchUserPrompts, fetchSavedPrompts, fetchUserCollections, fetchUserStats])

  const handleLike = async (promptId: string) => {
    try {
      const res = await fetch(`/api/prompt/${promptId}/like`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error("Failed to like/unlike prompt")
      }
      const data = await res.json()
      setUserPrompts((prev) =>
        prev.map((p) =>
          p._id === promptId
            ? {
                ...p,
                likes: data.isLiked
                  ? [...p.likes, session?.user?.id]
                  : p.likes.filter((id) => id !== session?.user?.id),
              }
            : p,
        ),
      )
      setSavedPrompts((prev) =>
        prev.map((p) =>
          p._id === promptId
            ? {
                ...p,
                likes: data.isLiked
                  ? [...p.likes, session?.user?.id]
                  : p.likes.filter((id) => id !== session?.user?.id),
              }
            : p,
        ),
      )
      toast({
        title: data.isLiked ? "Liked!" : "Unliked!",
        description: data.isLiked ? "Prompt added to your likes." : "Prompt removed from your likes.",
      })
    } catch (error) {
      console.error("Error liking prompt:", error)
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive",
      })
    }
  }

  const handleSave = async (promptId: string) => {
    try {
      const res = await fetch(`/api/prompt/${promptId}/save`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error("Failed to save/unsave prompt")
      }
      const data = await res.json()
      if (data.isSaved) {
        // If saved, refetch saved prompts to get the new one
        fetchSavedPrompts()
      } else {
        // If unsaved, remove from current state
        setSavedPrompts((prev) => prev.filter((p) => p._id !== promptId))
      }
      toast({
        title: data.isSaved ? "Saved!" : "Unsaved!",
        description: data.isSaved ? "Prompt added to your saved list." : "Prompt removed from your saved list.",
      })
    } catch (error) {
      console.error("Error saving prompt:", error)
      toast({
        title: "Error",
        description: "Failed to update save status.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (promptId: string) => {
    router.push(`/edit/${promptId}`)
  }

  const handleDelete = async (promptId: string) => {
    if (!window.confirm("Are you sure you want to delete this prompt? This action cannot be undone.")) {
      return
    }
    try {
      const res = await fetch(`/api/prompt/${promptId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Failed to delete prompt")
      }
      setUserPrompts((prev) => prev.filter((p) => p._id !== promptId))
      toast({
        title: "Deleted!",
        description: "Prompt has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting prompt:", error)
      toast({
        title: "Error",
        description: "Failed to delete prompt.",
        variant: "destructive",
      })
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <span className="sr-only">Loading profile...</span>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null // Redirect handled by useEffect
  }

  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <div className="flex-shrink-0 relative">
          <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-blue-500 dark:border-blue-400 shadow-lg">
            <AvatarImage src={session?.user?.image || "/placeholder-user.jpg"} alt={session?.user?.name || "User"} />
            <AvatarFallback className="text-5xl font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <Button
            asChild
            variant="secondary"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full w-10 h-10 shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Link href="/settings">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
        </div>
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 animate-fade-in-up">
            {session?.user?.name || "Your Profile"}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{session?.user?.email}</p>

          {loadingStats ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : userStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
              <Card className="p-3 text-center shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <Lightbulb className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{userStats.promptCount}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Prompts</p>
              </Card>
              <Card className="p-3 text-center shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <MessageSquare className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{userStats.commentCount}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Comments</p>
              </Card>
              <Card className="p-3 text-center shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <Users className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{userStats.followersCount}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Followers</p>
              </Card>
              <Card className="p-3 text-center shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <Users className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{userStats.followingCount}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Following</p>
              </Card>
              <Card className="p-3 text-center shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{userStats.totalLikesReceived}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Likes Rec.</p>
              </Card>
              <Card className="p-3 text-center shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <Eye className="w-6 h-6 text-teal-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{userStats.totalViewsReceived}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Views Rec.</p>
              </Card>
            </div>
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-400 py-4">
              <p>Could not load user statistics.</p>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="prompts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shadow-inner">
          <TabsTrigger
            value="prompts"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            My Prompts
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Saved Prompts
          </TabsTrigger>
          <TabsTrigger
            value="collections"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Collections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="mt-6">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">My Prompts</CardTitle>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/create">
                  <Plus className="w-4 h-4 mr-2" /> Create New
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {loadingPrompts ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="sr-only">Loading prompts...</span>
                </div>
              ) : userPrompts.length === 0 ? (
                <div className="text-center text-gray-600 dark:text-gray-400 py-8">
                  <p className="text-lg font-medium mb-2">You haven't created any prompts yet.</p>
                  <p>Start sharing your AI creativity!</p>
                  <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/create">Create Your First Prompt</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPrompts.map((prompt) => (
                    <PromptCard
                      key={prompt._id}
                      prompt={prompt}
                      onLike={handleLike}
                      onSave={handleSave}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      currentUserId={session?.user?.id}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Saved Prompts</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loadingSaved ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="sr-only">Loading saved prompts...</span>
                </div>
              ) : savedPrompts.length === 0 ? (
                <div className="text-center text-gray-600 dark:text-gray-400 py-8">
                  <p className="text-lg font-medium mb-2">You haven't saved any prompts yet.</p>
                  <p>Explore and save prompts you find useful!</p>
                  <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/explore">Explore Prompts</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedPrompts.map((prompt) => (
                    <PromptCard
                      key={prompt._id}
                      prompt={prompt}
                      onLike={handleLike}
                      onSave={handleSave}
                      currentUserId={session?.user?.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className="mt-6">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">My Collections</CardTitle>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/collections/create">
                  <Plus className="w-4 h-4 mr-2" /> Create New
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {loadingCollections ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="sr-only">Loading collections...</span>
                </div>
              ) : userCollections.length === 0 ? (
                <div className="text-center text-gray-600 dark:text-gray-400 py-8">
                  <p className="text-lg font-medium mb-2">You haven't created any collections yet.</p>
                  <p>Organize your prompts into custom collections!</p>
                  <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/collections/create">Create Your First Collection</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userCollections.map((collection) => (
                    <CollectionCard key={collection._id} collection={collection} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  )
}
