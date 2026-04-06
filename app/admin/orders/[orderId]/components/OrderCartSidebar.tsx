"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  type OrderItem,
  type Order,
  orderService,
} from "@/services/order.service";
import { paymentService } from "@/services/payment.service";
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
      return paymentService.create(orderId, {
        amount: orderData?.total || 0,
        method: paymentMethod,
        currency: "KHR",
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
  const [showDiscount, setShowDiscount] = useState(false);

  return (
    <>
      <div
        className="w-full lg:w-80 bg-white border-l border-slate-200 flex flex-col h-full"
        style={{ touchAction: "pan-y" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            {onCloseSidebar && (
              <button onClick={onCloseSidebar} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 touch-manipulation">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <h2 className="text-sm font-bold text-slate-800">ការបញ្ជាទិញ</h2>
          </div>
          {orderData?.table && (
            <span className="px-3 py-1 border border-slate-300 rounded-lg text-xs font-medium text-slate-700">
              តុ {orderData.table.number}
            </span>
          )}
        </div>

        {/* ── Customer name ── */}
        <div className="px-3 py-2.5 border-b border-slate-100 flex-shrink-0">
          <input
            type="text"
            value={customerName}
            onChange={(e) => handleCustomerNameChange(e.target.value)}
            placeholder="ឈ្មោះអតិថិជន..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-colors"
          />
        </div>

        {/* ── Items header ── */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 flex-shrink-0">
          <span className="text-xs font-semibold text-slate-700">មុខម្ហូប</span>
          {orderItems.length > 0 && orderData?.status !== "completed" && (
            <button
              onClick={() => orderItems.forEach((i) => removeFromCart(i.id))}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              លុបទាំងអស់
            </button>
          )}
        </div>

        {/* ── Scrollable items ── */}
        <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: "touch" }}>
          {orderItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
              <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-xs">កន្ត្រក់ទទេ</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {orderItems.map((item) => (
                <div key={item.id} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <div className="flex gap-2.5">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                      {item.menuItem.image ? (
                        <OptimizedImage
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          quality={70}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug flex-1">
                          {item.menuItem.name}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          disabled={
                            deleteItemMutation.isPending ||
                            orderData?.status === "completed" ||
                            (item.menuItem.isCook && item.status === "served")
                          }
                          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-500 disabled:opacity-30 transition-colors rounded touch-manipulation"
                        >
                          ×
                        </button>
                      </div>

                      {/* Status badge */}
                      {item.status && item.status !== "pending" && (
                        <span className={`inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-medium mb-1 ${
                          item.status === "preparing" ? "bg-primary/10 text-primary"
                          : item.status === "ready" ? "bg-primary/10 text-primary"
                          : item.status === "served" ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                        }`}>
                          {item.status === "preparing" ? "កំពុងរៀបចំ"
                            : item.status === "ready" ? "រួចរាល់"
                            : item.status === "served" ? "បានដឹក"
                            : item.status}
                        </span>
                      )}

                      {/* Price + qty row */}
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-primary">
                          {item.unitPrice.toLocaleString("km-KH")}៛
                        </p>
                        <span className="text-xs text-slate-500">x{item.quantity}</span>
                        <p className="text-xs font-bold text-slate-700">
                          {item.totalPrice.toLocaleString("km-KH")}៛
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-slate-200 p-3 space-y-2.5 flex-shrink-0 bg-white">

          {/* Summary */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>សរុបមុន</span>
              <span className="font-medium text-slate-700">{subtotal.toLocaleString("km-KH")}៛</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>បញ្ចុះតម្លៃ{discountType === "percentage" && discountValue > 0 ? ` (${discountValue}%)` : ""}</span>
              <span className={`font-medium ${discountAmount > 0 ? "text-red-500" : "text-slate-700"}`}>
                -{discountAmount.toLocaleString("km-KH")}៛
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>VAT (0%)</span>
              <span className="font-medium text-slate-700">0៛</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-slate-200">
              <span className="text-sm font-bold text-slate-800">សរុប</span>
              <span className="text-sm font-bold text-primary">{total.toLocaleString("km-KH")}៛</span>
            </div>
          </div>

          {/* Discount panel (collapsible) */}
          {showDiscount && (
            <div className="flex gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <select
                value={discountType}
                onChange={(e) => { setDiscountType(e.target.value as "percentage" | "amount"); setDiscountValue(0); }}
                disabled={orderData?.status === "completed"}
                className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              >
                <option value="percentage">%</option>
                <option value="amount">៛</option>
              </select>
              <input
                type="number"
                min="0"
                max={discountType === "percentage" ? 100 : undefined}
                value={discountValue || ""}
                onChange={(e) => handleDiscountChange(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                placeholder="0"
                disabled={orderData?.status === "completed"}
                className="flex-1 px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />
            </div>
          )}

          {/* Payment method */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={orderData?.status === "completed"}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 bg-white"
          >
            <option value="cash">💵 សាច់ប្រាក់</option>
            <option value="card">💳 កាត</option>
            <option value="bank_transfer">🏦 ផ្ទេរប្រាក់</option>
          </select>

          {orderData?.status === "completed" ? (
            /* Completed state */
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 py-2 bg-green-50 border border-green-200 rounded-lg">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold text-green-800">បង់ហើយ</span>
              </div>
              <button onClick={handlePrintInvoice}
                className="w-full py-2.5 btn-primary rounded-xl text-xs font-semibold flex items-center justify-center gap-2 touch-manipulation">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                បោះពុម្ព
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Hold / Discount / Print row */}
              <div className="flex gap-2">
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelOrderMutation.isPending}
                  className="flex-1 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 touch-manipulation transition-colors"
                >
                  លុប
                </button>
                <button
                  onClick={() => setShowDiscount((v) => !v)}
                  className={`flex-1 py-2 border rounded-xl text-xs font-medium touch-manipulation transition-colors ${
                    showDiscount
                      ? "border-primary/40 bg-primary/5 text-primary"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  បញ្ចុះតម្លៃ
                </button>
                <button
                  onClick={handlePrintInvoice}
                  className="flex-1 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 touch-manipulation transition-colors"
                >
                  បោះពុម្ព
                </button>
              </div>

              {/* Proceed Payment */}
              <button
                onClick={handlePlaceOrder}
                disabled={!orderItems || orderItems.length === 0 || completePaymentMutation.isPending}
                className="w-full py-3 btn-primary rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors"
              >
                {completePaymentMutation.isPending ? "កំពុង..." : "ទូទាត់ប្រាក់"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
