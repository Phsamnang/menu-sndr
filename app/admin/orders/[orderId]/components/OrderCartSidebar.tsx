"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  type OrderItem,
  type Order,
  orderService,
} from "@/services/order.service";
import OptimizedImage from "@/components/OptimizedImage";

interface OrderCartSidebarProps {
  orderId: string;
  orderData: Order | null;
  orderItems: OrderItem[];
  showSidebar?: boolean;
  onCloseSidebar?: () => void;
}

export default function OrderCartSidebar({
  orderId,
  orderData,
  orderItems,
  showSidebar = true,
  onCloseSidebar,
}: OrderCartSidebarProps) {
  const queryClient = useQueryClient();
  const isUpdatingDiscountRef = useRef(false);

  const [customerName, setCustomerName] = useState<string>("");
  const [discountType, setDiscountType] = useState<"percentage" | "amount">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [debouncedDiscountValue, setDebouncedDiscountValue] =
    useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");

  // Initialize state from orderData
  useEffect(() => {
    if (orderData) {
      setCustomerName((prev) => {
        const newName = orderData.customerName || "";
        return prev !== newName ? newName : prev;
      });
      setDiscountValue((prev) => {
        const newValue = orderData.discountValue || 0;
        return prev !== newValue ? newValue : prev;
      });
      if (orderData.discountType) {
        setDiscountType((prev) => {
          const newType = orderData.discountType as "percentage" | "amount";
          return prev !== newType ? newType : prev;
        });
      }
    }
  }, [orderData]);

  // Debounce discount value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDiscountValue(discountValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [discountValue]);

  // Mutations
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!orderId) {
        throw new Error("Order not found");
      }
      return orderService.deleteItem(orderId, itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderDetail", orderId] });
    },
  });

  const updateDiscountMutation = useMutation({
    mutationFn: async ({
      value,
      type,
    }: {
      value: number;
      type: "percentage" | "amount";
    }) => {
      if (!orderId) {
        throw new Error("Order not found");
      }
      return orderService.update(orderId, {
        discountType: value > 0 ? type : null,
        discountValue: value || 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderDetail", orderId] });
    },
  });

  const updateCustomerNameMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!orderId) {
        throw new Error("Order not found");
      }
      return orderService.update(orderId, {
        customerName: name || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderDetail", orderId] });
    },
  });

  const completePaymentMutation = useMutation({
    mutationFn: async () => {
      if (!orderId) {
        throw new Error("Order not found");
      }
      return orderService.update(orderId, {
        status: "completed",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderDetail", orderId] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
      toast.success("ការទូទាត់បានបញ្ចប់!");
      window.location.href = "/admin/orders";
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async () => {
      if (!orderId) {
        throw new Error("Order not found");
      }
      await orderService.delete(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
      toast.success("ការបញ្ជាទិញត្រូវបានលុប!");
      window.location.href = "/admin/orders";
    },
    onError: (error: any) => {
      toast.error(error?.message || "មានបញ្ហាក្នុងការលុបការបញ្ជាទិញ");
    },
  });

  // Update discount on server when debounced value changes
  useEffect(() => {
    if (
      orderData &&
      !isUpdatingDiscountRef.current &&
      !updateDiscountMutation.isPending &&
      debouncedDiscountValue !== (orderData.discountValue || 0)
    ) {
      isUpdatingDiscountRef.current = true;
      updateDiscountMutation.mutate(
        {
          value: debouncedDiscountValue,
          type: discountType,
        },
        {
          onSettled: () => {
            isUpdatingDiscountRef.current = false;
          },
        }
      );
    }
  }, [debouncedDiscountValue, discountType, orderData, updateDiscountMutation]);

  // Handler functions
  const removeFromCart = useCallback(
    (itemId: string) => {
      if (orderData?.status === "completed") {
        toast.error("ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ! មិនអាចលុបបានទេ");
        return;
      }
      const item = orderItems.find((i: OrderItem) => i.id === itemId);
      if (item && item.menuItem.isCook && item.status === "served") {
        toast.error("មិនអាចលុបមុខម្ហូបដែលត្រូវការចម្អិន និងបានដឹកជញ្ជូនរួចហើយ");
        return;
      }
      if (item) {
        toast.success(`លុប "${item.menuItem.name}" ចេញពីកន្ត្រក់`, { duration: 1500 });
      }
      deleteItemMutation.mutate(itemId);
    },
    [orderData?.status, orderItems, deleteItemMutation]
  );

  const handleDiscountChange = useCallback((value: number) => {
    setDiscountValue(value);
  }, []);

  const handleCustomerNameChange = useCallback(
    (name: string) => {
      setCustomerName(name);
      if (orderData) {
        updateCustomerNameMutation.mutate(name);
      }
    },
    [orderData, updateCustomerNameMutation]
  );

  const handlePlaceOrder = useCallback(() => {
    if (!orderItems || orderItems.length === 0) {
      toast.error("សូមបន្ថែមមុខម្ហូបទៅកន្ត្រក់");
      return;
    }

    if (orderData?.status === "completed") {
      toast.error("ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ!");
      return;
    }

    const total = orderData?.total || 0;
    const confirmMessage = `សូមបញ្ជាក់ការទូទាត់\nសរុប: ${total.toLocaleString(
      "km-KH"
    )}៛\n\nតើអ្នកចង់បញ្ចប់ការទូទាត់ទេ?`;
    if (confirm(confirmMessage)) {
      completePaymentMutation.mutate();
    }
  }, [
    orderItems,
    orderData?.status,
    orderData?.total,
    completePaymentMutation,
  ]);

  const handleFinishOrder = useCallback(() => {
    if (orderData?.status === "completed") {
      toast.error("ការបញ្ជាទិញនេះបានបញ្ចប់រួចរាល់ហើយ!");
      return;
    }

    const confirmMessage = "តើអ្នកចង់បញ្ចប់ការបញ្ជាទិញនេះទេ?";
    if (confirm(confirmMessage)) {
      cancelOrderMutation.mutate();
    }
  }, [orderData?.status, cancelOrderMutation]);

  const handleCancelOrder = useCallback(() => {
    if (orderData?.status === "completed") {
      toast.error("មិនអាចលុបការបញ្ជាទិញដែលបានបញ្ចប់រួចហើយ!");
      return;
    }

    const confirmMessage = "តើអ្នកចង់លុបការបញ្ជាទិញនេះទេ?";
    if (confirm(confirmMessage)) {
      cancelOrderMutation.mutate();
    }
  }, [orderData?.status, cancelOrderMutation]);

  const handlePrintInvoice = useCallback(async () => {
    const orderId = orderData?.id;
    if (!orderId) {
      toast.error("រកមិនឃើញការបញ្ជាទិញ");
      return;
    }
    try {
      const cacheBuster = Date.now();
      const imageUrl = `${window.location.origin}/api/admin/orders/${orderId}/invoice-image?t=${cacheBuster}`;
      const printUrl = `com.samathosoft.webprint://#imageurl#${imageUrl}#/imageurl#`;
      const link = document.createElement("a");
      link.href = printUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error printing invoice:", error);
      toast.error("មានបញ្ហាក្នុងការបោះពុម្ពវិក្កយបត្រ");
    }
  }, [orderData]);

  // Computed values
  const subtotal = useMemo(() => orderData?.subtotal || 0, [orderData]);

  const localDiscountAmount = useMemo(() => {
    if (discountValue <= 0) return 0;
    if (discountType === "percentage") {
      return (subtotal * discountValue) / 100;
    } else {
      return Math.min(discountValue, subtotal);
    }
  }, [discountValue, discountType, subtotal]);

  const discountAmount = useMemo(() => {
    if (
      orderData &&
      debouncedDiscountValue === (orderData.discountValue || 0)
    ) {
      return orderData.discountAmount || 0;
    }
    return localDiscountAmount;
  }, [orderData, debouncedDiscountValue, localDiscountAmount]);

  const total = useMemo(() => {
    return subtotal - discountAmount;
  }, [subtotal, discountAmount]);
  return (
    <>
      {/* Sidebar wrapper - visible on mobile and desktop */}
      <div
        className={`w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col relative h-full lg:h-screen`}
        style={{ touchAction: "pan-y" }}
      >
        <div className="p-2.5 xs:p-3 sm:p-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
            <h2 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-slate-800">
              ការបញ្ជាទិញ
            </h2>
            {onCloseSidebar && (
              <button
                onClick={onCloseSidebar}
                className="p-2 xs:p-2.5 text-slate-400 active:text-slate-600 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close sidebar"
              >
                <svg
                  className="w-5 h-5 xs:w-6 xs:h-6"
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
          <div className="space-y-2 xs:space-y-2.5 sm:space-y-3">
            <div>
              <label className="block text-[10px] xs:text-xs sm:text-xs font-medium text-slate-600 mb-1 xs:mb-1.5 sm:mb-1">
                ឈ្មោះអតិថិជន
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => handleCustomerNameChange(e.target.value)}
                placeholder="ឈ្មោះអតិថិជន..."
                className="w-full px-2.5 xs:px-3 sm:px-3 py-2 xs:py-2.5 sm:py-2.5 border border-slate-300 rounded-lg text-xs xs:text-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 min-h-[44px] touch-manipulation"
              />
            </div>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto p-2.5 xs:p-3 sm:p-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex justify-between items-center mb-2 xs:mb-3 sm:mb-4">
            <h3 className="font-semibold text-slate-800 text-xs xs:text-sm sm:text-base">មុខម្ហូប</h3>
          </div>

          {orderItems.length === 0 ? (
            <div className="text-center py-8 xs:py-10 md:py-12">
              <p className="text-slate-500 text-[10px] xs:text-xs sm:text-sm">កន្ត្រក់ទទេ</p>
            </div>
          ) : (
            <div className="space-y-2 xs:space-y-3 md:space-y-4">
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 rounded-lg p-2 xs:p-3 md:p-4 border border-slate-200 relative"
                  style={{ touchAction: "manipulation" }}
                >
                  <div className="flex gap-2 xs:gap-3 md:gap-4">
                    <div className="w-16 h-16 xs:w-20 xs:h-20 md:w-24 md:h-24 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                      {item.menuItem.image ? (
                        <OptimizedImage
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                          quality={75}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5 xs:gap-2 mb-1 xs:mb-1.5">
                        <h4 className="font-medium text-slate-900 text-[10px] xs:text-xs sm:text-sm md:text-base flex-1 min-w-0 line-clamp-2">
                          {item.menuItem.name}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.id);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                          }}
                          disabled={
                            deleteItemMutation.isPending ||
                            orderData?.status === "completed" ||
                            (item.menuItem.isCook && item.status === "served")
                          }
                          className="text-red-500 active:text-red-600 xs:hover:text-red-600 md:hover:text-red-600 text-xs xs:text-sm disabled:opacity-50 touch-manipulation p-1.5 xs:p-2 md:p-1 flex-shrink-0 min-w-[40px] min-h-[40px] xs:min-w-[44px] xs:min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg active:bg-red-50 xs:hover:bg-red-50 md:hover:bg-red-50 transition-colors"
                          style={{ touchAction: "manipulation" }}
                        >
                          <svg
                            className="w-4 h-4 xs:w-5 xs:h-5 md:w-5 md:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-1 xs:space-y-1.5">
                        {item.status && (
                          <div className="flex items-center justify-between gap-1.5 xs:gap-2">
                            <span className="text-[9px] xs:text-xs text-slate-600">
                              ស្ថានភាព:
                            </span>
                            <span
                              className={`text-[8px] xs:text-[10px] px-1.5 xs:px-2 py-0.5 rounded-full font-medium ${
                                item.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : item.status === "preparing"
                                  ? "badge-primary"
                                  : item.status === "ready"
                                  ? "bg-primary/10 text-primary"
                                  : item.status === "served"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {item.status === "pending"
                                ? "រង់ចាំ"
                                : item.status === "preparing"
                                ? "កំពុងរៀបចំ"
                                : item.status === "ready"
                                ? "រួចរាល់"
                                : item.status === "served"
                                ? "បានដឹកជញ្ជូន"
                                : item.status}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-1.5 xs:gap-2">
                          <span className="text-[9px] xs:text-xs sm:text-xs text-slate-600">
                            តម្លៃ:
                          </span>
                          <span className="text-[9px] xs:text-xs sm:text-xs text-slate-700 font-medium">
                            {item.unitPrice.toLocaleString("km-KH")}៛
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1.5 xs:gap-2">
                          <span className="text-[9px] xs:text-xs sm:text-xs text-slate-600">
                            ចំនួន:
                          </span>
                          <span className="text-[9px] xs:text-xs sm:text-xs font-medium text-slate-900">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1.5 xs:gap-2 pt-1 xs:pt-1.5 border-t border-slate-200">
                          <span className="text-xs xs:text-sm font-semibold text-slate-900">
                            សរុប:
                          </span>
                          <span className="text-sm xs:text-base font-bold text-orange-500">
                            {item.totalPrice.toLocaleString("km-KH")}៛
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 p-2.5 xs:p-3 sm:p-4 space-y-2 xs:space-y-3 sm:space-y-4 flex-shrink-0 bg-white">
          <div className="space-y-1.5 xs:space-y-2">
            <div className="flex justify-between text-[9px] xs:text-xs sm:text-sm">
              <span className="text-slate-600">សរុបមុនបញ្ចុះតម្លៃ:</span>
              <span className="font-medium text-slate-900">
                {subtotal.toLocaleString("km-KH")}៛
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[9px] xs:text-xs sm:text-sm text-green-600">
                <span>
                  បញ្ចុះតម្លៃ
                  {discountType === "percentage" ? ` (${discountValue}%)` : ""}:
                </span>
                <span className="font-medium">
                  -{discountAmount.toLocaleString("km-KH")}៛
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xs xs:text-sm sm:text-lg border-t-2 border-primary/30 pt-1.5 xs:pt-2">
              <span className="text-primary">
                សរុប:
              </span>
              <span className="text-primary text-sm xs:text-base sm:text-xl">
                {total.toLocaleString("km-KH")}៛
              </span>
            </div>
          </div>

          {orderData?.status === "completed" && (
            <div className="p-2 xs:p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-1.5 xs:gap-2">
                <svg
                  className="w-4 h-4 xs:w-5 xs:h-5 text-green-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-[10px] xs:text-xs sm:text-sm font-semibold text-green-800">
                  ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ
                </span>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-2.5 xs:p-3 sm:p-3 rounded-lg border border-slate-200">
            <label className="flex items-center gap-1.5 xs:gap-2 text-[9px] xs:text-xs sm:text-xs font-semibold text-slate-700 mb-1.5 xs:mb-2">
              <svg
                className="w-3 h-3 xs:w-4 xs:h-4 text-slate-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              បញ្ចុះតម្លៃ
            </label>
            <div className="flex gap-1.5 xs:gap-2 mb-1.5 xs:mb-2">
              <select
                value={discountType}
                onChange={(e) => {
                  setDiscountType(e.target.value as "percentage" | "amount");
                  setDiscountValue(0);
                }}
                disabled={orderData?.status === "completed"}
                className="px-2 xs:px-3 py-2 xs:py-2.5 border border-slate-300 rounded-lg text-xs xs:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed shadow-sm min-h-[40px] xs:min-h-[44px] touch-manipulation"
              >
                <option value="percentage">%</option>
                <option value="amount">៛</option>
              </select>
              <input
                type="number"
                min="0"
                max={discountType === "percentage" ? 100 : undefined}
                step={discountType === "percentage" ? "1" : "100"}
                value={discountValue || ""}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                  handleDiscountChange(val);
                }}
                placeholder="0"
                disabled={orderData?.status === "completed"}
                className="flex-1 px-2 xs:px-3 py-2 xs:py-2.5 border border-slate-300 rounded-lg text-xs xs:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed shadow-sm min-h-[40px] xs:min-h-[44px] touch-manipulation"
              />
            </div>
            {discountValue > 0 && (
              <div className="mt-1.5 xs:mt-2 pt-1.5 xs:pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-[8px] xs:text-[10px] sm:text-xs">
                  <span className="text-slate-600">បញ្ចុះតម្លៃ:</span>
                  <span className="font-semibold text-green-600">
                    -{discountAmount.toLocaleString("km-KH")}៛
                    {discountType === "percentage" && (
                      <span className="text-slate-500 ml-0.5 xs:ml-1">
                        ({discountValue}%)
                      </span>
                    )}
                  </span>
                </div>
                {discountValue !== debouncedDiscountValue && (
                  <div className="mt-0.5 xs:mt-1 flex items-center gap-0.5 xs:gap-1 text-[8px] xs:text-[10px] text-slate-500">
                    <svg
                      className="w-2.5 h-2.5 xs:w-3 xs:h-3 animate-spin flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>កំពុងរក្សាទុក...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[9px] xs:text-xs sm:text-xs font-medium text-slate-600 mb-1 xs:mb-1">
              វិធីសាស្ត្រទូទាត់
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={orderData?.status === "completed"}
              className="w-full px-2 xs:px-3 py-2 xs:py-2.5 border border-slate-300 rounded-lg text-xs xs:text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed min-h-[40px] xs:min-h-[44px] touch-manipulation"
            >
              <option value="cash">សាច់ប្រាក់</option>
              <option value="card">កាត</option>
              <option value="bank_transfer">ផ្ទេរប្រាក់</option>
            </select>
          </div>

          {total === 0 && orderData?.status !== "completed" ? (
            <div className="space-y-1.5 xs:space-y-2">
              <div className="p-2 xs:p-2.5 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-1.5 xs:mb-2">
                <p className="text-[9px] xs:text-xs sm:text-xs text-yellow-800 text-center">
                  សរុបគឺ 0៛ - អ្នកអាចបញ្ចប់ ឬលុបការបញ្ជាទិញ
                </p>
              </div>
              <div className="flex gap-1.5 xs:gap-2">
                <button
                  onClick={handleFinishOrder}
                  disabled={
                    orderData?.status === "completed" ||
                    cancelOrderMutation.isPending
                  }
                  className="flex-1 py-2 xs:py-3 sm:py-3 bg-primary text-white rounded-lg font-semibold active:bg-primary/80 xs:hover:bg-primary/90 md:hover:bg-primary/90 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed touch-manipulation text-[10px] xs:text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 xs:gap-2 min-h-[44px] xs:min-h-[48px] min-w-[44px]"
                >
                  <svg
                    className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {cancelOrderMutation.isPending
                    ? "កំពុង..."
                    : "បញ្ចប់"}
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={
                    orderData?.status === "completed" ||
                    cancelOrderMutation.isPending
                  }
                  className="flex-1 py-2 xs:py-3 sm:py-3 bg-red-600 text-white rounded-lg font-semibold active:bg-red-700 xs:hover:bg-red-700 md:hover:bg-red-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed touch-manipulation text-[10px] xs:text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 xs:gap-2"
                >
                  <svg
                    className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0"
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
                  {cancelOrderMutation.isPending
                    ? "កំពុង..."
                    : "លុប"}
                </button>
              </div>
              <button
                onClick={handlePrintInvoice}
                className="w-full mt-1.5 xs:mt-2 py-2 xs:py-3 sm:py-3 btn-primary rounded-lg font-semibold active:bg-primary/90 xs:hover:bg-primary/90 md:hover:bg-primary/90 touch-manipulation text-[10px] xs:text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 xs:gap-2"
              >
                <svg
                  className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0"
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
                <span className="inline">បោះពុម្ព</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2 xs:space-y-2 pb-4 xs:pb-6 sm:pb-0">
              {/* Mobile Print Button - Always visible on mobile */}
              <div className="md:hidden sticky bottom-0 left-0 right-0 bg-white pt-2">
                <button
                  onClick={handlePrintInvoice}
                  className="w-full py-3 xs:py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold active:bg-primary/80 touch-manipulation text-xs xs:text-sm flex items-center justify-center gap-1.5 xs:gap-2 min-h-[44px] xs:min-h-[48px] transition-colors"
                >
                  <svg
                    className="w-4 h-4 xs:w-5 xs:h-5 flex-shrink-0"
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
                  <span>បោះពុម្ព (ឆ្ពោះទៅគ្រប់គ្រង)</span>
                </button>
              </div>

              {/* Desktop buttons layout */}
              <div className="hidden md:flex gap-1.5 xs:gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="flex-1 py-2 xs:py-3 sm:py-3 btn-primary rounded-lg font-semibold active:bg-primary/90 xs:hover:bg-primary/90 touch-manipulation text-[10px] xs:text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 xs:gap-2"
                >
                  <svg
                    className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0"
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
                  <span className="inline">បោះពុម្ព</span>
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={
                    !orderItems ||
                    orderItems.length === 0 ||
                    orderData?.status === "completed" ||
                    completePaymentMutation.isPending
                  }
                  className="flex-1 py-2 xs:py-3 sm:py-3 btn-primary rounded-lg font-semibold active:bg-primary/90 xs:hover:bg-primary/90 md:hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-[10px] xs:text-xs sm:text-sm md:text-base flex items-center justify-center gap-0.5 xs:gap-2"
                >
                  {orderData?.status === "completed"
                    ? "បានបង់"
                    : completePaymentMutation.isPending
                    ? "កំពុង..."
                    : "ទូទាត់"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
