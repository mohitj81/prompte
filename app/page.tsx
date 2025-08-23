"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import PromptCard from "@/components/prompt-card"
import { Loader2, Users, Lightbulb, MessageSquare, Heart, Eye, Tag } from "lucide-react"
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
  commentCount?: number
  isTemplate?: boolean
}

interface Category {
  _id: string
  count: number
}

interface Stats {
  totalUsers: number
  totalPrompts: number
  totalComments: number
  totalLikes: number
  totalViews: number
  totalCategories: number
}

export default function HomePage() {
  const { data: session } = useSession()
  const [featuredPrompts, setFeaturedPrompts] = useState<Prompt[]>([])
  const [popularCategories, setPopularCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingPrompts, setLoadingPrompts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const { toast } = useToast()

  const fetchFeaturedPrompts = useCallback(async () => {
    setLoadingPrompts(true)
    try {
      const res = await fetch("/api/prompt/featured")
      if (!res.ok) {
        throw new Error("Failed to fetch featured prompts")
      }
      const data = await res.json()
      setFeaturedPrompts(data)
    } catch (error) {
      console.error("Error fetching featured prompts:", error)
      toast({
        title: "Error",
        description: "Failed to load featured prompts.",
        variant: "destructive",
      })
    } finally {
      setLoadingPrompts(false)
    }
  }, [toast])

  const fetchPopularCategories = useCallback(async () => {
    setLoadingCategories(true)
    try {
      const res = await fetch("/api/categories/popular")
      if (!res.ok) {
        throw new Error("Failed to fetch popular categories")
      }
      const data = await res.json()
      setPopularCategories(data)
    } catch (error) {
      console.error("Error fetching popular categories:", error)
      toast({
        title: "Error",
        description: "Failed to load popular categories.",
        variant: "destructive",
      })
    } finally {
      setLoadingCategories(false)
    }
  }, [toast])

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const res = await fetch("/api/stats/dashboard")
      if (!res.ok) {
        throw new Error("Failed to fetch stats")
      }
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast({
        title: "Error",
        description: "Failed to load platform statistics.",
        variant: "destructive",
      })
    } finally {
      setLoadingStats(false)
    }
  }, [toast])

  useEffect(() => {
    fetchFeaturedPrompts()
    fetchPopularCategories()
    fetchStats()
  }, [fetchFeaturedPrompts, fetchPopularCategories, fetchStats])

  const handleLike = async (promptId: string) => {
    try {
      const res = await fetch(`/api/prompt/${promptId}/like`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error("Failed to like/unlike prompt")
      }
      const data = await res.json()
      setFeaturedPrompts((prev) =>
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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Hero Background"
            layout="fill"
            objectFit="cover"
            quality={100}
            className="opacity-30 dark:opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight animate-fade-in-up bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-400 dark:to-purple-500">
            Unlock Your AI's Full Potential
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10 animate-fade-in-up delay-100">
            Discover, share, and collaborate on the best AI prompts. Craft perfect outputs with our powerful tools.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up delay-200">
            <Button
              asChild
              className="px-8 py-3 text-lg rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              <Link href="/explore">Explore Prompts</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="px-8 py-3 text-lg rounded-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 bg-transparent"
            >
              <Link href="/create">Create Your Own</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Platform Statistics Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 animate-fade-in-up">
          Our Growing Community
        </h2>
        {loadingStats ? (
          <div className="flex items-center justify-center min-h-[150px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="sr-only">Loading stats...</span>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in">
              <Users className="w-10 h-10 text-blue-500 mb-3" />
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
            </Card>
            <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in delay-100">
              <Lightbulb className="w-10 h-10 text-purple-500 mb-3" />
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPrompts.toLocaleString()}+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Prompts Shared</p>
            </Card>
            <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in delay-200">
              <Tag className="w-10 h-10 text-green-500 mb-3" />
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalCategories.toLocaleString()}+
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
            </Card>
            <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in delay-300">
              <Heart className="w-10 h-10 text-red-500 mb-3" />
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalLikes.toLocaleString()}+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Likes</p>
            </Card>
            <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in delay-400">
              <Eye className="w-10 h-10 text-yellow-500 mb-3" />
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
            </Card>
            <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in delay-500">
              <MessageSquare className="w-10 h-10 text-teal-500 mb-3" />
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalComments.toLocaleString()}+
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Comments</p>
            </Card>
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400 py-8">
            <p>Failed to load statistics. Please try again later.</p>
          </div>
        )}
      </section>

      {/* Featured Prompts Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 animate-fade-in-up">
          Featured Prompts
        </h2>
        {loadingPrompts ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <span className="sr-only">Loading featured prompts...</span>
          </div>
        ) : featuredPrompts.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 py-12">
            <p className="text-lg font-medium mb-2">No featured prompts available yet.</p>
            <p>Check back soon for inspiring AI prompts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPrompts.map((prompt, index) => (
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
        <div className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            className="px-8 py-3 text-lg rounded-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 bg-transparent"
          >
            <Link href="/explore">View All Prompts</Link>
          </Button>
        </div>
      </section>

      {/* Category Explorer Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 animate-fade-in-up">
          Explore by Category
        </h2>
        {loadingCategories ? (
          <div className="flex items-center justify-center min-h-[150px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="sr-only">Loading categories...</span>
          </div>
        ) : popularCategories.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 py-8">
            <p className="text-lg font-medium mb-2">No categories found.</p>
            <p>Start creating prompts to populate categories!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularCategories.map((category, index) => (
              <Link key={category._id} href={`/explore?category=${category._id}`} className="block">
                <Card
                  className="flex flex-col items-center justify-center p-4 text-center shadow-md border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-3">
                    {/* Placeholder icon based on category, or a generic one */}
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">{category._id}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{category.count} Prompts</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-900 dark:to-purple-950 py-20 md:py-28 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 animate-fade-in-up">
            Ready to Create Your Next Masterpiece?
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 opacity-90 animate-fade-in-up delay-100">
            Join PromptBook today and start sharing, discovering, and refining the best AI prompts.
          </p>
          <Button
            asChild
            className="px-10 py-4 text-xl rounded-full bg-white text-blue-700 hover:bg-gray-100 shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 animate-fade-in-up delay-200"
          >
            <Link href="/signin">Get Started - It's Free!</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
