"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, Lightbulb, MessageSquare, Heart } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useToast } from "@/hooks/use-toast"

interface AdminStats {
  stats: {
    totalUsers: number
    totalPrompts: number
    totalComments: number
    totalNotifications: number
  }
  latestUsers: { _id: string; username: string; email: string; createdAt: string }[]
  latestPrompts: { _id: string; title: string; creator: { username: string }; createdAt: string }[]
  promptsByCategory: { _id: string; count: number }[]
  userPromptCounts: { username: string; count: number }[]
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAdminData = async () => {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/admin/dashboard")
          if (!res.ok) {
            if (res.status === 403) {
              toast({
                title: "Access Denied",
                description: "You do not have permission to view this page.",
                variant: "destructive",
              })
              return
            }
            throw new Error("Failed to fetch admin data")
          }
          const data = await res.json()
          setStats(data)
        } catch (error) {
          console.error("Error fetching admin data:", error)
          toast({
            title: "Error",
            description: "Failed to load dashboard data.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      } else if (status === "unauthenticated") {
        setLoading(false)
        toast({
          title: "Unauthorized",
          description: "Please sign in to view the dashboard.",
          variant: "destructive",
        })
      }
    }

    fetchAdminData()
  }, [status, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <span className="sr-only">Loading dashboard...</span>
      </div>
    )
  }

  if (!session || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] text-gray-600 dark:text-gray-400">
        Access Denied or Data Not Loaded.
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 animate-fade-in-up">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in delay-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Prompts</CardTitle>
            <Lightbulb className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stats.totalPrompts}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Comments</CardTitle>
            <MessageSquare className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stats.totalComments}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in delay-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications Sent</CardTitle>
            <Heart className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stats.totalNotifications}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Prompts by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.promptsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="_id"
                >
                  {stats.promptsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in delay-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Top Prompt Creators</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.userPromptCounts} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="username" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in delay-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Latest Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {stats.latestUsers.map((user) => (
                <li key={user._id} className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                  <span>{user.username}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in delay-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Latest Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {stats.latestPrompts.map((prompt) => (
                <li key={prompt._id} className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                  <span>{prompt.title}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">by {prompt.creator.username}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
