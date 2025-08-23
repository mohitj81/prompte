"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { GitCompare, ArrowLeftRight, Copy, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PromptDiffTool() {
  const [promptA, setPromptA] = useState("")
  const [promptB, setPromptB] = useState("")
  const [diffResult, setDiffResult] = useState<{
    similarity: number
    additions: string[]
    deletions: string[]
    changes: string[]
    wordCount: { a: number; b: number }
    charCount: { a: number; b: number }
  } | null>(null)
  const { toast } = useToast()

  const calculateDiff = () => {
    if (!promptA.trim() || !promptB.trim()) {
      toast({
        title: "Error",
        description: "Please enter both prompts to compare",
        variant: "destructive",
      })
      return
    }

    const wordsA = promptA.toLowerCase().split(/\s+/)
    const wordsB = promptB.toLowerCase().split(/\s+/)

    const setA = new Set(wordsA)
    const setB = new Set(wordsB)

    const additions = Array.from(setB).filter((word) => !setA.has(word))
    const deletions = Array.from(setA).filter((word) => !setB.has(word))
    const common = Array.from(setA).filter((word) => setB.has(word))

    const similarity = Math.round((common.length / Math.max(setA.size, setB.size)) * 100)

    setDiffResult({
      similarity,
      additions,
      deletions,
      changes: [...additions, ...deletions],
      wordCount: { a: wordsA.length, b: wordsB.length },
      charCount: { a: promptA.length, b: promptB.length },
    })

    toast({
      title: "🔍 Diff Analysis Complete",
      description: `Similarity: ${similarity}%`,
    })
  }

  const swapPrompts = () => {
    const temp = promptA
    setPromptA(promptB)
    setPromptB(temp)
  }

  const copyDiffSummary = async () => {
    if (!diffResult) return

    const summary = `Prompt Comparison Summary:
Similarity: ${diffResult.similarity}%
Word Count: ${diffResult.wordCount.a} → ${diffResult.wordCount.b}
Character Count: ${diffResult.charCount.a} → ${diffResult.charCount.b}
Additions: ${diffResult.additions.join(", ")}
Deletions: ${diffResult.deletions.join(", ")}`

    try {
      await navigator.clipboard.writeText(summary)
      toast({
        title: "Copied!",
        description: "Diff summary copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy summary",
        variant: "destructive",
      })
    }
  }

  const highlightDifferences = (text: string, isPromptA: boolean) => {
    if (!diffResult) return text

    const words = text.split(/(\s+)/)
    return words.map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, "")
      if (!cleanWord) return word

      if (isPromptA && diffResult.deletions.includes(cleanWord)) {
        return (
          <span key={index} className="bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200 px-1 rounded">
            {word}
          </span>
        )
      } else if (!isPromptA && diffResult.additions.includes(cleanWord)) {
        return (
          <span
            key={index}
            className="bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-1 rounded"
          >
            {word}
          </span>
        )
      }
      return word
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/50 dark:border-emerald-700/50 mb-6">
          <GitCompare className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
          <span className="text-emerald-800 dark:text-emerald-200 font-semibold">Visual Diff Analyzer</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Compare Prompts Side-by-Side</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Analyze differences between two prompts with detailed statistics and visual highlighting
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-900/10 dark:to-orange-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              Prompt A (Original)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={promptA}
              onChange={(e) => setPromptA(e.target.value)}
              rows={6}
              className="bg-white/70 dark:bg-gray-800/70 border-red-200 dark:border-red-700 focus:ring-red-500"
              placeholder="Enter your first prompt here..."
            />
            {promptA && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {promptA.split(" ").length} words • {promptA.length} characters
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              Prompt B (Modified)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={promptB}
              onChange={(e) => setPromptB(e.target.value)}
              rows={6}
              className="bg-white/70 dark:bg-gray-800/70 border-green-200 dark:border-green-700 focus:ring-green-500"
              placeholder="Enter your second prompt here..."
            />
            {promptB && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {promptB.split(" ").length} words • {promptB.length} characters
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={calculateDiff}
          disabled={!promptA.trim() || !promptB.trim()}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
        >
          <GitCompare className="w-4 h-4 mr-2" />
          Compare Prompts
        </Button>

        <Button
          variant="outline"
          onClick={swapPrompts}
          disabled={!promptA.trim() && !promptB.trim()}
          className="bg-white/70 dark:bg-gray-800/70"
        >
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          Swap
        </Button>
      </div>

      {/* Results */}
      {diffResult && (
        <>
          {/* Statistics */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Comparison Statistics
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyDiffSummary}
                  className="bg-white/70 dark:bg-gray-800/70"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Summary
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {diffResult.similarity}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Similarity</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {diffResult.additions.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Additions</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                    {diffResult.deletions.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Deletions</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {Math.abs(diffResult.wordCount.b - diffResult.wordCount.a)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Word Diff</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Similarity Score</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{diffResult.similarity}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${diffResult.similarity}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual Diff */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50/30 to-orange-50/30 dark:from-red-900/10 dark:to-orange-900/10">
              <CardHeader>
                <CardTitle className="text-red-800 dark:text-red-200">Prompt A (with deletions highlighted)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-red-200/50 dark:border-red-700/50 min-h-[120px]">
                  <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {highlightDifferences(promptA, true)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-900/10 dark:to-emerald-900/10">
              <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-200">
                  Prompt B (with additions highlighted)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-green-200/50 dark:border-green-700/50 min-h-[120px]">
                  <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {highlightDifferences(promptB, false)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Changes Summary */}
          {(diffResult.additions.length > 0 || diffResult.deletions.length > 0) && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
              <CardHeader>
                <CardTitle>Changes Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {diffResult.additions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      Added Words ({diffResult.additions.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {diffResult.additions.map((word, index) => (
                        <Badge
                          key={index}
                          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        >
                          +{word}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {diffResult.deletions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                      Removed Words ({diffResult.deletions.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {diffResult.deletions.map((word, index) => (
                        <Badge key={index} className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          -{word}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
