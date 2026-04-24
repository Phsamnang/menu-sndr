"use client";

import { MenuItem } from "@/services/menu.service";
import { MenuItemCard } from "./MenuItemCard";

interface MenuCategorySectionProps {
  category: string;
  displayName?: string;
  items: MenuItem[];
  selectedTableType: string | null;
  colorIndex?: number;
}

export function MenuCategorySection({
  category,
  displayName,
  items,
  selectedTableType,
}: MenuCategorySectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          {displayName || category}
        </h2>
        <span className="text-xs text-gray-400 font-medium">{items.length} មុខ</span>
      </div>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              selectedTableType={selectedTableType}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
