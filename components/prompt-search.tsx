"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X, Hash, TrendingUp, Clock, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchResult {
  _id: string
  title: string
  prompt: string
  tags: string[]
  category: string
  creator: {
    username: string
    image: string
  }
  likes: number
  createdAt: string
}

interface SearchProps {
  className?: string
  onClose?: () => void
  autoFocus?: boolean
}

export default function PromptSearch({ className = "", onClose, autoFocus = false }: SearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [popularTags, setPopularTags] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const debouncedQuery = useDebounce(query, 300)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      searchPrompts(debouncedQuery)
    } else {
      setResults([])
    }
  }, [debouncedQuery])

  useEffect(() => {
    if (isOpen && popularTags.length === 0) {
      fetchPopularTags()
    }

    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [isOpen])

  const searchPrompts = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/prompt/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.prompts || [])
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPopularTags = async () => {
    try {
      const response = await fetch("/api/tags/popular")
      if (response.ok) {
        const data = await response.json()
        setPopularTags(data.tags || [])
      }
    } catch (error) {
      console.error("Error fetching popular tags:", error)
    }
  }

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Save to recent searches
      const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem("recentSearches", JSON.stringify(updated))

      // Navigate to explore with search
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`)
      setIsOpen(false)
      onClose?.()
    }
  }

  const handleTagClick = (tag: string) => {
    setQuery(tag)
    handleSearch(tag)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recentSearches")
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          placeholder="Search prompts, tags, or creators..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(query)
            }
            if (e.key === "Escape") {
              setIsOpen(false)
              onClose?.()
            }
          }}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setQuery("")}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 border-0 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {/* Search Results */}
            {query.length > 2 && (
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search Results {isLoading && <span className="text-xs">(searching...)</span>}
                  </h4>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {results.length > 0
                    ? results.map((result) => (
                        <div
                          key={result._id}
                          className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                          onClick={() => router.push(`/prompt/${result._id}`)}
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={result.creator.image || "/placeholder.svg"}
                              alt={result.creator.username}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 dark:text-white truncate">{result.title}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{result.prompt}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {result.category}
                                </Badge>
                                <span className="text-xs text-gray-500">{result.likes} likes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    : !isLoading && (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No results found for "{query}"
                        </div>
                      )}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && query.length <= 2 && (
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Searches
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Clear
                  </Button>
                </div>
                <div className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        onClick={() => handleSearch(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Popular Tags */}
            {popularTags.length > 0 && query.length <= 2 && (
              <div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trending Tags
                  </h4>
                </div>
                <div className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
                        onClick={() => handleTagClick(tag)}
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Press Enter to search • ESC to close</span>
                <Button variant="ghost" size="sm" onClick={() => router.push("/explore")} className="text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  Advanced Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false)
            onClose?.()
          }}
        />
      )}
    </div>
  )
}
