"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import PromptCard from "@/components/prompt-card"
import AdvancedFilters from "@/components/advanced-filters"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"

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

export default function ExplorePage() {
  const { data: session } = useSession()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
    isTemplate: false,
    sortBy: "latest",
  })
  const { toast } = useToast()

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const fetchPrompts = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (debouncedSearchTerm) queryParams.append("q", debouncedSearchTerm)
      if (filters.category) queryParams.append("category", filters.category)
      if (filters.difficulty) queryParams.append("difficulty", filters.difficulty)
      if (filters.isTemplate) queryParams.append("isTemplate", "true")
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy)

      const res = await fetch(`/api/prompt?${queryParams.toString()}`)
      if (!res.ok) {
        throw new Error("Failed to fetch prompts")
      }
      const data = await res.json()
      setPrompts(data)
    } catch (error) {
      console.error("Error fetching prompts:", error)
      toast({
        title: "Error",
        description: "Failed to load prompts.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, filters, toast])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  const handleLike = async (promptId: string) => {
    try {
      const res = await fetch(`/api/prompt/${promptId}/like`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error("Failed to like/unlike prompt")
      }
      const data = await res.json()
      setPrompts((prev) =>
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

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 animate-fade-in-up">
        Explore Prompts
      </h1>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search prompts by title, content, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-full"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <AdvancedFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <span className="sr-only">Loading prompts...</span>
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-400 py-12">
          <p className="text-lg font-medium mb-2">No prompts found.</p>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt._id}
              prompt={prompt}
              onLike={() => handleLike(prompt._id)}
              onSave={() => handleSave(prompt._id)}
              currentUserId={session?.user?.id}
            />
          ))}
        </div>
      )}
    </section>
  )
}
