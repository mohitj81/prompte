"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SlidersHorizontal, ChevronDown } from "lucide-react"

interface AdvancedFiltersProps {
  filters: {
    category: string
    difficulty: string
    isTemplate: boolean
    sortBy: string
  }
  onFilterChange: (newFilters: Partial<AdvancedFiltersProps["filters"]>) => void
}

export default function AdvancedFilters({ filters, onFilterChange }: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-full px-4 py-2 shadow-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <DropdownMenuLabel className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Filter Prompts
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700 my-2" />

        <div className="space-y-4">
          {/* Sort By */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</p>
            <DropdownMenuRadioGroup value={filters.sortBy} onValueChange={(value) => onFilterChange({ sortBy: value })}>
              <DropdownMenuRadioItem value="latest">Latest</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="popular">Most Popular</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="views">Most Viewed</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </div>

          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700 my-2" />

          {/* Category */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</p>
            <DropdownMenuRadioGroup
              value={filters.category}
              onValueChange={(value) => onFilterChange({ category: value })}
            >
              <DropdownMenuRadioItem value="">All Categories</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="writing">Writing</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="coding">Coding</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="marketing">Marketing</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="design">Design</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="business">Business</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="education">Education</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="entertainment">Entertainment</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="productivity">Productivity</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="research">Research</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="other">Other</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </div>

          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700 my-2" />

          {/* Difficulty */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</p>
            <DropdownMenuRadioGroup
              value={filters.difficulty}
              onValueChange={(value) => onFilterChange({ difficulty: value })}
            >
              <DropdownMenuRadioItem value="">All Difficulties</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="beginner">Beginner</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="intermediate">Intermediate</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="advanced">Advanced</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </div>

          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700 my-2" />

          {/* Is Template */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isTemplate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show Templates Only
            </Label>
            <Switch
              id="isTemplate"
              checked={filters.isTemplate}
              onCheckedChange={(checked) => onFilterChange({ isTemplate: checked })}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
