import Link from "next/link"
import { Card } from "@/components/ui/card"

interface TagCardProps {
  tag: string
}

export default function TagCard({ tag }: TagCardProps) {
  return (
    <Link href={`/explore?tag=${tag}`}>
      <Card className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm cursor-pointer hover:scale-105 transition-all">
        {tag}
      </Card>
    </Link>
  )
}
