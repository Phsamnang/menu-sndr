"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
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
import { shopInfoService } from "@/services/shop-info.service";
import InvoicePrint from "@/components/InvoicePrint";

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
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const [showInvoice, setShowInvoice] = useState<boolean>(false);
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
  const [customerName, setCustomerName] = useState<string>("");
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

  const { data: shopInfo } = useQuery({
    queryKey: ["shopInfo"],
    queryFn: () => shopInfoService.get(),
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

  const updateItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      if (!orderId) {
        throw new Error("Order not found");
      }
      return orderService.updateItem(orderId, { itemId, quantity });
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
    mutationFn: async () => {
      if (!orderId) {
        throw new Error("Order not found");
      }
      return orderService.update(orderId, {
        discountType: discountValue > 0 ? discountType : null,
        discountValue: discountValue || 0,
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

  const updateQuantity = useCallback(
    (itemId: string, delta: number) => {
      if (orderData?.status === "completed") {
        toast.error("ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ! មិនអាចកែប្រែបានទេ");
        return;
      }
      const item = orderItems.find((i: OrderItem) => i.id === itemId);
      if (!item) return;
      const newQuantity = Math.max(0, item.quantity + delta);
      if (newQuantity === 0) {
        deleteItemMutation.mutate(itemId);
      } else {
        updateItemMutation.mutate({ itemId, quantity: newQuantity });
      }
    },
    [orderData?.status, orderItems, deleteItemMutation, updateItemMutation]
  );

  const handleDiscountChange = useCallback(
    (value: number) => {
      setDiscountValue(value);
      if (orderData) {
        updateDiscountMutation.mutate();
      }
    },
    [orderData, updateDiscountMutation]
  );

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
  const discountAmount = useMemo(
    () => orderData?.discountAmount || 0,
    [orderData]
  );
  const total = useMemo(() => orderData?.total || 0, [orderData]);

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
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                  ការបញ្ជាទិញ #{orderData.orderNumber}
                </h1>
                {orderData.table && (
                  <div className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-medium inline-block">
                    តុ: {orderData.table.number} -{" "}
                    {orderData.table.tableType.displayName}
                  </div>
                )}
              </div>
              <Link
                href="/admin/orders"
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm"
              >
                ត្រលប់
              </Link>
            </div>

            <div className="mb-4 md:mb-6 flex gap-2 md:gap-4 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="ស្វែងរកមុខម្ហូប..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 md:py-3 pl-10 text-sm md:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <svg
                  className="absolute left-3 top-2.5 md:top-3.5 w-4 h-4 md:w-5 md:h-5 text-slate-400"
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

            <div className="mb-4 md:mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex-shrink-0 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base font-medium transition-all ${
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
                      className={`flex-shrink-0 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base font-medium transition-all ${
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
              <div className="text-center py-12">កំពុងផ្ទុក...</div>
            ) : filteredMenu.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-slate-500">រកមិនឃើញមុខម្ហូបទេ</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                {filteredMenu.map((item) => {
                  const price = tableTypeName
                    ? item.prices[tableTypeName] || 0
                    : 0;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden active:shadow-md md:hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-32 md:h-40 bg-slate-100">
                        {item.image ? (
                          <OptimizedImage
                            src={item.image}
                            alt={item.name}
                            width={200}
                            height={160}
                            className="w-full h-full object-cover"
                            quality={85}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-12 h-12 text-slate-300"
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
                      <div className="p-3">
                        <h3 className="font-semibold text-slate-900 mb-1 text-sm line-clamp-2">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-orange-500">
                            {price.toLocaleString("km-KH")}៛
                          </span>
                        </div>
                        <div className="mb-2">
                          <label className="block text-xs text-slate-600 mb-1">
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
                            className="w-full px-2 py-2 text-center text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                          />
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          disabled={
                            price === 0 ||
                            addItemMutation.isPending ||
                            orderData?.status === "completed"
                          }
                          className="w-full px-3 py-2.5 bg-slate-800 text-white text-xs sm:text-sm rounded-lg active:bg-slate-900 md:hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed touch-manipulation"
                        >
                          + បន្ថែមទៅកន្ត្រក់
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-96 bg-white border-l border-slate-200 flex flex-col max-h-screen">
          <div className="p-4 border-b border-slate-200 flex-shrink-0">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4">
              ការបញ្ជាទិញ
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  ឈ្មោះអតិថិជន
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => handleCustomerNameChange(e.target.value)}
                  placeholder="ឈ្មោះអតិថិជន..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">មុខម្ហូប</h3>
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <p className="text-slate-500 text-xs sm:text-sm">កន្ត្រក់ទទេ</p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 rounded-lg p-2.5 md:p-3 border border-slate-200"
                  >
                    <div className="flex gap-2 md:gap-3">
                      <div className="w-16 h-16 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                        {item.menuItem.image ? (
                          <OptimizedImage
                            src={item.menuItem.image}
                            alt={item.menuItem.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            quality={75}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-slate-300"
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
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-slate-900 text-sm sm:text-base flex-1 min-w-0">
                            {item.menuItem.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            disabled={
                              deleteItemMutation.isPending ||
                              orderData?.status === "completed" ||
                              (item.menuItem.isCook && item.status === "served")
                            }
                            className="text-red-500 active:text-red-600 md:hover:text-red-600 text-sm disabled:opacity-50 touch-manipulation p-1 flex-shrink-0"
                          >
                            <svg
                              className="w-5 h-5"
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
                        <div className="space-y-1">
                          {item.status && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-slate-600">
                                ស្ថានភាព:
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  item.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : item.status === "preparing"
                                    ? "bg-blue-100 text-blue-800"
                                    : item.status === "ready"
                                    ? "bg-purple-100 text-purple-800"
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
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-slate-600">
                              តម្លៃ:
                            </span>
                            <span className="text-xs sm:text-sm text-slate-700 font-medium">
                              {item.unitPrice.toLocaleString("km-KH")}៛
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-slate-600">
                              ចំនួន:
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                disabled={
                                  orderData?.status === "completed" ||
                                  updateItemMutation.isPending
                                }
                                className="w-6 h-6 flex items-center justify-center bg-slate-200 rounded disabled:opacity-50"
                              >
                                -
                              </button>
                              <span className="text-xs sm:text-sm font-medium text-slate-900 w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                disabled={
                                  orderData?.status === "completed" ||
                                  updateItemMutation.isPending
                                }
                                className="w-6 h-6 flex items-center justify-center bg-slate-200 rounded disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
                            <span className="text-xs sm:text-sm font-semibold text-slate-900">
                              សរុប:
                            </span>
                            <span className="text-sm sm:text-base font-bold text-orange-500">
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

          <div className="border-t border-slate-200 p-4 space-y-4 flex-shrink-0 bg-white">
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-slate-600">សរុបមុនបញ្ចុះតម្លៃ:</span>
                <span className="font-medium text-slate-900">
                  {subtotal.toLocaleString("km-KH")}៛
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-green-600">
                  <span>
                    បញ្ចុះតម្លៃ
                    {discountType === "percentage"
                      ? ` (${discountValue}%)`
                      : ""}
                    :
                  </span>
                  <span className="font-medium">
                    -{discountAmount.toLocaleString("km-KH")}៛
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base sm:text-lg border-t-2 border-indigo-200 pt-2">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  សរុប:
                </span>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-lg sm:text-xl">
                  {total.toLocaleString("km-KH")}៛
                </span>
              </div>
            </div>

            {orderData?.status === "completed" && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-600"
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
                  <span className="text-sm font-semibold text-green-800">
                    ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                បញ្ចុះតម្លៃ
              </label>
              <div className="flex gap-2">
                <select
                  value={discountType}
                  onChange={(e) =>
                    setDiscountType(e.target.value as "percentage" | "amount")
                  }
                  disabled={orderData?.status === "completed"}
                  className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="percentage">%</option>
                  <option value="amount">៛</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step={discountType === "percentage" ? "1" : "100"}
                  value={discountValue}
                  onChange={(e) =>
                    handleDiscountChange(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  disabled={orderData?.status === "completed"}
                  className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                វិធីសាស្ត្រទូទាត់
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={orderData?.status === "completed"}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="cash">សាច់ប្រាក់</option>
                <option value="card">កាត</option>
                <option value="bank_transfer">ផ្ទេរប្រាក់</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrintInvoice}
                disabled={!orderItems || orderItems.length === 0}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold active:bg-blue-700 md:hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
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
                បោះពុម្ព
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={
                  !orderItems ||
                  orderItems.length === 0 ||
                  orderData?.status === "completed" ||
                  completePaymentMutation.isPending
                }
                className="flex-1 py-3 bg-slate-800 text-white rounded-lg font-semibold active:bg-slate-900 md:hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base"
              >
                {orderData?.status === "completed"
                  ? "បានបង់រួចរាល់"
                  : completePaymentMutation.isPending
                  ? "កំពុងដំណើរការ..."
                  : "បញ្ចប់ការទូទាត់"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showInvoice && orderData && (
        <InvoicePrint
          order={{
            ...orderData,
            createdAt: orderData.createdAt || new Date().toISOString(),
          }}
          tableName={
            orderData.table
              ? `${orderData.table.number} - ${orderData.table.tableType.displayName}`
              : undefined
          }
          paymentMethod={paymentMethod}
          shopInfo={shopInfo}
        />
      )}
    </div>
  );
}
