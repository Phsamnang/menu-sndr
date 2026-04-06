"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { apiClientJson } from "@/utils/api-client";
import { type Order } from "@/services/order.service";
import OrderCartSidebar from "./components/OrderCartSidebar";
import MenuItemGrid from "./components/MenuItemGrid";
import { FloatingCartButton } from "./components/FloatingCartButton";
import { CartBottomSheet } from "./components/CartBottomSheet";
import { type Category, type MenuItem } from "@/lib/types";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [showMobileCart, setShowMobileCart] = useState<boolean>(false);

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

  const subtotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [orderItems]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 xs:p-3 sm:p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-3 xs:p-4 sm:p-6">
            <div className="animate-pulse">
              <div className="h-6 xs:h-7 sm:h-8 bg-slate-200 rounded w-2/3 xs:w-1/2 sm:w-1/3 mb-2 xs:mb-3 sm:mb-4"></div>
              <div className="h-3 xs:h-4 bg-slate-200 rounded w-3/4 xs:w-2/3 sm:w-1/2 mb-4 xs:mb-6 sm:mb-8"></div>
              <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                <div className="h-14 xs:h-16 sm:h-20 bg-slate-200 rounded"></div>
                <div className="h-14 xs:h-16 sm:h-20 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 xs:p-3 sm:p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-3 xs:p-4 sm:p-6 text-center">
            <p className="text-slate-600 mb-4 text-xs xs:text-sm sm:text-base">មិនរកឃើញការបញ្ជាទិញ</p>
            <Link
              href="/admin/orders"
              className="px-4 py-2.5 xs:py-2.5 btn-primary rounded-lg text-xs xs:text-sm sm:text-base min-h-[44px] inline-flex items-center justify-center touch-manipulation"
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
      <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden">
        <div className="flex-1 p-2 xs:p-3 sm:p-4 md:p-6 w-full min-w-0 pb-6 lg:pb-6 lg:overflow-y-auto relative z-10">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col gap-2 xs:gap-3 sm:gap-2 sm:flex-row sm:justify-between sm:items-start mb-3 xs:mb-4 sm:mb-4 md:mb-6">
              <div className="flex-1 min-w-0 space-y-1 xs:space-y-2 sm:space-y-2">
                <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 break-words">
                  ការបញ្ជាទិញ #{orderData.orderNumber}
                </h1>
                {orderData.table && (
                  <div className="px-2 xs:px-3 py-1 xs:py-1.5 sm:py-1.5 btn-primary rounded-lg text-[10px] xs:text-xs sm:text-xs md:text-sm font-medium inline-block break-words">
                    តុ: {orderData.table.number} -{" "}
                    {orderData.table.tableType.displayName}
                  </div>
                )}
              </div>
              <div className="flex gap-1.5 xs:gap-2 flex-shrink-0 self-start sm:self-center lg:hidden">
                <Link
                  href="/admin/orders"
                  className="px-3 xs:px-4 py-2 xs:py-2.5 btn-primary rounded-lg text-xs xs:text-sm min-h-[44px] flex items-center justify-center touch-manipulation"
                >
                  ត្រលប់
                </Link>
              </div>
              <div className="hidden lg:flex gap-1.5 xs:gap-2 flex-shrink-0">
                <Link
                  href="/admin/orders"
                  className="px-3 xs:px-4 py-2 xs:py-2.5 btn-primary rounded-lg text-xs xs:text-sm min-h-[44px] flex items-center justify-center"
                >
                  ត្រលប់
                </Link>
              </div>
            </div>

            <div className="mb-3 xs:mb-4 sm:mb-4 md:mb-6 flex gap-1.5 xs:gap-2 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="ស្វែងរកមុខម្ហូប..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 xs:px-4 py-2 xs:py-3 sm:px-4 sm:py-2.5 md:py-3 pl-8 xs:pl-10 sm:pl-10 pr-10 text-xs xs:text-sm sm:text-sm md:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 min-h-[44px] touch-manipulation"
                />
                <svg
                  className="absolute left-2 xs:left-3 sm:left-3 top-2.5 xs:top-3 sm:top-3 md:top-3.5 w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-5 md:h-5 text-slate-400 pointer-events-none"
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
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 xs:right-3 sm:right-3 top-2.5 xs:top-3 sm:top-3 md:top-3.5 text-slate-400 hover:text-slate-600 touch-manipulation"
                    aria-label="Clear search"
                  >
                    <svg
                      className="w-4 h-4 xs:w-5 xs:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="mb-3 xs:mb-4 sm:mb-4 md:mb-6 sticky top-0 lg:relative bg-gradient-to-b from-slate-50 to-slate-50/80 backdrop-blur-sm z-20 -mx-2 xs:-mx-3 sm:mx-0 px-2 xs:px-3 sm:px-0 pt-2 -mt-2 pb-2">
              <div className="flex gap-1.5 xs:gap-2 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex-shrink-0 px-2 xs:px-3 sm:px-3 md:px-4 py-1.5 xs:py-2 sm:py-1.5 md:py-2 rounded-full text-[10px] xs:text-xs sm:text-sm md:text-base font-medium transition-all min-h-[38px] xs:min-h-[40px] sm:min-h-[40px] touch-manipulation whitespace-nowrap ${
                    selectedCategory === null
                      ? "btn-primary"
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
                      className={`flex-shrink-0 px-2 xs:px-3 sm:px-3 md:px-4 py-1.5 xs:py-2 sm:py-1.5 md:py-2 rounded-full text-[10px] xs:text-xs sm:text-sm md:text-base font-medium transition-all min-h-[38px] xs:min-h-[40px] sm:min-h-[40px] touch-manipulation whitespace-nowrap ${
                        selectedCategory === catName
                          ? "btn-primary"
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
              <div className="text-center py-8 xs:py-10 sm:py-12 text-xs xs:text-sm sm:text-base">
                កំពុងផ្ទុក...
              </div>
            ) : filteredMenu.length === 0 ? (
              <div className="text-center py-8 xs:py-10 sm:py-12 bg-white rounded-lg shadow-sm">
                <p className="text-slate-500 text-xs xs:text-sm sm:text-base">
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

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <OrderCartSidebar
            orderId={orderId}
            orderData={orderData}
            orderItems={orderItems}
            showSidebar={true}
            onCloseSidebar={() => {}}
          />
        </div>
      </div>

      {/* Floating cart button (mobile only) */}
      <FloatingCartButton
        itemCount={orderItems.length}
        subtotal={subtotal}
        onClick={() => setShowMobileCart(true)}
        isVisible={!showMobileCart}
      />

      {/* Mobile Print Button - Always visible on mobile */}
      <button
        onClick={() => {
          try {
            if (!orderData?.id) return;
            const cacheBuster = Date.now();
            const imageUrl = `${window.location.origin}/api/admin/orders/${orderData.id}/invoice-image?t=${cacheBuster}`;
            const printUrl = `com.samathosoft.webprint://#imageurl#${imageUrl}#/imageurl#`;
            const link = document.createElement("a");
            link.href = printUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (error) {
            console.error("Error printing invoice:", error);
          }
        }}
        className="fixed bottom-6 left-4 xs:left-6 lg:hidden z-40 touch-manipulation bg-primary hover:bg-primary/90 active:bg-primary/80 text-white rounded-full shadow-lg active:shadow-md transition-all p-4 xs:p-5 flex items-center justify-center gap-1.5 min-h-[56px] xs:min-h-[60px] min-w-[56px] xs:min-w-[60px]"
        aria-label="Print invoice"
        title="បោះពុម្ព (ឆ្ពោះទៅគ្រប់គ្រង)"
      >
        <svg
          className="w-6 h-6 xs:w-7 xs:h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
      </button>

      {/* Bottom sheet cart (mobile only) */}
      <CartBottomSheet
        isOpen={showMobileCart}
        onClose={() => setShowMobileCart(false)}
      >
        <OrderCartSidebar
          orderId={orderId}
          orderData={orderData}
          orderItems={orderItems}
          showSidebar={true}
          onCloseSidebar={() => setShowMobileCart(false)}
        />
      </CartBottomSheet>
    </div>
  );
}
