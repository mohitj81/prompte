"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Copy, Loader2, Sparkles, Wand2, Palette, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RemixOptions {
  subject?: string
  tone?: string
  style?: string
  format?: string
  constraints?: string
}

interface PromptRemixToolProps {
  originalPrompt: string
}

export default function PromptRemixTool({ originalPrompt }: PromptRemixToolProps) {
  const [prompt, setPrompt] = useState(originalPrompt)
  const [remixedPrompt, setRemixedPrompt] = useState("")
  const [isRemixing, setIsRemixing] = useState(false)
  const [remixOptions, setRemixOptions] = useState<RemixOptions>({})
  const [remixHistory, setRemixHistory] = useState<string[]>([])
  const { toast } = useToast()

  const quickRemixOptions = [
    { label: "Make it Creative", options: { tone: "creative", style: "imaginative" } },
    { label: "Make it Professional", options: { tone: "professional", style: "formal" } },
    { label: "Make it Casual", options: { tone: "casual", style: "conversational" } },
    { label: "Make it Technical", options: { tone: "technical", style: "detailed" } },
  ]

  const remixPrompt = async (options: RemixOptions = {}) => {
    setIsRemixing(true)
    try {
      const response = await fetch("/api/prompt/remix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          options: { ...remixOptions, ...options },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setRemixedPrompt(data.remixed)
        setRemixHistory((prev) => [data.remixed, ...prev.slice(0, 4)])
        toast({
          title: "🧩 Prompt Remixed!",
          description: "Your prompt has been successfully transformed",
        })
      }
    } catch (error) {
      console.error("Error remixing prompt:", error)
      toast({
        title: "Error",
        description: "Failed to remix prompt",
        variant: "destructive",
      })
    } finally {
      setIsRemixing(false)
    }
  }

  const copyRemixed = async () => {
    try {
      await navigator.clipboard.writeText(remixedPrompt)
      toast({
        title: "Copied!",
        description: "Remixed prompt copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      })
    }
  }

  const useHistoryItem = (historyPrompt: string) => {
    setRemixedPrompt(historyPrompt)
    setPrompt(historyPrompt)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-700/50 mb-6">
          <RefreshCw className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
          <span className="text-purple-800 dark:text-purple-200 font-semibold">Prompt Remix Studio</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Transform Your Prompts</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Change the tone, style, subject, or format of any prompt to match your exact needs
        </p>
      </div>

      {/* Original Prompt */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Original Prompt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700"
            placeholder="Enter your prompt to remix..."
          />
        </CardContent>
      </Card>

      {/* Quick Remix Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickRemixOptions.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => remixPrompt(option.options)}
            disabled={isRemixing || !prompt?.trim()}
            className="h-auto p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-300"
          >
            <div className="text-center">
              <div className="text-sm font-semibold">{option.label}</div>
            </div>
          </Button>
        ))}
      </div>

      {/* Advanced Options */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            Advanced Remix Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Change Subject</label>
              <Input
                placeholder="e.g., cats → dogs, marketing → education"
                value={remixOptions.subject || ""}
                onChange={(e) => setRemixOptions({ ...remixOptions, subject: e.target.value })}
                className="bg-white/70 dark:bg-gray-800/70"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Change Tone</label>
              <Select
                value={remixOptions.tone || ""}
                onValueChange={(value) => setRemixOptions({ ...remixOptions, tone: value })}
              >
                <SelectTrigger className="bg-white/70 dark:bg-gray-800/70">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="serious">Serious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Change Style</label>
              <Select
                value={remixOptions.style || ""}
                onValueChange={(value) => setRemixOptions({ ...remixOptions, style: value })}
              >
                <SelectTrigger className="bg-white/70 dark:bg-gray-800/70">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="imaginative">Imaginative</SelectItem>
                  <SelectItem value="analytical">Analytical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Output Format</label>
              <Select
                value={remixOptions.format || ""}
                onValueChange={(value) => setRemixOptions({ ...remixOptions, format: value })}
              >
                <SelectTrigger className="bg-white/70 dark:bg-gray-800/70">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paragraph">Paragraph</SelectItem>
                  <SelectItem value="bullet-points">Bullet Points</SelectItem>
                  <SelectItem value="numbered-list">Numbered List</SelectItem>
                  <SelectItem value="step-by-step">Step by Step</SelectItem>
                  <SelectItem value="dialogue">Dialogue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Additional Constraints</label>
            <Input
              placeholder="e.g., keep it under 100 words, include examples, avoid technical jargon"
              value={remixOptions.constraints || ""}
              onChange={(e) => setRemixOptions({ ...remixOptions, constraints: e.target.value })}
              className="bg-white/70 dark:bg-gray-800/70"
            />
          </div>

          <Button
            onClick={() => remixPrompt()}
            disabled={isRemixing || !prompt?.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isRemixing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Remixing...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Remix Prompt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Remixed Result */}
      {remixedPrompt && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <Sparkles className="w-5 h-5" />
                Remixed Prompt
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyRemixed} className="bg-white/70 dark:bg-gray-800/70">
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPrompt(remixedPrompt)}
                  className="bg-white/70 dark:bg-gray-800/70"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Use as Base
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
              <Textarea
                value={remixedPrompt}
                onChange={(e) => setRemixedPrompt(e.target.value)}
                rows={4}
                className="border-0 bg-transparent resize-none focus:ring-0"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remix History */}
      {remixHistory.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Remix History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {remixHistory.map((historyItem, index) => (
                <div
                  key={index}
                  className="p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-blue-200/50 dark:border-blue-700/50 cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => setPrompt(historyItem)}
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{historyItem}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Version {remixHistory.length - index}
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-xs">
                      Use This
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
