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
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {}
  );
  const [itemQuantityInputs, setItemQuantityInputs] = useState<
    Record<string, string>
  >({});
  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: async ({
      menuItemId,
      quantity,
    }: {
      menuItemId: string;
      quantity: number;
    }) => {
      if (!orderId) {
        throw new Error("Order not found");
      }
      return orderService.addItem(orderId, { menuItemId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderDetail", orderId] });
    },
  });

  const setItemQuantity = useCallback((itemId: string, quantity: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: quantity > 0 ? quantity : 1,
    }));
  }, []);

  const addToCart = useCallback(
    (item: MenuItem) => {
      if (orderData?.status === "completed") {
        toast.error(
          "ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ! មិនអាចបន្ថែមមុខម្ហូបបានទេ"
        );
        return;
      }
      const quantity = itemQuantities[item.id] || 1;
      addItemMutation.mutate({ menuItemId: item.id, quantity });
      setItemQuantities((prev) => {
        const newQty = { ...prev };
        delete newQty[item.id];
        return newQty;
      });
    },
    [itemQuantities, orderData?.status, addItemMutation]
  );
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
        <p className="text-slate-500 text-sm sm:text-base">
          រកមិនឃើញមុខម្ហូបទេ
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 pb-4 w-full">
      {items.map((item) => {
        const price = tableTypeName ? item.prices[tableTypeName] || 0 : 0;
        return (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden active:shadow-md md:hover:shadow-md transition-shadow flex flex-col w-full"
          >
            <div className="relative h-20 sm:h-20 md:h-24 lg:h-28 bg-slate-100 flex-shrink-0">
              {item.image ? (
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  width={150}
                  height={120}
                  className="w-full h-full object-cover"
                  quality={85}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-slate-300"
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
            <div className="p-2 sm:p-2 md:p-2.5 flex-1 flex flex-col min-h-0">
              <h3 className="font-semibold text-slate-900 mb-1 sm:mb-1 text-xs sm:text-sm line-clamp-2 leading-tight min-h-[2.5em] flex-shrink-0">
                {item.name}
              </h3>
              <div className="flex items-center justify-between mb-1.5 sm:mb-1.5 flex-shrink-0">
                <span className="text-xs sm:text-sm font-bold text-orange-500">
                  {price.toLocaleString("km-KH")}៛
                </span>
              </div>
              <div className="mb-1.5 sm:mb-1.5 flex-shrink-0">
                <label className="block text-[10px] sm:text-xs text-slate-600 mb-0.5">
                  ចំនួន
                </label>
                <input
                  type="number"
                  value={
                    itemQuantityInputs[item.id] !== undefined
                      ? itemQuantityInputs[item.id]
                      : itemQuantities[item.id] || ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setItemQuantityInputs((prev) => ({
                      ...prev,
                      [item.id]: value,
                    }));
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    const numValue = parseInt(value, 10);
                    if (value === "" || isNaN(numValue) || numValue < 1) {
                      const finalValue = 1;
                      setItemQuantity(item.id, finalValue);
                      setItemQuantityInputs((prev) => {
                        const next = { ...prev };
                        delete next[item.id];
                        return next;
                      });
                    } else {
                      setItemQuantity(item.id, numValue);
                      setItemQuantityInputs((prev) => {
                        const next = { ...prev };
                        delete next[item.id];
                        return next;
                      });
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="1"
                  className="w-full px-1.5 sm:px-2 py-1.5 sm:py-2 text-center text-xs sm:text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 min-h-[36px] sm:min-h-[40px] touch-manipulation"
                />
              </div>
              <button
                onClick={() => addToCart(item)}
                disabled={
                  price === 0 ||
                  addItemMutation.isPending ||
                  orderData?.status === "completed"
                }
                className="w-full px-2 sm:px-2.5 py-1.5 sm:py-2 bg-slate-800 text-white text-xs sm:text-sm rounded-lg active:bg-slate-900 md:hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed touch-manipulation min-h-[36px] sm:min-h-[40px] font-medium flex-shrink-0 mt-auto"
              >
                + បន្ថែម
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
