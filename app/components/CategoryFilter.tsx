"use client";

interface CategoryFilterProps {
  categories: string[];
  categoryDisplayNames?: Record<string, string>;
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryFilter({
  categories,
  categoryDisplayNames = {},
  selectedCategory,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
          selectedCategory === null
            ? "bg-primary text-white border-primary shadow-sm"
            : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary"
        }`}
      >
        ទាំងអស់
      </button>
      {categories.map((category) => {
        const isActive = selectedCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelect(isActive ? null : category)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
              isActive
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary"
            }`}
          >
            {categoryDisplayNames[category] || category}
          </button>
        );
      })}
    </div>
  );
}
