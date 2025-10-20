import { connectToDB } from "@/utils/database"
import Prompt from "@/models/prompt"
import PromptCard from "@/components/prompt-card"
import { Loader2 } from "lucide-react"

interface CategoryPageProps {
  params: { category: string }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params

  try {
    await connectToDB()

    // Fetch prompts for this category
    const prompts = await Prompt.find({ category }).populate("creator")

    if (!prompts || prompts.length === 0) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-10">
          <h1 className="text-4xl font-bold mb-4 capitalize">{category}</h1>
          <p className="text-gray-500">No prompts found for this category yet.</p>
        </div>
      )
    }

    return (
      <div className="min-h-screen container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-10 capitalize bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          {category} Prompts
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <PromptCard key={prompt._id.toString()} prompt={prompt} />
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching category prompts:", error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-10">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500">Error loading prompts for this category.</p>
      </div>
    )
  }
}
