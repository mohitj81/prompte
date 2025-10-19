import Link from "next/link"
import { Card } from "@/components/ui/card"

interface CategoryCardProps {
  category: string
  count: number
}

export default function CategoryCard({ category, count }: CategoryCardProps) {
  return (
    <Link href={`/explore?category=${category}`}>
      <Card className="p-4 text-center hover:shadow-lg transition-all">
        <p className="font-semibold">{category}</p>
        <p className="text-sm text-gray-500">{count} prompts</p>
      </Card>
    </Link>
  )
}
