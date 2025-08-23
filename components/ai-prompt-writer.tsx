"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Loader2, Sparkles, ChevronRight, ChevronLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Copy } from "lucide-react" // Import Copy component

export default function AiPromptWriter() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    topic: "",
    purpose: "",
    audience: "",
    tone: "neutral",
    style: "informative",
    keywords: "",
    length: "medium",
    creativity: 5,
    specificity: 5,
  })
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSliderChange = (id: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [id]: value[0] }))
  }

  const generatePrompt = async () => {
    setIsGenerating(true)
    setGeneratedPrompt("")
    try {
      const res = await fetch("/api/prompt/ai-writer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          keywords: formData.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to generate prompt.")
      }

      const data = await res.json()
      setGeneratedPrompt(data.generatedPrompt)
      setStep(4) // Move to review step
      toast({
        title: "Prompt Generated!",
        description: "Your AI-assisted prompt is ready for review.",
      })
    } catch (error: any) {
      console.error("Error generating prompt:", error)
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic / Subject *</Label>
              <Input
                id="topic"
                placeholder="e.g., 'Healthy breakfast recipes', 'Quantum computing basics'"
                value={formData.topic}
                onChange={handleInputChange}
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">What is the main subject of your prompt?</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose / Goal *</Label>
              <Textarea
                id="purpose"
                placeholder="e.g., 'Generate a list of ideas', 'Explain a complex concept simply'"
                value={formData.purpose}
                onChange={handleInputChange}
                rows={3}
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">What do you want the AI to achieve?</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., 'Beginner programmers', 'Marketing professionals'"
                value={formData.audience}
                onChange={handleInputChange}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Who is the intended recipient of the AI's output?
              </p>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tone">Desired Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => handleSelectChange("tone", value)}>
                <SelectTrigger id="tone">
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="informal">Informal</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                  <SelectItem value="empathetic">Empathetic</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 dark:text-gray-400">How should the AI's response sound?</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="style">Writing Style</Label>
              <Select value={formData.style} onValueChange={(value) => handleSelectChange("style", value)}>
                <SelectTrigger id="style">
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="informative">Informative</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="analytical">Analytical</SelectItem>
                  <SelectItem value="narrative">Narrative</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 dark:text-gray-400">What kind of writing style should the AI use?</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Key Keywords / Concepts</Label>
              <Input
                id="keywords"
                placeholder="Comma-separated, e.g., 'SEO, content marketing, blog'"
                value={formData.keywords}
                onChange={handleInputChange}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Important terms or ideas the AI should incorporate.
              </p>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="length">Desired Length</Label>
              <Select value={formData.length} onValueChange={(value) => handleSelectChange("length", value)}>
                <SelectTrigger id="length">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                  <SelectItem value="medium">Medium (1-2 paragraphs)</SelectItem>
                  <SelectItem value="long">Long (3+ paragraphs / detailed)</SelectItem>
                  <SelectItem value="bullet_points">Bullet Points / List</SelectItem>
                  <SelectItem value="code_snippet">Code Snippet</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                How long or structured should the AI's output be?
              </p>
            </div>
            <div className="space-y-4">
              <Label htmlFor="creativity">Creativity Level: {formData.creativity}/10</Label>
              <Slider
                id="creativity"
                min={1}
                max={10}
                step={1}
                value={[formData.creativity]}
                onValueChange={(value) => handleSliderChange("creativity", value)}
                className="w-full"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                1 = Very literal, factual. 10 = Highly imaginative, abstract.
              </p>
            </div>
            <div className="space-y-4">
              <Label htmlFor="specificity">Specificity Level: {formData.specificity}/10</Label>
              <Slider
                id="specificity"
                min={1}
                max={10}
                step={1}
                value={[formData.specificity]}
                onValueChange={(value) => handleSliderChange("specificity", value)}
                className="w-full"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                1 = General, broad. 10 = Extremely precise, detailed.
              </p>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Generated Prompt:</h3>
            {isGenerating ? (
              <div className="flex items-center justify-center min-h-[150px] bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-3 text-gray-600 dark:text-gray-300">Generating...</span>
              </div>
            ) : (
              <Textarea
                value={generatedPrompt}
                readOnly
                rows={10}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-mono text-sm"
              />
            )}
            <Button
              onClick={() => {
                navigator.clipboard.writeText(generatedPrompt)
                toast({ title: "Copied!", description: "Generated prompt copied to clipboard." })
              }}
              disabled={!generatedPrompt}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Copy className="w-4 h-4 mr-2" /> Copy Prompt
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  const isStep1Valid = formData.topic.trim() !== "" && formData.purpose.trim() !== ""
  const isStepValid = (currentStep: number) => {
    if (currentStep === 1) return isStep1Valid
    if (currentStep === 2) return true // All fields optional or have defaults
    if (currentStep === 3) return true // All fields optional or have defaults
    return false
  }

  return (
    <div className="space-y-8">
      <Progress value={(step / 4) * 100} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />

      <div className="p-6 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-inner">
        {renderStepContent()}
      </div>

      <div className="flex justify-between gap-4">
        <Button
          onClick={() => setStep((prev) => Math.max(1, prev - 1))}
          disabled={step === 1 || isGenerating}
          variant="outline"
          className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Previous
        </Button>

        {step < 3 && (
          <Button
            onClick={() => setStep((prev) => prev + 1)}
            disabled={!isStepValid(step) || isGenerating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {step === 3 && (
          <Button
            onClick={generatePrompt}
            disabled={isGenerating}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Prompt
              </>
            )}
          </Button>
        )}

        {step === 4 && (
          <Button
            onClick={() => {
              setStep(1)
              setGeneratedPrompt("")
              setFormData({
                topic: "",
                purpose: "",
                audience: "",
                tone: "neutral",
                style: "informative",
                keywords: "",
                length: "medium",
                creativity: 5,
                specificity: 5,
              })
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" /> Start New Prompt
          </Button>
        )}
      </div>
    </div>
  )
}
