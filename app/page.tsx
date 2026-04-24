"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { menuService, MenuItem } from "@/services/menu.service";
import { tableTypeService, TableType } from "@/services/table-type.service";
import { Header } from "./components/Header";
import { CategoryFilter } from "./components/CategoryFilter";
import { MenuCategorySection } from "./components/MenuCategorySection";
import { MenuItemCard } from "./components/MenuItemCard";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { EmptyState } from "./components/EmptyState";

const PROMO_BANNERS = [
  {
    id: 1,
    title: "ម្ហូបថ្ងៃនេះ",
    subtitle: "ទទួលបានមុខម្ហូបស្រស់ថ្មីប្រចាំថ្ងៃ",
    bg: "from-primary to-blue-400",
    emoji: "🍽️",
  },
  {
    id: 2,
    title: "ភេសជ្ជៈត្រជាក់",
    subtitle: "ផឹកស្រស់ ស្ត្រី ក្តៅ",
    bg: "from-sky-500 to-cyan-400",
    emoji: "🥤",
  },
  {
    id: 3,
    title: "មុខម្ហូបពិសេស",
    subtitle: "ជ្រើសរើសតាមចិត្ត",
    bg: "from-rose-500 to-orange-400",
    emoji: "⭐",
  },
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTableType, setSelectedTableType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const tableType = searchParams.get("tableType");
    setSelectedTableType(tableType);
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const {
    data: menuData = [],
    isLoading,
    error,
  } = useQuery<MenuItem[]>({
    queryKey: ["menu", selectedTableType],
    queryFn: () =>
      menuService.getAll({ tableType: selectedTableType ?? undefined }),
    retry: 1,
  });

  const { data: tableTypes = [] } = useQuery<TableType[]>({
    queryKey: ["tableTypes"],
    queryFn: () => tableTypeService.getAll(false),
    retry: 1,
  });

  const { data: heroSetting } = useQuery({
    queryKey: ["setting", "hero_image_url"],
    queryFn: async () => {
      const res = await fetch("/api/settings?key=hero_image_url");
      const json = await res.json();
      return json?.data ?? null;
    },
    staleTime: 60_000,
  });

  const handleSelectTableType = (name: string) => {
    setSelectedTableType(name);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tableType", name);
    router.push(`?${params.toString()}`);
  };

  const isSearching = debouncedSearch.length > 0;

  const categories = useMemo(
    () => Array.from(new Set(menuData.map((item) => item.category))),
    [menuData]
  );

  const categoryDisplayNames = useMemo(() => {
    const map: Record<string, string> = {};
    menuData.forEach((item) => {
      if (item.category && item.categoryDisplayName) {
        map[item.category] = item.categoryDisplayName;
      }
    });
    return map;
  }, [menuData]);

  const menuByCategory = useMemo(() => {
    return menuData.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [menuData]);

  const filteredFlat = useMemo(() => {
    if (!isSearching) return [];
    const q = debouncedSearch.toLowerCase();
    return menuData.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [menuData, debouncedSearch, isSearching]);

  const displayCategories = useMemo(() => {
    if (selectedCategory) {
      return { [selectedCategory]: menuByCategory[selectedCategory] || [] };
    }
    return menuByCategory;
  }, [selectedCategory, menuByCategory]);

  const sortedTableTypes = useMemo(
    () => [...tableTypes].sort((a, b) => a.order - b.order),
    [tableTypes]
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <Header
        tableTypes={sortedTableTypes}
        selectedTableType={selectedTableType}
        onSelectTableType={handleSelectTableType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        heroImageUrl={heroSetting?.value}
      />

      {/* Category filter — sticky */}
      {categories.length > 0 && !isSearching && (
        <div className="sticky top-14 z-10 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <CategoryFilter
              categories={categories}
              categoryDisplayNames={categoryDisplayNames}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-5 sm:py-6">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : isSearching ? (
          filteredFlat.length === 0 ? (
            <EmptyState />
          ) : (
            <section className="space-y-3 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">
                  លទ្ធផលស្វែងរក
                </h2>
                <span className="text-xs text-gray-400 font-medium">
                  {filteredFlat.length} មុខ
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {filteredFlat.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    selectedTableType={selectedTableType}
                  />
                ))}
              </div>
            </section>
          )
        ) : Object.keys(displayCategories).length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-7 sm:space-y-9">
            {/* Promo banners */}
            {!selectedCategory && (
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
                  {PROMO_BANNERS.map((banner) => (
                    <div
                      key={banner.id}
                      className={`flex-shrink-0 w-56 sm:w-64 rounded-2xl bg-gradient-to-br ${banner.bg} p-4 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity`}
                    >
                      <span className="text-3xl">{banner.emoji}</span>
                      <div>
                        <p className="text-white font-bold text-sm leading-tight">
                          {banner.title}
                        </p>
                        <p className="text-white/80 text-xs mt-0.5 leading-tight">
                          {banner.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.entries(displayCategories).map(([category, items]) => (
              <MenuCategorySection
                key={category}
                category={category}
                displayName={categoryDisplayNames[category]}
                items={items}
                selectedTableType={selectedTableType}
                colorIndex={categories.indexOf(category)}
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
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-gray-500 mt-4 text-sm">កំពុងផ្ទុក...</p>
          </div>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
