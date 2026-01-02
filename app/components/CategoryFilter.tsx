"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
        ប្រភេទមុខម្ហូប
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onSelect(null)}
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          className="transition-all duration-200"
        >
          ទាំងអស់
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => onSelect(category)}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            className="transition-all duration-200"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}

