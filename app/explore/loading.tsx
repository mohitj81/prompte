import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <span className="sr-only">Loading prompts...</span>
    </div>
  )
}
