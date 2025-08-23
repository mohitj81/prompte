"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Wand2, Loader2, Copy, RefreshCw, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PromptEnhancerProps {
  originalPrompt: string
  onEnhanced?: (enhancedPrompt: string) => void
}

export default function PromptEnhancer({ originalPrompt, onEnhanced }: PromptEnhancerProps) {
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [analysis, setAnalysis] = useState<{
    tone: string
    complexity: string
    intent: string
    suggestions: string[]
  } | null>(null)
  const { toast } = useToast()

  const enhancePrompt = async () => {
    setIsEnhancing(true)
    try {
      const response = await fetch("/api/prompt/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: originalPrompt }),
      })

      if (response.ok) {
        const data = await response.json()
        setEnhancedPrompt(data.enhanced)
        setAnalysis(data.analysis)
        onEnhanced?.(data.enhanced)
        toast({
          title: "✨ Prompt Enhanced!",
          description: "Your prompt has been magically improved",
        })
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error)
      toast({
        title: "Error",
        description: "Failed to enhance prompt",
        variant: "destructive",
      })
    } finally {
      setIsEnhancing(false)
    }
  }

  const copyEnhanced = async () => {
    try {
      await navigator.clipboard.writeText(enhancedPrompt)
      toast({
        title: "Copied!",
        description: "Enhanced prompt copied to clipboard",
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
      {/* Enhancement Button */}
      <div className="flex gap-3">
        <Button
          onClick={enhancePrompt}
          disabled={isEnhancing || !originalPrompt.trim()}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          {isEnhancing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
          {isEnhancing ? "Enhancing..." : "💫 Make it Better"}
        </Button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />🧠 Prompt Personality Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Badge variant="secondary" className="mb-2">
                  Tone
                </Badge>
                <p className="font-semibold text-lg">{analysis.tone}</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-2">
                  Complexity
                </Badge>
                <p className="font-semibold text-lg">{analysis.complexity}</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-2">
                  Intent
                </Badge>
                <p className="font-semibold text-lg">{analysis.intent}</p>
              </div>
            </div>

            {analysis.suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">💡 Suggestions:</h4>
                <ul className="space-y-1">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                      <Zap className="w-3 h-3 mt-1 text-yellow-500 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Prompt */}
      {enhancedPrompt && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />✨ Enhanced Prompt
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyEnhanced}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={enhancePrompt}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Re-enhance
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={enhancedPrompt}
              onChange={(e) => setEnhancedPrompt(e.target.value)}
              rows={4}
              className="bg-white/50 dark:bg-gray-800/50"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
