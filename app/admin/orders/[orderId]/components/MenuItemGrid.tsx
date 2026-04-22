"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import OptimizedImage from "@/components/OptimizedImage";
import { orderService, type Order } from "@/services/order.service";
import { type MenuItem } from "@/lib/types";

interface MenuItemGridProps {
  items: MenuItem[];
  tableTypeName?: string;
  orderId: string;
  orderData: Order | null;
}

export default function MenuItemGrid({
  items,
  tableTypeName,
  orderId,
  orderData,
}: MenuItemGridProps) {
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [adding, setAdding] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: async ({ menuItemId, quantity }: { menuItemId: string; quantity: number }) => {
      if (!orderId) throw new Error("Order not found");
      return orderService.addItem(orderId, { menuItemId, quantity });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orderDetail", orderId] });
      setQtys((prev) => { const n = { ...prev }; delete n[variables.menuItemId]; return n; });
    },
  });

  const getQty = (id: string) => qtys[id] ?? 1;

  const setQty = (id: string, val: number) => {
    setQtys((prev) => ({ ...prev, [id]: Math.max(1, val) }));
  };

  const addToCart = useCallback(
    (item: MenuItem) => {
      if (orderData?.status === "completed") {
        toast.error("ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ!");
        return;
      }
      const qty = getQty(item.id);
      setAdding(item.id);
      setTimeout(() => setAdding(null), 650);
      addItemMutation.mutate({ menuItemId: item.id, quantity: qty });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderData?.status, addItemMutation, qtys]
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
      {items.map((item) => {
        const price = tableTypeName ? item.prices[tableTypeName] || 0 : 0;
        const isDisabled = orderData?.status === "completed" || price === 0;
        const qty = getQty(item.id);
        const isAdding = adding === item.id;

        return (
          <div
            key={item.id}
            className={`bg-white rounded-xl overflow-hidden flex flex-col transition-all duration-200 ${
              isAdding
                ? "shadow-md -translate-y-0.5 ring-2 ring-green-400/60"
                : "shadow-sm hover:shadow-md hover:-translate-y-0.5"
            }`}
          >
            {/* Image — tap to add */}
            <button
              onClick={() => addToCart(item)}
              disabled={isDisabled || addItemMutation.isPending}
              className="group relative w-full aspect-[4/3] bg-slate-100 overflow-hidden block disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {item.image ? (
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  width={240}
                  height={180}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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

              {/* Centered + circle on hover */}
              {!isDisabled && !isAdding && (
                <div className="absolute inset-0 bg-black/[0.04] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/40 animate-pop-in">
                    +
                  </div>
                </div>
              )}

              {/* Adding flash feedback */}
              {isAdding && (
                <div className="absolute inset-0 bg-green-500/75 flex items-center justify-center animate-fade-overlay">
                  <div className="animate-check-pop">
                    <svg width="28" height="28" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>

            {/* Info + qty */}
            <div className="p-2.5 flex-1 flex flex-col gap-1.5">
              <div>
                <p className="text-xs font-semibold text-slate-700 line-clamp-2 leading-snug">
                  {item.name}
                </p>
                <p className="text-xs font-bold text-primary mt-0.5">
                  {price.toLocaleString("km-KH")}
                  <span className="text-[10px] font-semibold ml-0.5 text-primary/70">៛</span>
                </p>
              </div>

              {/* Qty stepper + add button */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex-1 h-[30px]">
                  <button
                    onClick={() => setQty(item.id, qty - 1)}
                    disabled={isDisabled || qty <= 1}
                    className="w-7 h-full flex items-center justify-center text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors touch-manipulation text-sm"
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
                    className="flex-1 h-full text-center text-xs font-bold text-slate-800 bg-transparent border-x border-slate-200 focus:outline-none focus:bg-white disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                  />
                  <button
                    onClick={() => setQty(item.id, qty + 1)}
                    disabled={isDisabled}
                    className="w-7 h-full flex items-center justify-center text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors touch-manipulation text-sm"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  disabled={isDisabled || addItemMutation.isPending}
                  className="w-[30px] h-[30px] flex items-center justify-center bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-all touch-manipulation flex-shrink-0 shadow-sm shadow-primary/30"
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
