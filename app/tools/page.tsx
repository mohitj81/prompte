"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Shuffle, GitCompare } from "lucide-react"
import AiPromptWriter from "@/components/ai-prompt-writer"
import PromptRemixTool from "@/components/prompt-remix-tool"
import PromptDiffTool from "@/components/prompt-diff-tool"

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState("ai-writer")

  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 animate-fade-in-up">
        AI Prompt Tools
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shadow-inner mb-8">
          <TabsTrigger
            value="ai-writer"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <Lightbulb className="w-5 h-5" /> AI Prompt Writer
          </TabsTrigger>
          <TabsTrigger
            value="remix"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <Shuffle className="w-5 h-5" /> Prompt Remix
          </TabsTrigger>
          <TabsTrigger
            value="diff"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <GitCompare className="w-5 h-5" /> Prompt Diff
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-writer">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in">
            <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Assist Prompt Writer
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Craft detailed and effective prompts from scratch with AI assistance.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <AiPromptWriter />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remix">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in">
            <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Prompt Remix Tool</CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Transform your existing prompts by changing tone, style, or subject.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <PromptRemixTool />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diff">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm animate-fade-in">
            <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Visual Prompt Diff Tool
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Compare two prompts side-by-side to easily spot differences.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <PromptDiffTool />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  )
}
