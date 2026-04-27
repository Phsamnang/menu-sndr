"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { menuService, MenuItem } from "@/services/menu.service";
import { tableTypeService, TableType } from "@/services/table-type.service";
import { Header } from "./components/Header";
import { CategoryFilter } from "./components/CategoryFilter";
import { FeaturedItems } from "./components/FeaturedItems";
import { MenuCategorySection } from "./components/MenuCategorySection";
import { MenuItemCard } from "./components/MenuItemCard";
import { Footer } from "./components/Footer";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { EmptyState } from "./components/EmptyState";

const FEATURED_LIMIT = 8;

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

  const featuredItems = useMemo(() => {
    const picks: MenuItem[] = [];
    for (const cat of categories) {
      const items = menuByCategory[cat];
      if (items && items.length > 0) picks.push(items[0]);
      if (picks.length >= FEATURED_LIMIT) break;
    }
    return picks;
  }, [categories, menuByCategory]);

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
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        tableTypes={sortedTableTypes}
        selectedTableType={selectedTableType}
        onSelectTableType={handleSelectTableType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        heroImageUrl={heroSetting?.value}
      />

      {/* Sticky compact category filter (in-page nav while scrolling) */}
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

      <div className="flex-1 max-w-7xl mx-auto w-full py-5 sm:py-6">
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
            {/* Featured / popular items */}
            {!selectedCategory && featuredItems.length > 0 && (
              <FeaturedItems
                items={featuredItems}
                selectedTableType={selectedTableType}
              />
            )}

            {/* Category sections */}
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

      <Footer />
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
