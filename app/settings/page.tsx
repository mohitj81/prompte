"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, User, LogOut, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [image, setImage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingUserData, setLoadingUserData] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const res = await fetch("/api/user/settings")
          if (res.ok) {
            const data = await res.json()
            setUsername(data.username || "")
            setImage(data.image || "")
          } else {
            toast({
              title: "Error",
              description: "Failed to load user settings.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          toast({
            title: "Error",
            description: "An unexpected error occurred.",
            variant: "destructive",
          })
        } finally {
          setLoadingUserData(false)
        }
      } else if (status === "unauthenticated") {
        router.push("/signin")
      }
    }
    fetchUserData()
  }, [status, session, router, toast])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, image }),
      })

      if (res.ok) {
        // Update session data
        await update({
          name: username,
          image: image,
        })
        toast({
          title: "Success!",
          description: "Your settings have been updated.",
        })
      } else {
        const errorData = await res.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update settings.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading" || loadingUserData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <span className="sr-only">Loading settings...</span>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null // Redirect handled by useEffect
  }

  return (
    <section className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-7 h-7 text-blue-600" /> Account Settings
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300">Manage your profile information.</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 border-2 border-blue-400 shadow-md">
                <AvatarImage src={image || "/placeholder-user.jpg"} alt={username || "User"} />
                <AvatarFallback className="text-4xl font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {username.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 w-full max-w-sm">
                <Label htmlFor="image">Profile Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="Enter image URL"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">Paste a direct link to your profile picture.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Your unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">Email cannot be changed.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex-1 border-red-500 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
