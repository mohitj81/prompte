"use client"

import { Suspense, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Bookmark, Copy, MessageCircle, Eye, Share2, Download, Edit, Trash2, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import CommentSection from "@/components/comment-section"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

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
  views: number
  commentCount?: number
  isTemplate?: boolean
  templateVariables?: { name: string; description: string; placeholder: string; required: boolean }[]
}

export default function PromptDetailPage() {
  const params = useParams()
  const promptId = params.id as string
  const { data: session, status } = useSession()
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPrompt = async () => {
      if (!promptId) return

      setLoading(true)
      try {
        const res = await fetch(`/api/prompt/${promptId}`)
        if (!res.ok) {
          if (res.status === 404) {
            notFound()
          }
          throw new Error(`Failed to fetch prompt: ${res.statusText}`)
        }
        const data = await res.json()
        setPrompt(data.prompt)
        setLikeCount(data.prompt.likes.length)
        if (session?.user?.id) {
          setIsLiked(data.prompt.likes.includes(session.user.id))
        }
      } catch (error) {
        console.error("Error fetching prompt:", error)
        toast({
          title: "Error",
          description: "Failed to load prompt details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPrompt()
  }, [promptId, session?.user?.id, toast])

  const handleLike = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like prompts.",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch(`/api/prompt/${promptId}/like`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error("Failed to like/unlike prompt")
      }
      const data = await res.json()
      setIsLiked(data.isLiked)
      setLikeCount(data.likes)
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

  const handleSave = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save prompts.",
        variant: "destructive",
      })
      return
    }
    try {
      const res = await fetch(`/api/prompt/${promptId}/save`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error("Failed to save/unsave prompt")
      }
      const data = await res.json()
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

  const handleDelete = async () => {
    if (!session?.user?.id || !prompt || prompt.creator._id !== session.user.id) {
      toast({
        title: "Unauthorized",
        description: "You do not have permission to delete this prompt.",
        variant: "destructive",
      })
      return
    }
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
      toast({
        title: "Deleted!",
        description: "Prompt has been deleted successfully.",
      })
      // Redirect to profile or explore page after deletion
      window.location.href = "/profile"
    } catch (error) {
      console.error("Error deleting prompt:", error)
      toast({
        title: "Error",
        description: "Failed to delete prompt.",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = async () => {
    if (!prompt) return
    try {
      await navigator.clipboard.writeText(prompt.prompt)
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      })
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <span className="sr-only">Loading prompt...</span>
      </div>
    )
  }

  if (!prompt) {
    notFound() // This should be caught by the fetchPrompt error handling, but as a fallback
  }

  const currentUserId = session?.user?.id
  const isOwner = currentUserId === prompt.creator._id

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in">
        <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 border-2 border-blue-400">
                <AvatarImage src={prompt.creator.image || "/placeholder-user.jpg"} alt={prompt.creator.username} />
                <AvatarFallback>{prompt.creator.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/profile/${prompt.creator._id}`}
                  className="font-semibold text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {prompt.creator.username}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/edit/${prompt._id}`}>
                            <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Prompt</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleDelete}>
                          <Trash2 className="w-5 h-5 text-red-600 hover:text-red-700" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Prompt</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                      <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy Prompt</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">{prompt.title}</h1>
          <div className="flex flex-wrap gap-2">
            {prompt.category && (
              <Badge
                variant="outline"
                className="text-sm capitalize bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {prompt.category}
              </Badge>
            )}
            {prompt.difficulty && (
              <Badge
                variant="secondary"
                className={`text-sm capitalize ${
                  prompt.difficulty === "beginner"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : prompt.difficulty === "intermediate"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {prompt.difficulty}
              </Badge>
            )}
            {prompt.isTemplate && (
              <Badge
                variant="default"
                className="text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
              >
                Template
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">The Prompt</h2>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{prompt.prompt}</p>
            </div>
          </div>

          {prompt.sampleResult && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Sample Output</h2>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{prompt.sampleResult}</p>
              </div>
            </div>
          )}

          {prompt.sampleOutputImage && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Sample Output Image</h2>
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <Image
                  src={prompt.sampleOutputImage || "/placeholder.svg"}
                  alt="Sample Output"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            </div>
          )}

          {prompt.templateVariables && prompt.templateVariables.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Template Variables</h2>
              <div className="space-y-3">
                {prompt.templateVariables.map((variable, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {variable.name}{" "}
                      {variable.required && (
                        <Badge variant="destructive" className="ml-2">
                          Required
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{variable.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Placeholder: {variable.placeholder}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`${isLiked ? "text-red-500" : "text-gray-500"} hover:text-red-500`}
              disabled={!currentUserId}
            >
              <Heart className={`w-5 h-5 mr-1 ${isLiked ? "fill-current" : ""}`} />
              {likeCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="text-gray-500 hover:text-blue-500"
              disabled={!currentUserId}
            >
              <Bookmark className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
              <MessageCircle className="w-5 h-5 mr-1" />
              {prompt.commentCount || 0}
            </Button>

            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <Eye className="w-5 h-5 mr-1" />
              {prompt.views}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white/70 dark:bg-gray-800/70">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Use Prompt
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-12">
        <Suspense
          fallback={
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" /> Loading comments...
            </div>
          }
        >
          <CommentSection promptId={prompt._id} currentUserId={currentUserId} />
        </Suspense>
      </div>
    </div>
  )
}
