"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import PromptForm from "@/components/prompt-form"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface PromptData {
  title: string
  prompt: string
  tags: string[]
  sampleResult?: string
  sampleOutputImage?: string
  category?: string
  difficulty?: string
  isTemplate?: boolean
  templateVariables?: { name: string; description: string; placeholder: string; required: boolean }[]
}

export default function EditPromptPage() {
  const router = useRouter()
  const params = useParams()
  const promptId = params.id as string
  const { data: session, status } = useSession()
  const [initialData, setInitialData] = useState<PromptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPrompt = async () => {
      if (!promptId) return

      try {
        const response = await fetch(`/api/prompt/${promptId}`)
        if (response.ok) {
          const data = await response.json()
          setInitialData(data.prompt)
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch prompt data.",
            variant: "destructive",
          })
          router.push("/profile") // Redirect if prompt not found or error
        }
      } catch (error) {
        console.error("Error fetching prompt:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        })
        router.push("/profile")
      } finally {
        setLoading(false)
      }
    }

    fetchPrompt()
  }, [promptId, router, toast])

  if (status === "loading" || loading) {
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

  if (!initialData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] text-gray-600 dark:text-gray-400">
        Prompt not found or you don't have permission to edit it.
      </div>
    )
  }

  const updatePrompt = async (data: PromptData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/prompt/${promptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your prompt has been updated.",
        })
        router.push("/profile")
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update prompt.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating prompt:", error)
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
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Edit Prompt</CardTitle>
          <p className="text-gray-600 dark:text-gray-300">Make changes to your prompt.</p>
        </CardHeader>
        <CardContent className="p-6">
          <PromptForm
            initialData={initialData}
            onSubmit={updatePrompt}
            isSubmitting={isSubmitting}
            submitButtonText="Update Prompt"
          />
        </CardContent>
      </Card>
    </section>
  )
}
