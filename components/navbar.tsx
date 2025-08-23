"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, PlusCircle, Search, Home, Compass, Settings, LogOut, Lightbulb, Moon, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import PromptSearch from "./prompt-search"

export default function Navbar() {
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    if (session?.user?.id) {
      fetchUnreadNotificationsCount()
    }
  }, [session])

  const fetchUnreadNotificationsCount = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const notifications = await res.json()
        const unreadCount = notifications.filter((n: any) => !n.read).length
        setUnreadNotificationsCount(unreadCount)
      }
    } catch (error) {
      console.error("Failed to fetch unread notifications count:", error)
      toast({
        title: "Error",
        description: "Failed to load notification count.",
        variant: "destructive",
      })
    }
  }

  if (!mounted) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md border-b border-gray-200/50 dark:border-gray-700/50 py-3">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo and Site Name */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/placeholder-logo.svg" alt="PromptBook Logo" width={32} height={32} className="dark:invert" />
          <span className="text-xl font-bold text-gray-900 dark:text-white hidden md:block">PromptBook</span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link
            href="/explore"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            <Compass className="w-4 h-4" /> Explore
          </Link>
          <Link
            href="/tools"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            <Lightbulb className="w-4 h-4" /> Tools
          </Link>
        </div>

        {/* Right Section: Search, Notifications, Auth/Profile */}
        <div className="flex items-center gap-3">
          {/* Search Button/Modal Trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Search className="w-5 h-5" />
                <span className="sr-only">Search</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 border-0 shadow-none max-w-2xl w-full h-[80vh] flex flex-col">
              <PromptSearch />
            </DialogContent>
          </Dialog>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {status === "authenticated" ? (
            <>
              {/* Create Prompt Button */}
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hidden sm:flex"
              >
                <Link href="/create">
                  <PlusCircle className="w-5 h-5" />
                  <span className="sr-only">Create Prompt</span>
                </Link>
              </Button>

              {/* Notifications */}
              <Link href="/notifications" className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Bell className="w-5 h-5" />
                  <span className="sr-only">Notifications</span>
                </Button>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Link>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                      <AvatarImage
                        src={session.user?.image || "/placeholder-user.jpg"}
                        alt={session.user?.name || "User"}
                      />
                      <AvatarFallback>{session.user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">
                        {session.user?.name}
                      </p>
                      <p className="text-xs leading-none text-gray-500 dark:text-gray-400">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700 my-2" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/create" className="flex items-center gap-2 cursor-pointer md:hidden">
                      <PlusCircle className="w-4 h-4" /> Create Prompt
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700 my-2" />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 text-red-600 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full">
              <Link href="/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
