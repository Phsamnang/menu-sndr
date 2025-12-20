"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { type MenuItem } from "@/utils/menu";
import OptimizedImage from "@/components/OptimizedImage";

interface TableType {
  id: string;
  name: string;
  displayName: string;
  order: number;
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTableType, setSelectedTableType] = useState<string | null>(null);

  useEffect(() => {
    const tableType = searchParams.get("tableType");
    console.log("Table type from URL:", tableType);
    setSelectedTableType(tableType);
  }, [searchParams]);

  useEffect(() => {
    console.log("Selected table type changed:", selectedTableType);
  }, [selectedTableType]);

  const {
    data: menuData = [],
    isLoading,
    error,
  } = useQuery<MenuItem[]>({
    queryKey: ["menu", selectedTableType],
    queryFn: async () => {
      const url = selectedTableType
        ? `/api/menu?tableType=${selectedTableType}`
        : "/api/menu";
      console.log("Fetching menu from:", url);
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch menu");
      }
      const data = await response.json();
      console.log("Menu data received:", data.length, "items");
      return data;
    },
    enabled: true,
    retry: 1,
  });

  const { data: tableTypes = [] } = useQuery<TableType[]>({
    queryKey: ["tableTypes"],
    queryFn: async () => {
      console.log("Fetching table types...");
      const res = await fetch("/api/admin/table-types");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      console.log("Table types received:", data.length, "types");
      return data;
    },
    enabled: true,
    retry: 1,
  });

  const categories = Array.from(new Set(menuData.map((item) => item.category)));

  const menuByCategory = menuData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const displayCategories = selectedCategory
    ? { [selectedCategory]: menuByCategory[selectedCategory] || [] }
    : menuByCategory;

  const sortedTableTypes = [...tableTypes].sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 px-2 sm:py-6 sm:px-4 md:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
            មីនុយភោជនីយដ្ឋាន
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 px-2">ជ្រើសរើសប្រភេទតុ និងប្រភេទមុខម្ហូបដើម្បីមើលមុខម្ហូប</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {sortedTableTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedTableType(type.name);
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("tableType", type.name);
                  router.push(`?${params.toString()}`);
                }}
                className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg font-medium sm:font-semibold capitalize transition-all text-xs sm:text-sm ${
                  selectedTableType === type.name
                    ? "bg-slate-800 text-white shadow-md sm:shadow-lg"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {type.displayName}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md font-medium capitalize transition-all text-xs ${
                selectedCategory === null
                  ? "bg-slate-600 text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              ទាំងអស់
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md font-medium capitalize transition-all text-xs ${
                  selectedCategory === category
                    ? "bg-slate-600 text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>


          {isLoading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-slate-800"></div>
              <p className="text-slate-600 mt-3 sm:mt-4 text-sm sm:text-base">កំពុងផ្ទុកមីនុយ...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12 px-2">
              <p className="text-red-600 text-sm sm:text-base">មានកំហុសក្នុងការផ្ទុកមីនុយ។ សូមព្យាយាមម្តងទៀត។</p>
              <p className="text-red-400 text-xs sm:text-sm mt-2">{String(error)}</p>
            </div>
          ) : Object.keys(displayCategories).length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-slate-600 text-sm sm:text-base">រកមិនឃើញមុខម្ហូបទេ។</p>
            </div>
          ) : (
            Object.entries(displayCategories).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 capitalize border-b border-slate-300 pb-1">
                  {category}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-md sm:rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {}}
                    >
                      <div className="relative h-24 sm:h-32 w-full bg-slate-100">
                        {item.image ? (
                          <OptimizedImage
                            src={item.image}
                            alt={item.name}
                            width={200}
                            height={128}
                            className="w-full h-full object-cover"
                            quality={85}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200">
                            <span className="text-slate-400 text-[10px] sm:text-xs">គ្មានរូបភាព</span>
                          </div>
                        )}
                      </div>
                      <div className="p-1.5 sm:p-2">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-0.5 sm:mb-1 line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-slate-600 mb-1 sm:mb-2 line-clamp-2">{item.description}</p>
                        {selectedTableType && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm sm:text-lg font-bold text-slate-800">
                              {item.prices[selectedTableType]?.toLocaleString('km-KH') || "0"}៛
                            </span>
                          </div>
                        )}
                        {!selectedTableType && (
                          <div className="text-[10px] sm:text-xs text-slate-500">
                            ជ្រើសរើសប្រភេទតុ
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
            <p className="text-slate-600 mt-4">កំពុងផ្ទុក...</p>
          </div>
        </div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}


