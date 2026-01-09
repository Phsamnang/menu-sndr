"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import OptimizedImage from "@/components/OptimizedImage";
import { apiClientJson } from "@/utils/api-client";
import {
  orderService,
  type OrderItem,
  type Order,
} from "@/services/order.service";
import OrderCartSidebar from "./components/OrderCartSidebar";

interface Category {
  id: string;
  name: string;
  displayName: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  prices: {
    [tableType: string]: number;
  };
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {}
  );
  const [itemQuantityInputs, setItemQuantityInputs] = useState<
    Record<string, string>
  >({});
  const [discountType, setDiscountType] = useState<"percentage" | "amount">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [debouncedDiscountValue, setDebouncedDiscountValue] =
    useState<number>(0);
  const [customerName, setCustomerName] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const queryClient = useQueryClient();

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
    if (orderData) {
      setCustomerName(orderData.customerName || "");
      setDiscountValue(orderData.discountValue || 0);
      if (orderData.discountType) {
        setDiscountType(orderData.discountType as "percentage" | "amount");
      }
    }
  }, [orderData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDiscountValue(discountValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [discountValue]);

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
      // Navigate back to orders page
      window.location.href = "/admin/orders";
    },
    onError: (error: any) => {
      toast.error(error?.message || "មានបញ្ហាក្នុងការលុបការបញ្ជាទិញ");
    },
  });

  const setItemQuantity = (itemId: string, quantity: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: quantity > 0 ? quantity : 1,
    }));
  };

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
      deleteItemMutation.mutate(itemId);
    },
    [orderData?.status, orderItems, deleteItemMutation]
  );

  const handleDiscountChange = useCallback((value: number) => {
    setDiscountValue(value);
  }, []);

  // Update discount on server when debounced value changes
  useEffect(() => {
    if (
      orderData &&
      debouncedDiscountValue !== (orderData.discountValue || 0)
    ) {
      updateDiscountMutation.mutate({
        value: debouncedDiscountValue,
        type: discountType,
      });
    }
  }, [debouncedDiscountValue, discountType, orderData, updateDiscountMutation]);

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
      completePaymentMutation.mutate();
    }
  }, [orderData?.status, completePaymentMutation]);

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
    if (!orderData || !orderItems || orderItems.length === 0) {
      toast.error("មិនមានការបញ្ជាទិញទេ");
      return;
    }
    try {
      const cacheBuster = Date.now();
      const imageUrl = `${window.location.origin}/api/admin/orders/${orderData.id}/invoice-image?t=${cacheBuster}`;
      const printUrl = `com.samathosoft.webprint://#imageurl#${imageUrl}#/imageurl#`;
      window.location.href = printUrl;
    } catch (error) {
      console.error("Error printing invoice:", error);
      toast.error("មានបញ្ហាក្នុងការបោះពុម្ពវិក្កយបត្រ");
    }
  }, [orderData, orderItems]);

  const subtotal = useMemo(() => orderData?.subtotal || 0, [orderData]);

  // Calculate discount locally for immediate feedback
  const localDiscountAmount = useMemo(() => {
    if (discountValue <= 0) return 0;
    if (discountType === "percentage") {
      return (subtotal * discountValue) / 100;
    } else {
      return Math.min(discountValue, subtotal);
    }
  }, [discountValue, discountType, subtotal]);

  // Use server value when available, otherwise use local calculation
  const discountAmount = useMemo(() => {
    // If discount value matches server and we have server data, use it
    if (
      orderData &&
      debouncedDiscountValue === (orderData.discountValue || 0)
    ) {
      return orderData.discountAmount || 0;
    }
    // Otherwise use local calculation for immediate feedback
    return localDiscountAmount;
  }, [orderData, debouncedDiscountValue, localDiscountAmount]);

  const total = useMemo(() => {
    return subtotal - discountAmount;
  }, [subtotal, discountAmount]);

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
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 w-full min-w-0">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 md:gap-3">
                {filteredMenu.map((item) => {
                  const price = tableTypeName
                    ? item.prices[tableTypeName] || 0
                    : 0;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden active:shadow-md md:hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-16 sm:h-20 md:h-24 bg-slate-100">
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
                              className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300"
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
                      <div className="p-1.5 sm:p-2">
                        <h3 className="font-semibold text-slate-900 mb-0.5 text-[11px] sm:text-xs line-clamp-2 leading-tight">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-[9px] sm:text-[10px] text-slate-600 mb-1 sm:mb-1.5 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                          <span className="text-[11px] sm:text-xs font-bold text-orange-500">
                            {price.toLocaleString("km-KH")}៛
                          </span>
                        </div>
                        <div className="mb-1 sm:mb-1.5">
                          <label className="block text-[9px] sm:text-[10px] text-slate-600 mb-0.5">
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
                              if (
                                value === "" ||
                                isNaN(numValue) ||
                                numValue < 1
                              ) {
                                const finalValue = 1;
                                setItemQuantities((prev) => ({
                                  ...prev,
                                  [item.id]: finalValue,
                                }));
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
                            className="w-full px-1 py-1 sm:px-1.5 text-center text-[11px] sm:text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 min-h-[32px] sm:min-h-[36px]"
                          />
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          disabled={
                            price === 0 ||
                            addItemMutation.isPending ||
                            orderData?.status === "completed"
                          }
                          className="w-full px-1.5 py-1.5 sm:px-2 sm:py-1.5 bg-slate-800 text-white text-[10px] sm:text-xs rounded-lg active:bg-slate-900 md:hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed touch-manipulation min-h-[36px] sm:min-h-[40px] font-medium"
                        >
                          + បន្ថែម
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <OrderCartSidebar
          orderData={orderData}
          orderItems={orderItems}
          customerName={customerName}
          discountType={discountType}
          discountValue={discountValue}
          debouncedDiscountValue={debouncedDiscountValue}
          discountAmount={discountAmount}
          subtotal={subtotal}
          total={total}
          paymentMethod={paymentMethod}
          deleteItemMutation={deleteItemMutation}
          handleCustomerNameChange={handleCustomerNameChange}
          handleDiscountChange={handleDiscountChange}
          setDiscountType={setDiscountType}
          setDiscountValue={setDiscountValue}
          setPaymentMethod={setPaymentMethod}
          removeFromCart={removeFromCart}
          handlePrintInvoice={handlePrintInvoice}
          handlePlaceOrder={handlePlaceOrder}
          handleFinishOrder={handleFinishOrder}
          handleCancelOrder={handleCancelOrder}
          completePaymentMutation={completePaymentMutation}
          cancelOrderMutation={cancelOrderMutation}
          showSidebar={showSidebar}
          onCloseSidebar={() => setShowSidebar(false)}
        />
      </div>
    </div>
  );
}
