"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Loader2 } from "lucide-react"

interface PromptFormProps {
  initialData?: {
    title: string
    prompt: string
    tags: string[]
    sampleResult?: string
    category?: string
  }
  onSubmit: (data: {
    title: string
    prompt: string
    tags: string[]
    sampleResult?: string
    category?: string
  }) => void
  isSubmitting: boolean
  submitButtonText: string
}

export default function PromptForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitButtonText,
}: PromptFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    prompt: initialData?.prompt || "",
    tags: initialData?.tags || [],
    sampleResult: initialData?.sampleResult || "",
    category: initialData?.category || "",
  })

  const [tagInput, setTagInput] = useState("")
  const [isPredicting, setIsPredicting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.prompt.trim()) return

    setIsPredicting(true)

    try {
      // Call Python ML API to predict category
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: formData.prompt }),
      })

      const data = await response.json()
      const predictedCategory = data.predicted_category || "other"

      // Update category in formData
      const finalData = { ...formData, category: predictedCategory }

      // Call the original onSubmit with predicted category
      onSubmit(finalData)
    } catch (err) {
      console.error("Error predicting category:", err)
      onSubmit({ ...formData, category: "other" })
    } finally {
      setIsPredicting(false)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Prompt Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title for your prompt"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt *</Label>
            <Textarea
              id="prompt"
              placeholder="Enter your AI prompt here..."
              value={formData.prompt}
              onChange={(e) => setFormData((prev) => ({ ...prev, prompt: e.target.value }))}
              rows={6}
              required
            />
          </div>

          {/* Sample Result */}
          <div className="space-y-2">
            <Label htmlFor="sampleResult">Sample Result (Optional)</Label>
            <Textarea
              id="sampleResult"
              placeholder="Paste an example output from your prompt..."
              value={formData.sampleResult}
              onChange={(e) => setFormData((prev) => ({ ...prev, sampleResult: e.target.value }))}
              rows={4}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add tags (e.g., writing, marketing, code)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Predicted Category Display */}
          {formData.category && (
            <div className="space-y-2">
              <Label>Predicted Category</Label>
              <Input value={formData.category} readOnly className="bg-gray-100" />
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isPredicting || isSubmitting || !formData.title.trim() || !formData.prompt.trim()}
              className="flex-1"
            >
              {(isPredicting || isSubmitting) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {submitButtonText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
