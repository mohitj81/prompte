"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import PromptCard from "@/components/prompt-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Bookmark } from "lucide-react"
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

export default function SavedPromptsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchSavedPrompts = useCallback(async () => {
    if (status !== "authenticated") return

    setLoading(true)
    try {
      const res = await fetch("/api/prompt/saved")
      if (!res.ok) {
        throw new Error("Failed to fetch saved prompts")
      }
      const data = await res.json()
      setSavedPrompts(data.map((item: any) => item.prompt)) // Extract the actual prompt object
    } catch (error) {
      console.error("Error fetching saved prompts:", error)
      toast({
        title: "Error",
        description: "Failed to load your saved prompts.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [status, toast])

  useEffect(() => {
    fetchSavedPrompts()
  }, [fetchSavedPrompts])

  const handleLike = async (promptId: string) => {
    try {
      const res = await fetch(`/api/prompt/${promptId}/like`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error("Failed to like/unlike prompt")
      }
      const data = await res.json()
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
      if (!data.isSaved) {
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

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <span className="sr-only">Loading saved prompts...</span>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/signin")
    return null
  }

  return (
    <section className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-blue-600" /> Saved Prompts
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300">Your collection of favorite prompts.</p>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </section>
  )
}
