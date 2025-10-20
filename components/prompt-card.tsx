"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Bookmark, Copy, MoreHorizontal, Edit, Trash2, MessageCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Prompt {
  _id: string
  title: string
  prompt: string
  tags: string[]
  creator?: {  // Made optional
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

interface PromptCardProps {
  prompt: Prompt
  onLike: (promptId: string) => void
  onSave: (promptId: string) => void
  onEdit?: (promptId: string) => void
  onDelete?: (promptId: string) => void
  currentUserId?: string
  showActions?: boolean
}

export default function PromptCard({
  prompt,
  onLike,
  onSave,
  onEdit,
  onDelete,
  currentUserId,
  showActions = false,
}: PromptCardProps) {
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(currentUserId ? prompt.likes.includes(currentUserId) : false)
  const [likeCount, setLikeCount] = useState(prompt.likes.length)

  const handleLike = () => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like prompts.",
        variant: "destructive",
      })
      return
    }
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
    onLike(prompt._id)
  }

  const handleSave = () => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save prompts.",
        variant: "destructive",
      })
      return
    }
    onSave(prompt._id)
  }

  const copyToClipboard = async () => {
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

  // ✅ Safe ownership check
  const isOwner = currentUserId && prompt.creator ? currentUserId === prompt.creator._id : false

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800 animate-fade-in">
      <Link href={`/prompt/${prompt._id}`} className="block">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={prompt.creator?.image || "/placeholder-user.jpg"} alt={prompt.creator?.username || "Unknown"} />
                <AvatarFallback>{prompt.creator?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{prompt.creator?.username || "Unknown User"}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {(showActions || isOwner) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner && onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(prompt._id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {isOwner && onDelete && (
                    <DropdownMenuItem onClick={() => onDelete(prompt._id)} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Prompt
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">{prompt.title}</h3>

          {prompt.category && (
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs capitalize">
                {prompt.category}
              </Badge>
              {prompt.difficulty && (
                <Badge
                  variant="secondary"
                  className={`text-xs capitalize ${
                    prompt.difficulty === "beginner"
                      ? "bg-green-100 text-green-800"
                      : prompt.difficulty === "intermediate"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {prompt.difficulty}
                </Badge>
              )}
            </div>
          )}

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{prompt.prompt}</p>

          {prompt.sampleOutputImage && (
            <div className="mb-4 relative w-full h-32 rounded-lg overflow-hidden">
              <Image
                src={prompt.sampleOutputImage || "/placeholder.svg"}
                alt="Sample Output"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          )}

          {prompt.sampleResult && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sample Result:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{prompt.sampleResult}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {(prompt.tags || []).slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {(prompt.tags?.length || 0) > 3 && (
              <Badge variant="outline" className="text-xs">
                +{prompt.tags.length - 3} more
              </Badge>
            )}
            {prompt.isTemplate && (
              <Badge variant="default" className="text-xs">
                Template
              </Badge>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`${isLiked ? "text-red-500" : "text-gray-500"} hover:text-red-500`}
              disabled={!currentUserId}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
              {likeCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="text-gray-500 hover:text-blue-500"
              disabled={!currentUserId}
            >
              <Bookmark className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500" disabled={!currentUserId}>
              <MessageCircle className="w-4 h-4 mr-1" />
              {prompt.commentCount || 0}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
