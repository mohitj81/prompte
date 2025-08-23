"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, MessageSquare, Heart, Edit, Trash2, Reply } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Comment {
  _id: string
  text: string
  creator: {
    _id: string
    username: string
    image: string
  }
  likes: string[]
  createdAt: string
  parentComment?: string
  replies?: Comment[]
}

interface CommentSectionProps {
  promptId: string
  currentUserId?: string
}

export default function CommentSection({ promptId, currentUserId }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newCommentText, setNewCommentText] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState("")
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const { toast } = useToast()

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/prompt/${promptId}/comments`)
      if (!res.ok) {
        throw new Error("Failed to fetch comments")
      }
      const data: Comment[] = await res.json()

      // Function to build a tree structure for replies
      const buildCommentTree = (comments: Comment[], parentId: string | null = null) => {
        return comments
          .filter((comment) => (comment.parentComment || null) === parentId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map((comment) => ({
            ...comment,
            replies: buildCommentTree(comments, comment._id),
          }))
      }

      setComments(buildCommentTree(data, null))
    } catch (error) {
      console.error("Error fetching comments:", error)
      toast({
        title: "Error",
        description: "Failed to load comments.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [promptId, toast])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleAddComment = async (parentCommentId: string | null = null) => {
    const text = parentCommentId ? replyText : newCommentText
    if (!text.trim()) return

    if (!session?.user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/prompt/${promptId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, parentCommentId }),
      })

      if (!res.ok) {
        throw new Error("Failed to add comment")
      }

      toast({
        title: "Comment Added!",
        description: "Your comment has been posted.",
      })
      setNewCommentText("")
      setReplyText("")
      setReplyingToCommentId(null)
      fetchComments() // Re-fetch comments to update the list
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to post comment.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!session?.user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like comments.",
        variant: "destructive",
      })
      return
    }
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error("Failed to like/unlike comment")
      }
      const data = await res.json()
      toast({
        title: data.isLiked ? "Liked!" : "Unliked!",
        description: data.isLiked ? "Comment liked." : "Comment unliked.",
      })
      fetchComments() // Re-fetch to update like counts
    } catch (error) {
      console.error("Error liking comment:", error)
      toast({
        title: "Error",
        description: "Failed to update comment like status.",
        variant: "destructive",
      })
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editingCommentText.trim()) return
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: editingCommentText }),
      })
      if (!res.ok) {
        throw new Error("Failed to edit comment")
      }
      toast({
        title: "Comment Updated!",
        description: "Your comment has been updated.",
      })
      setEditingCommentId(null)
      setEditingCommentText("")
      fetchComments() // Re-fetch to update comment text
    } catch (error) {
      console.error("Error editing comment:", error)
      toast({
        title: "Error",
        description: "Failed to update comment.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment and all its replies?")) {
      return
    }
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Failed to delete comment")
      }
      toast({
        title: "Comment Deleted!",
        description: "Comment and its replies have been removed.",
      })
      fetchComments() // Re-fetch to remove deleted comment
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      })
    }
  }

  const renderComment = (comment: Comment) => {
    const isOwner = currentUserId === comment.creator._id
    const isLiked = currentUserId ? comment.likes.includes(currentUserId) : false

    return (
      <div key={comment._id} className="flex gap-3 py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
        <Avatar className="h-9 w-9">
          <AvatarImage src={comment.creator.image || "/placeholder-user.jpg"} alt={comment.creator.username} />
          <AvatarFallback>{comment.creator.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <Link
              href={`/profile/${comment.creator._id}`}
              className="font-semibold text-gray-900 dark:text-white hover:underline"
            >
              {comment.creator.username}
            </Link>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          {editingCommentId === comment._id ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editingCommentText}
                onChange={(e) => setEditingCommentText(e.target.value)}
                rows={3}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setEditingCommentId(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => handleEditComment(comment._id)} disabled={isSubmitting}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{comment.text}</p>
          )}

          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikeComment(comment._id)}
              className={`h-auto p-1 ${isLiked ? "text-red-500" : "hover:text-red-500"}`}
              disabled={!currentUserId}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
              {comment.likes.length}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setReplyingToCommentId(replyingToCommentId === comment._id ? null : comment._id)
                setReplyText("")
              }}
              className="h-auto p-1 hover:text-blue-500"
              disabled={!currentUserId}
            >
              <Reply className="w-4 h-4 mr-1" /> Reply
            </Button>
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingCommentId(comment._id)
                    setEditingCommentText(comment.text)
                  }}
                  className="h-auto p-1 hover:text-yellow-500"
                >
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment._id)}
                  className="h-auto p-1 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </>
            )}
          </div>

          {replyingToCommentId === comment._id && (
            <div className="mt-4 space-y-2">
              <Textarea
                placeholder={`Replying to ${comment.creator.username}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setReplyingToCommentId(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => handleAddComment(comment._id)} disabled={isSubmitting}>
                  Post Reply
                </Button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 mt-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {comment.replies.map(renderComment)}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in">
      <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" /> Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {session?.user?.id ? (
          <div className="mb-6 space-y-3">
            <Textarea
              placeholder="Write your comment here..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              rows={4}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            />
            <Button onClick={() => handleAddComment()} disabled={isSubmitting || !newCommentText.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-4 mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              <Link href="/signin" className="text-blue-600 hover:underline dark:text-blue-400">
                Sign in
              </Link>{" "}
              to leave a comment.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[150px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="sr-only">Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 py-8">
            <p className="text-lg font-medium mb-2">No comments yet.</p>
            <p>Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">{comments.map(renderComment)}</div>
        )}
      </CardContent>
    </Card>
  )
}
