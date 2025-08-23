import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Folder, Lock, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Prompt {
  _id: string
  title: string
  prompt: string
  tags: string[]
  creator: {
    _id: string
    username: string
    email: string
    image: string
  }
  likes: string[]
  createdAt: string
  sampleResult?: string
  sampleOutputImage?: string
  category?: string
  difficulty?: string
  commentCount?: number
  isTemplate?: boolean
}

interface Collection {
  _id: string
  name: string
  description: string
  isPublic: boolean
  creator: {
    _id: string
    username: string
    image: string
  }
  prompts: Prompt[]
  createdAt: string
}

interface CollectionCardProps {
  collection: Collection
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link href={`/collections/${collection._id}`} className="block">
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800 animate-fade-in">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={collection.creator.image || "/placeholder-user.jpg"}
                  alt={collection.creator.username}
                />
                <AvatarFallback>{collection.creator.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{collection.creator.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(collection.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            {collection.isPublic ? (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              >
                <Users className="w-3 h-3 mr-1" /> Public
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                <Lock className="w-3 h-3 mr-1" /> Private
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <CardTitle className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
            {collection.name}
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
            {collection.description || "No description provided."}
          </p>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <Folder className="w-4 h-4 mr-1" />
            {collection.prompts.length} Prompts
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-gray-100 dark:border-gray-700">
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            View Collection
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
