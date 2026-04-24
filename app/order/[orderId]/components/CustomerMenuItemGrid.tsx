"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import OptimizedImage from "@/components/OptimizedImage";
import { type Order } from "@/services/order.service";
import { type MenuItem } from "@/lib/types";
import { apiClientJson } from "@/utils/api-client";

interface CustomerMenuItemGridProps {
  items: MenuItem[];
  tableTypeName?: string;
  orderId: string;
  orderData: Order | null;
  cartItemCounts: Record<string, number>;
  onItemAdded?: () => void;
}

export default function CustomerMenuItemGrid({
  items,
  tableTypeName,
  orderId,
  orderData,
  cartItemCounts,
  onItemAdded,
}: CustomerMenuItemGridProps) {
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [addingState, setAddingState] = useState<{ id: string; qty: number } | null>(null);
  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: async ({
      menuItemId,
      quantity,
    }: {
      menuItemId: string;
      quantity: number;
    }) => {
      if (!orderId) throw new Error("Order not found");
      const result = await apiClientJson<Order>(
        `/api/orders/${orderId}/items`,
        {
          method: "POST",
          data: { menuItemId, quantity },
          requireAuth: false,
        }
      );
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to add item");
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customerOrder", orderId] });
      setQtys((prev) => {
        const n = { ...prev };
        delete n[variables.menuItemId];
        return n;
      });
    },
  });

  const getQty = (id: string) => qtys[id] ?? 1;

  const setQty = (id: string, val: number) => {
    setQtys((prev) => ({ ...prev, [id]: Math.max(1, val) }));
  };

  const addToCart = useCallback(
    (item: MenuItem) => {
      if (orderData?.status === "completed") {
        toast.error("ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ! មិនអាចបន្ថែមមុខម្ហូបបានទេ");
        return;
      }
      const qty = getQty(item.id);
      setAddingState({ id: item.id, qty });
      setTimeout(() => setAddingState(null), 900);
      toast.success(`បានបន្ថែម "${item.name}" (${qty})`, { duration: 2000 });
      addItemMutation.mutate({ menuItemId: item.id, quantity: qty });
      onItemAdded?.();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderData?.status, addItemMutation, qtys, onItemAdded]
  );

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-400">
        <svg className="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">រកមិនឃើញមុខម្ហូបទេ</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-4">
      {items.map((item) => {
        const price = tableTypeName ? item.prices[tableTypeName] || 0 : 0;
        const isDisabled = orderData?.status === "completed" || price === 0;
        const qty = getQty(item.id);
        const inCartCount = cartItemCounts[item.id] ?? 0;
        const isAdding = addingState?.id === item.id;

        return (
          <div
            key={item.id}
            className={`relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
              isAdding ? "ring-2 ring-primary/60 scale-[1.02]" : ""
            } ${inCartCount > 0 ? "ring-1 ring-primary/30" : ""}`}
          >
            {/* In-cart qty badge */}
            {inCartCount > 0 && (
              <div
                key={inCartCount}
                className="absolute top-2 left-2 z-20 min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shadow-md animate-badge-pop pointer-events-none"
              >
                ×{inCartCount}
              </div>
            )}

            {/* Image — tap to add */}
            <button
              onClick={() => addToCart(item)}
              disabled={isDisabled || addItemMutation.isPending}
              className="group relative w-full aspect-[4/3] bg-slate-100 overflow-hidden block disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
            >
              {item.image ? (
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  width={240}
                  height={180}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-active:scale-110"
                  quality={80}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              {/* Quick confirmation check */}
              {isAdding && (
                <div className="absolute inset-0 bg-primary/30 flex items-center justify-center backdrop-blur-[1px] animate-fade-overlay">
                  <div className="w-11 h-11 rounded-full bg-white/95 flex items-center justify-center shadow-lg animate-check-pop">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
              {/* Hover pill */}
              {!isDisabled && !isAdding && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow">
                    +
                  </span>
                </div>
              )}
            </button>

            {/* Floating +N badge that rises up */}
            {isAdding && addingState && (
              <div
                key={`float-${addingState.id}-${addingState.qty}`}
                className="absolute left-1/2 top-[45%] z-30 px-2.5 py-1 rounded-full bg-primary text-white text-xs font-bold shadow-lg animate-float-up pointer-events-none whitespace-nowrap"
              >
                +{addingState.qty}
              </div>
            )}

            {/* Info + qty */}
            <div className="p-2.5 space-y-2">
              <div>
                <p className="text-xs font-medium text-slate-700 line-clamp-2 leading-snug min-h-[2.5em]">
                  {item.name}
                </p>
                <p className="text-xs font-bold text-primary mt-0.5">
                  {price.toLocaleString("km-KH")}៛
                </p>
              </div>

              {/* Qty row */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex-1">
                  <button
                    onClick={() => setQty(item.id, qty - 1)}
                    disabled={isDisabled || qty <= 1}
                    className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors touch-manipulation text-sm"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      if (!isNaN(v) && v >= 1) setQty(item.id, v);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    disabled={isDisabled}
                    className="flex-1 h-7 text-center text-xs font-semibold text-slate-800 bg-transparent border-x border-slate-200 focus:outline-none focus:bg-white disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setQty(item.id, qty + 1)}
                    disabled={isDisabled}
                    className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors touch-manipulation text-sm"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  disabled={isDisabled || addItemMutation.isPending}
                  className="w-7 h-7 flex items-center justify-center bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-90 transition-all touch-manipulation flex-shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
