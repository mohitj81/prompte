"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export default function SignInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/profile") // Redirect to profile or dashboard after successful sign-in
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md p-6 shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in">
        <CardHeader className="text-center pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Sign In to PromptBook</CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Unlock the full potential of AI prompts.</p>
        </CardHeader>
        <CardContent className="pt-6">
          <Button
            onClick={() => signIn("google", { callbackUrl: "/profile" })}
            className="w-full flex items-center justify-center gap-3 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1"
          >
            <Image src="/google-icon.svg" alt="Google" width={24} height={24} className="invert dark:invert-0" />
            Sign In with Google
          </Button>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
