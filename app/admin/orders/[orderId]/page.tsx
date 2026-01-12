"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { apiClientJson } from "@/utils/api-client";
import { type Order } from "@/services/order.service";
import OrderCartSidebar from "./components/OrderCartSidebar";
import MenuItemGrid from "./components/MenuItemGrid";
import { type Category, type MenuItem } from "@/lib/types";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  const { data: orderData, isLoading } = useQuery<Order | null>({
    queryKey: ["orderDetail", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const result = await apiClientJson<Order>(`/api/admin/orders/${orderId}`);
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to fetch order");
      }
      return result.data;
    },
    enabled: !!orderId,
  });

  const tableTypeName = useMemo(() => {
    if (!orderData?.table?.tableType) return undefined;
    const tableType = orderData.table.tableType as any;
    return tableType.name || undefined;
  }, [orderData?.table?.tableType]);

  const { data: menuData = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["menu", tableTypeName],
    queryFn: async () => {
      if (!tableTypeName) return [];
      const url = `/api/menu?tableType=${tableTypeName}`;
      const result = await apiClientJson<MenuItem[]>(url);
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to fetch menu");
      }
      return result.data;
    },
    enabled: !!tableTypeName,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const result = await apiClientJson<Category[]>("/api/admin/categories");
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to fetch categories");
      }
      return result.data;
    },
  });

  const orderItems = useMemo(() => orderData?.items || [], [orderData?.items]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredMenu = useMemo(() => {
    let filtered = menuData;

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [menuData, selectedCategory, debouncedSearchQuery]);

  const categoriesList = useMemo(() => {
    return Array.from(new Set(menuData.map((item) => item.category)));
  }, [menuData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-20 bg-slate-200 rounded"></div>
                <div className="h-20 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-slate-600 mb-4">មិនរកឃើញការបញ្ជាទិញ</p>
            <Link
              href="/admin/orders"
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
            >
              ត្រលប់
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 w-full min-w-0 pb-20 lg:pb-6 relative z-10">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 md:mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-800 mb-1 sm:mb-2 truncate">
                  ការបញ្ជាទិញ #{orderData.orderNumber}
                </h1>
                {orderData.table && (
                  <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-slate-800 text-white rounded-lg text-[10px] sm:text-xs md:text-sm font-medium inline-block">
                    តុ: {orderData.table.number} -{" "}
                    {orderData.table.tableType.displayName}
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="lg:hidden px-3 py-2 sm:px-4 bg-slate-800 text-white rounded-lg active:bg-slate-900 transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-h-[44px]"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span className="hidden sm:inline">កន្ត្រក់</span>
                  <span className="bg-white text-slate-800 rounded-full px-1.5 py-0.5 text-[10px] sm:text-xs font-bold min-w-[20px] text-center">
                    {orderItems.length}
                  </span>
                </button>
                <Link
                  href="/admin/orders"
                  className="px-3 py-2 sm:px-4 bg-slate-600 text-white rounded-lg active:bg-slate-700 md:hover:bg-slate-700 text-xs sm:text-sm min-h-[44px] flex items-center justify-center"
                >
                  ត្រលប់
                </Link>
              </div>
            </div>

            <div className="mb-3 sm:mb-4 md:mb-6 flex gap-2 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="ស្វែងរកមុខម្ហូប..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 md:py-3 pl-9 sm:pl-10 text-sm md:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 min-h-[44px]"
                />
                <svg
                  className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 md:top-3.5 w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="mb-3 sm:mb-4 md:mb-6">
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 sm:mx-0 px-2 sm:px-0">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex-shrink-0 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-1.5 md:py-2 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all min-h-[36px] sm:min-h-[40px] ${
                    selectedCategory === null
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-700 active:bg-slate-100"
                  }`}
                >
                  ទាំងអស់
                </button>
                {categoriesList.map((catName) => {
                  const category = categories.find((c) => c.name === catName);
                  return (
                    <button
                      key={catName}
                      onClick={() => setSelectedCategory(catName)}
                      className={`flex-shrink-0 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-1.5 md:py-2 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all min-h-[36px] sm:min-h-[40px] ${
                        selectedCategory === catName
                          ? "bg-slate-800 text-white"
                          : "bg-white text-slate-700 active:bg-slate-100"
                      }`}
                    >
                      {category?.displayName || catName}
                    </button>
                  );
                })}
              </div>
            </div>

            {menuLoading ? (
              <div className="text-center py-8 sm:py-12 text-sm sm:text-base">
                កំពុងផ្ទុក...
              </div>
            ) : filteredMenu.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
                <p className="text-slate-500 text-sm sm:text-base">
                  រកមិនឃើញមុខម្ហូបទេ
                </p>
              </div>
            ) : (
              <MenuItemGrid
                items={filteredMenu}
                tableTypeName={tableTypeName}
                orderId={orderId}
                orderData={orderData}
              />
            )}
          </div>
        </div>

        <OrderCartSidebar
          orderId={orderId}
          orderData={orderData}
          orderItems={orderItems}
          showSidebar={showSidebar}
          onCloseSidebar={() => setShowSidebar(false)}
        />
      </div>
    </div>
  );
}
