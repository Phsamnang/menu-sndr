"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { type MenuItem } from "@/utils/menu";
import OptimizedImage from "@/components/OptimizedImage";
import { apiClientJson } from "@/utils/api-client";

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
  const [selectedTableType, setSelectedTableType] = useState<string | null>(
    null
  );

  useEffect(() => {
    const tableType = searchParams.get("tableType");
    setSelectedTableType(tableType);
  }, [searchParams]);

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
      const result = await apiClientJson<MenuItem[]>(url, {
        requireAuth: false,
      });

      if (!result.success || !result.data) {
        const errorMessage =
          result.error?.message || result.error || "Failed to fetch menu";
        throw new Error(errorMessage);
      }

      return result.data;
    },
    enabled: true,
    retry: 1,
  });

  const { data: tableTypes = [] } = useQuery<TableType[]>({
    queryKey: ["tableTypes"],
    queryFn: async () => {
      const result = await apiClientJson<TableType[]>("/api/admin/table-types", {
        requireAuth: false,
      });

      if (!result.success || !result.data) {
        const errorMessage =
          result.error?.message ||
          result.error ||
          "Failed to fetch table types";
        throw new Error(errorMessage);
      }

      return result.data;
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent mb-1">
                មីនុយភោជនីយដ្ឋាន
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                ជ្រើសរើសប្រភេទតុ និងប្រភេទមុខម្ហូបដើម្បីមើលមុខម្ហូប
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="ml-4 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium text-sm sm:text-base shadow-md hover:shadow-lg"
            >
              ចូលប្រើប្រាស់
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                ប្រភេទតុ
              </p>
              <div className="flex flex-wrap gap-2">
                {sortedTableTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedTableType(type.name);
                      const params = new URLSearchParams(
                        searchParams.toString()
                      );
                      params.set("tableType", type.name);
                      router.push(`?${params.toString()}`);
                    }}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${
                      selectedTableType === type.name
                        ? "bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg shadow-slate-800/30 scale-105"
                        : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {type.displayName}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                ប្រភេទមុខម្ហូប
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    selectedCategory === null
                      ? "bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-md"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow"
                  }`}
                >
                  ទាំងអស់
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-md"
                        : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-800"></div>
            <p className="text-slate-600 mt-4 text-base font-medium">
              កំពុងផ្ទុកមីនុយ...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-red-600 text-base font-semibold mb-2">
              មានកំហុសក្នុងការផ្ទុកមីនុយ
            </p>
            <p className="text-red-400 text-sm">{String(error)}</p>
          </div>
        ) : Object.keys(displayCategories).length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-slate-600 text-base font-medium">
              រកមិនឃើញមុខម្ហូបទេ។
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {Object.entries(displayCategories).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8">
                  <div className="h-1 w-12 bg-gradient-to-r from-slate-800 to-slate-600 rounded-full"></div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800 capitalize">
                    {category}
                  </h2>
                  <div className="flex-1 h-1 bg-gradient-to-r from-slate-300 to-transparent rounded-full"></div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 pb-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="group flex-shrink-0 w-48 sm:w-56 cursor-pointer"
                        onClick={() => {}}
                      >
                        <div className="relative h-32 sm:h-36 w-full bg-slate-100 overflow-hidden rounded-md mb-2">
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
                        <div>
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
                                {item.prices[selectedTableType]?.toLocaleString(
                                  "km-KH"
                                ) || "0"}
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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
              <p className="text-slate-600 mt-4">កំពុងផ្ទុក...</p>
            </div>
          </div>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
