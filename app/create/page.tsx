"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import PromptForm from "@/components/prompt-form"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function CreatePromptPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/signin")
    return null
  }

  const createPrompt = async (data: {
    title: string
    prompt: string
    tags: string[]
    sampleResult?: string
    sampleOutputImage?: string
  }) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your prompt has been created.",
        })
        router.push("/profile")
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to create prompt.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating prompt:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Create New Prompt</CardTitle>
          <p className="text-gray-600 dark:text-gray-300">Share your amazing AI prompt with the community!</p>
        </CardHeader>
        <CardContent className="p-6">
          <PromptForm onSubmit={createPrompt} isSubmitting={isSubmitting} submitButtonText="Create Prompt" />
        </CardContent>
      </Card>
    </section>
  )
}
