"use client";

import OptimizedImage from "@/components/OptimizedImage";
import { MenuItem } from "@/services/menu.service";
import { Card, CardContent } from "@/components/ui/card";

interface MenuItemCardProps {
  item: MenuItem;
  selectedTableType: string | null;
}

export function MenuItemCard({ item, selectedTableType }: MenuItemCardProps) {
  return (
    <Card className="group flex-shrink-0 w-48 sm:w-56 cursor-pointer hover:shadow-lg transition-shadow">
      <div className="relative h-32 sm:h-36 w-full bg-slate-100 overflow-hidden rounded-t-lg">
        {item.image ? (
          <OptimizedImage
            src={item.image}
            alt={item.name}
            width={224}
            height={144}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            quality={90}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <svg
              className="w-10 h-10 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="text-sm font-bold text-slate-800 mb-1 line-clamp-2">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs text-slate-600 mb-2 line-clamp-2">
            {item.description}
          </p>
        )}
        {selectedTableType ? (
          <div>
            <span className="text-base sm:text-lg font-extrabold text-slate-900">
              {item.prices[selectedTableType]?.toLocaleString("km-KH") || "0"}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 ml-1">
              ៛
            </span>
          </div>
        ) : (
          <p className="text-xs font-medium text-slate-400 italic">
            ជ្រើសរើសប្រភេទតុ
          </p>
        )}
      </CardContent>
    </Card>
  );
}

