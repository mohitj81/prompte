"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shuffle, Heart, Copy, RefreshCw, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface RandomPrompt {
  _id: string
  title: string
  prompt: string
  tags: string[]
  category: string
  creator: {
    _id: string
    username: string
    image: string
  }
  likes: string[]
  createdAt: string
}

interface PromptRouletteProps {
  filters?: {
    category?: string
    trending?: boolean
    creative?: boolean
  }
}

export default function PromptRoulette({ filters = {} }: PromptRouletteProps) {
  const [currentPrompt, setCurrentPrompt] = useState<RandomPrompt | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinCount, setSpinCount] = useState(0)
  const { toast } = useToast()

  const spinRoulette = async () => {
    setIsSpinning(true)
    setSpinCount((prev) => prev + 1)

    try {
      const queryParams = new URLSearchParams()
      if (filters.category) queryParams.append("category", filters.category)
      if (filters.trending) queryParams.append("trending", "true")
      if (filters.creative) queryParams.append("creative", "true")

      const response = await fetch(`/api/prompt/random?${queryParams}`)
      if (response.ok) {
        const data = await response.json()

        // Add dramatic pause for effect
        setTimeout(() => {
          setCurrentPrompt(data)
          setIsSpinning(false)
          toast({
            title: "🎰 New prompt discovered!",
            description: "Found something interesting for you",
          })
        }, 1500)
      }
    } catch (error) {
      console.error("Error fetching random prompt:", error)
      setIsSpinning(false)
      toast({
        title: "Error",
        description: "Failed to fetch random prompt",
        variant: "destructive",
      })
    }
  }

  const copyPrompt = async () => {
    if (!currentPrompt) return

    try {
      await navigator.clipboard.writeText(currentPrompt.prompt)
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

  return (
    <div className="space-y-6">
      {/* Roulette Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            <div className={`${isSpinning ? "animate-spin" : ""} transition-transform duration-1500`}>🎰</div>
            Prompt Roulette
          </CardTitle>
          <p className="text-purple-100">Discover amazing prompts with a spin of luck!</p>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={spinRoulette}
            disabled={isSpinning}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8"
          >
            {isSpinning ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Spinning...
              </>
            ) : (
              <>
                <Shuffle className="w-5 h-5 mr-2" />🔀 Spin the Wheel
              </>
            )}
          </Button>

          {spinCount > 0 && (
            <p className="mt-3 text-purple-100 text-sm">Spins: {spinCount} | Keep spinning for more discoveries!</p>
          )}
        </CardContent>
      </Card>

      {/* Active Filters */}
      {(filters.category || filters.trending || filters.creative) && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Active filters:</span>
              {filters.category && <Badge variant="secondary">📂 {filters.category}</Badge>}
              {filters.trending && <Badge variant="secondary">📈 Trending</Badge>}
              {filters.creative && <Badge variant="secondary">🎨 Creative</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Prompt Display */}
      {currentPrompt && (
        <Card
          className={`border-0 shadow-xl transition-all duration-500 ${
            isSpinning ? "opacity-50 scale-95" : "opacity-100 scale-100"
          } bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900`}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={currentPrompt.creator.image || "/placeholder.svg"} />
                  <AvatarFallback>{currentPrompt.creator.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{currentPrompt.creator.username}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(currentPrompt.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {currentPrompt.category}
                </Badge>
                <div className="flex items-center gap-1 text-gray-500">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{currentPrompt.likes.length}</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-3">{currentPrompt.title}</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentPrompt.prompt}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {currentPrompt.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={copyPrompt} variant="outline" className="flex-1 bg-transparent">
                <Copy className="w-4 h-4 mr-2" />
                Copy Prompt
              </Button>
              <Button onClick={spinRoulette} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Spin Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* First Time Message */}
      {!currentPrompt && !isSpinning && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🎲</div>
            <h3 className="text-xl font-semibold mb-2">Ready to discover?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Click the spin button to discover a random prompt from our community!
            </p>
            <Button onClick={spinRoulette} size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Sparkles className="w-5 h-5 mr-2" />
              Start Discovering
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
