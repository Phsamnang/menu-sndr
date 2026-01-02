"use client";

import { MenuItem } from "@/services/menu.service";
import { MenuItemCard } from "./MenuItemCard";
import { Badge } from "@/components/ui/badge";

interface MenuCategorySectionProps {
  category: string;
  items: MenuItem[];
  selectedTableType: string | null;
}

export function MenuCategorySection({
  category,
  items,
  selectedTableType,
}: MenuCategorySectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="h-1 w-12 bg-gradient-to-r from-slate-800 to-slate-600 rounded-full"></div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 capitalize">
          {category}
        </h2>
        <div className="flex-1 h-1 bg-gradient-to-r from-slate-300 to-transparent rounded-full"></div>
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 pb-2">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              selectedTableType={selectedTableType}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

