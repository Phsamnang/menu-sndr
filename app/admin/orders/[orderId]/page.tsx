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
      const result = await apiClientJson<MenuItem[]>(`/api/menu?tableType=${tableTypeName}`);
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
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
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
      <div className="h-full flex items-center justify-center bg-slate-100">
        <div className="animate-pulse text-slate-400 text-sm">កំពុងផ្ទុក...</div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-slate-600 mb-4 text-sm">មិនរកឃើញការបញ្ជាទិញ</p>
          <Link href="/admin/orders" className="px-4 py-2 btn-primary rounded-lg text-sm inline-flex items-center">
            ត្រលប់
          </Link>
        </div>
      </div>
    );
  }

  return (
    // h-full + overflow-hidden takes over height from the admin layout's scroll container
    // so each panel (grid left, cart right) scrolls independently
    <div className="h-full overflow-hidden flex flex-col lg:flex-row bg-slate-100">

      {/* ── Left panel ── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Top bar */}
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 flex items-center gap-2.5">
          <Link
            href="/admin/orders"
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <h1 className="text-sm sm:text-base font-bold text-slate-800 whitespace-nowrap">
              #{orderData.orderNumber}
            </h1>
            {orderData.table && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20 whitespace-nowrap">
                តុ {orderData.table.number} · {orderData.table.tableType.displayName}
              </span>
            )}
          </div>

          {/* Print — mobile only */}
          <button
            onClick={() => {
              if (!orderData?.id) return;
              const cacheBuster = Date.now();
              const imageUrl = `${window.location.origin}/api/admin/orders/${orderData.id}/invoice-image?t=${cacheBuster}`;
              const printUrl = `com.samathosoft.webprint://#imageurl#${imageUrl}#/imageurl#`;
              const link = document.createElement("a");
              link.href = printUrl;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="lg:hidden flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="flex-shrink-0 px-3 sm:px-4 pt-2.5 pb-2 bg-white border-b border-slate-100">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="ស្វែងរកមុខម្ហូប..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-100 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-colors touch-manipulation"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-3 sm:px-4 py-2">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors touch-manipulation border ${
                selectedCategory === null
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-slate-600 border-slate-300 hover:border-primary/40"
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
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors touch-manipulation border ${
                    selectedCategory === catName
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-slate-600 border-slate-300 hover:border-primary/40"
                  }`}
                >
                  {category?.displayName || catName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable grid — this is the only scrolling area on this panel */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
          {menuLoading ? (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl animate-pulse">
                  <div className="aspect-[4/3] bg-slate-200 rounded-t-xl" />
                  <div className="p-2 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-6 bg-slate-200 rounded" />
                    <div className="h-7 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMenu.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">រកមិនឃើញមុខម្ហូបទេ</p>
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

      {/* ── Right: cart sidebar (desktop) ── */}
      <div className="hidden lg:flex flex-col flex-shrink-0 min-h-0">
        <OrderCartSidebar
          orderId={orderId}
          orderData={orderData}
          orderItems={orderItems}
          showSidebar={true}
          onCloseSidebar={() => {}}
        />
      </div>

      {/* Mobile floating cart button */}
      <FloatingCartButton
        itemCount={orderItems.length}
        subtotal={subtotal}
        onClick={() => setShowMobileCart(true)}
        isVisible={!showMobileCart}
      />

      {/* Mobile cart bottom sheet */}
      <CartBottomSheet isOpen={showMobileCart} onClose={() => setShowMobileCart(false)}>
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
