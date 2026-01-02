"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { menuService, MenuItem } from "@/services/menu.service";
import { tableTypeService, TableType } from "@/services/table-type.service";
import { Header } from "./components/Header";
import { TableTypeFilter } from "./components/TableTypeFilter";
import { CategoryFilter } from "./components/CategoryFilter";
import { MenuCategorySection } from "./components/MenuCategorySection";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { EmptyState } from "./components/EmptyState";

function HomeContent() {
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
      return menuService.getAll({ tableType: selectedTableType });
    },
    enabled: true,
    retry: 1,
  });

  const { data: tableTypes = [] } = useQuery<TableType[]>({
    queryKey: ["tableTypes"],
    queryFn: () => tableTypeService.getAll(false),
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
      <Header />
      <div className="sticky top-[100px] z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="space-y-2">
            <TableTypeFilter
              tableTypes={sortedTableTypes}
              selectedTableType={selectedTableType}
              onSelect={setSelectedTableType}
            />
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : Object.keys(displayCategories).length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {Object.entries(displayCategories).map(([category, items]) => (
              <MenuCategorySection
                key={category}
                category={category}
                items={items}
                selectedTableType={selectedTableType}
              />
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
