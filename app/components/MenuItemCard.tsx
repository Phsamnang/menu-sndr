"use client";

import OptimizedImage from "@/components/OptimizedImage";
import { MenuItem } from "@/services/menu.service";

interface MenuItemCardProps {
  item: MenuItem;
  selectedTableType: string | null;
  featured?: boolean;
}

export function MenuItemCard({
  item,
  selectedTableType,
  featured = false,
}: MenuItemCardProps) {
  const price = selectedTableType ? item.prices[selectedTableType] : undefined;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {item.image ? (
          <OptimizedImage
            src={item.image}
            alt={item.name}
            width={260}
            height={260}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            quality={85}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg
              className="w-10 h-10 text-gray-300"
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
        {featured && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold shadow-sm">
            ★ ពិសេស
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
        <div className="mt-2.5">
          {price !== undefined && price > 0 ? (
            <span className="text-primary font-bold text-sm">
              {price.toLocaleString("km-KH")}
              <span className="text-xs font-semibold ml-0.5">៛</span>
            </span>
          ) : price === 0 ? null : (
            <span className="text-gray-400 text-[11px]">ជ្រើសរើសប្រភេទតុ</span>
          )}
        </div>
      </div>
    </div>
  );
}
