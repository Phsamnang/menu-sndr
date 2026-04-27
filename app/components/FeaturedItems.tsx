"use client";

import { MenuItem } from "@/services/menu.service";
import { MenuItemCard } from "./MenuItemCard";

interface FeaturedItemsProps {
  items: MenuItem[];
  selectedTableType: string | null;
}

export function FeaturedItems({ items, selectedTableType }: FeaturedItemsProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
              ★ ពិសេស
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mt-1.5">
            មុខម្ហូបពេញនិយម
          </h2>
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {items.length} មុខ
        </span>
      </div>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              selectedTableType={selectedTableType}
              featured
            />
          ))}
        </div>
      </div>
    </section>
  );
}
