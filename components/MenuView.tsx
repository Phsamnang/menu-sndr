"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchMenu, type MenuItem } from "@/utils/menu";
import OptimizedImage from "./OptimizedImage";

const tableTypes = ["economy", "standard", "premium", "vip", "royal"];
const categories = ["appetizer", "food", "dessert", "drink", "alcohol"];

interface MenuViewProps {
  tableType: string;
}

export default function MenuView({ tableType }: MenuViewProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("appetizer");

  const validType = tableTypes.includes(tableType) ? tableType : "economy";

  const {
    data: menuData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["menu", selectedCategory],
    queryFn: () => fetchMenu(selectedCategory),
  });

  const filteredMenu = menuData.filter((item) => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {tableTypes.map((type) => (
          <button
            key={type}
            onClick={() => router.push(`/menu/${type}`)}
            className={`px-5 py-2 rounded-lg font-semibold capitalize transition-all text-sm ${
              validType === type
                ? "bg-slate-800 text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2 rounded-lg font-semibold capitalize transition-all text-sm ${
              selectedCategory === category
                ? "bg-slate-600 text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
          <p className="text-slate-600 mt-4">Loading menu...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error loading menu. Please try again.</p>
        </div>
      ) : filteredMenu.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600">No items found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 w-full">
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                  quality={85}
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {item.name}
                </h3>
                <p className="text-slate-600 text-sm mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-800">
                    ${item.prices[validType]?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


