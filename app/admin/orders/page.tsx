"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import InvoicePrint from "@/components/InvoicePrint";

interface Category {
  id: string;
  name: string;
  displayName: string;
}

interface TableType {
  id: string;
  name: string;
  displayName: string;
  order: number;
}

interface TableItem {
  id: string;
  number: string;
  name: string | null;
  status: string;
  tableType: {
    id: string;
    name: string;
    displayName: string;
  };
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

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  menuItem: {
    id: string;
    name: string;
    image: string;
    category: {
      displayName: string;
    };
  };
}

interface Order {
  id: string;
  orderNumber: string;
  tableId: string | null;
  customerName: string | null;
  status: string;
  discountType: string | null;
  discountValue: number | null;
  subtotal: number;
  discountAmount: number;
  total: number;
  items: OrderItem[];
  createdAt?: string;
}

export default function OrdersPage() {
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {}
  );
  const [discountType, setDiscountType] = useState<"percentage" | "amount">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(10);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [showCart, setShowCart] = useState<boolean>(false);
  const [showInvoice, setShowInvoice] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const { data: menuData = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["menu", selectedTable?.tableType.name],
    queryFn: async () => {
      if (!selectedTable?.tableType.name) {
        return [];
      }
      const url = `/api/menu?tableType=${selectedTable.tableType.name}`;
      const response = await fetch(url);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to fetch menu");
      }
      return result.data || [];
    },
    enabled: !!selectedTable?.tableType.name,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to fetch categories");
      }
      return result.data || [];
    },
  });

  const { data: tables = [] } = useQuery<TableItem[]>({
    queryKey: ["tables"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tables");
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to fetch tables");
      }
      return result.data || [];
    },
  });

  const { data: activeOrdersData } = useQuery<{ items: Order[] }>({
    queryKey: ["activeOrders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders?status=new&limit=1000");
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { items: [] };
      }
      return result.data || { items: [] };
    },
    refetchInterval: 3000,
  });

  const ordersByTable = useMemo(() => {
    const activeOrders = activeOrdersData?.items || [];
    return activeOrders.reduce((acc, order) => {
      if (order.tableId) {
        if (!acc[order.tableId]) {
          acc[order.tableId] = [];
        }
        acc[order.tableId].push(order);
      }
      return acc;
    }, {} as Record<string, Order[]>);
  }, [activeOrdersData]);

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-400 text-green-800";
      case "occupied":
        return "bg-red-100 border-red-400 text-red-800";
      case "reserved":
        return "bg-yellow-100 border-yellow-400 text-yellow-800";
      case "maintenance":
        return "bg-gray-100 border-gray-400 text-gray-800";
      default:
        return "bg-slate-100 border-slate-400 text-slate-800";
    }
  };

  const getTableStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "អាចប្រើបាន";
      case "occupied":
        return "កំពុងប្រើ";
      case "reserved":
        return "កក់ទុក";
      case "maintenance":
        return "កំពុងជួសជុល";
      default:
        return status;
    }
  };

  const { data: orderData, refetch: refetchOrder } = useQuery<Order>({
    queryKey: ["currentOrder", currentOrder?.id],
    queryFn: async () => {
      if (!currentOrder?.id) return null;
      const res = await fetch(`/api/admin/orders/${currentOrder.id}`);
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to fetch order");
      }
      return result.data;
    },
    enabled: !!currentOrder?.id,
    refetchInterval: 2000,
  });

  const orderItems = orderData?.items || [];

  // Sync customer name and discount from order data
  useEffect(() => {
    if (orderData) {
      setCustomerName(orderData.customerName || "");
      setDiscountValue(orderData.discountValue || 0);
      if (orderData.discountType) {
        setDiscountType(orderData.discountType as "percentage" | "amount");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData?.id]);

  useEffect(() => {
    if (orderItems.length > 0 && window.innerWidth < 1024) {
      setShowCart(true);
    }
  }, [orderItems.length]);

  const filteredMenu = useMemo(() => {
    let filtered = menuData;

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [menuData, selectedCategory, searchQuery]);

  const categoriesList = useMemo(() => {
    return Array.from(new Set(menuData.map((item) => item.category)));
  }, [menuData]);

  const createOrderMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const orderNumber = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          customerName: null,
          items: [],
          discountType: null,
          discountValue: 0,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to create order");
      }
      return result.data;
    },
    onSuccess: (data) => {
      setCurrentOrder(data);
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  const handleTableSelect = async (table: TableItem) => {
    setSelectedTable(table);
    setSelectedCategory(null);
    setSearchQuery("");
    setCustomerName("");
    setDiscountValue(0);
    setItemQuantities({});

    // Check if table has an active order
    const tableOrders = ordersByTable[table.id] || [];
    const activeOrder = tableOrders.find(
      (o) => o.status === "new" || o.status === "on_process"
    );

    if (activeOrder) {
      // Load existing order
      setCurrentOrder(activeOrder);
    } else if (table.status === "available") {
      // Create new order for available table
      createOrderMutation.mutate(table.id);
    } else {
      // Table is not available and has no active order
      alert(`តុនេះមិនអាចប្រើបានទេ (${getTableStatusLabel(table.status)})`);
      setSelectedTable(null);
    }
  };

  const handleClearTable = () => {
    setSelectedTable(null);
    setCurrentOrder(null);
    setSelectedCategory(null);
    setSearchQuery("");
    setCustomerName("");
    setDiscountValue(0);
  };

  const addItemMutation = useMutation({
    mutationFn: async ({
      menuItemId,
      quantity,
    }: {
      menuItemId: string;
      quantity: number;
    }) => {
      if (!currentOrder?.id) {
        throw new Error("Order not found");
      }
      const res = await fetch(`/api/admin/orders/${currentOrder.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId,
          quantity,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to add item");
      }
      return result.data;
    },
    onSuccess: (data) => {
      setCurrentOrder(data);
      queryClient.invalidateQueries({ queryKey: ["currentOrder"] });
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
      if (!currentOrder?.id) {
        throw new Error("Order not found");
      }
      const res = await fetch(`/api/admin/orders/${currentOrder.id}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          quantity,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to update item");
      }
      return result.data;
    },
    onSuccess: (data) => {
      setCurrentOrder(data);
      queryClient.invalidateQueries({ queryKey: ["currentOrder"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!currentOrder?.id) {
        throw new Error("Order not found");
      }
      const res = await fetch(
        `/api/admin/orders/${currentOrder.id}/items?itemId=${itemId}`,
        {
          method: "DELETE",
        }
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to delete item");
      }
      return result.data;
    },
    onSuccess: (data) => {
      setCurrentOrder(data);
      queryClient.invalidateQueries({ queryKey: ["currentOrder"] });
    },
  });

  const setItemQuantity = (itemId: string, quantity: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, quantity),
    }));
  };

  const addToCart = (item: MenuItem) => {
    if (!currentOrder) {
      alert("សូមជ្រើសរើសតុមុន");
      return;
    }
    const quantity = itemQuantities[item.id] || 1;
    addItemMutation.mutate({ menuItemId: item.id, quantity });
    // Reset quantity after adding
    setItemQuantities((prev) => {
      const newQty = { ...prev };
      delete newQty[item.id];
      return newQty;
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const item = orderItems.find((i) => i.id === itemId);
    if (!item) return;
    const newQuantity = Math.max(0, item.quantity + delta);
    if (newQuantity === 0) {
      deleteItemMutation.mutate(itemId);
    } else {
      updateItemMutation.mutate({ itemId, quantity: newQuantity });
    }
  };

  const removeFromCart = (itemId: string) => {
    deleteItemMutation.mutate(itemId);
  };

  const clearCart = () => {
    orderItems.forEach((item) => {
      deleteItemMutation.mutate(item.id);
    });
  };

  const subtotal = useMemo(() => {
    return orderData?.subtotal || 0;
  }, [orderData]);

  const taxAmount = useMemo(() => {
    return (subtotal * taxRate) / 100;
  }, [subtotal, taxRate]);

  const updateDiscountMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrder?.id) {
        throw new Error("Order not found");
      }
      const res = await fetch(`/api/admin/orders/${currentOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discountType: discountValue > 0 ? discountType : null,
          discountValue: discountValue || 0,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to update discount");
      }
      return result.data;
    },
    onSuccess: (data) => {
      setCurrentOrder(data);
      queryClient.invalidateQueries({ queryKey: ["currentOrder"] });
    },
  });

  const updateCustomerNameMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!currentOrder?.id) {
        throw new Error("Order not found");
      }
      const res = await fetch(`/api/admin/orders/${currentOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name || null,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(
          result.error?.message || "Failed to update customer name"
        );
      }
      return result.data;
    },
    onSuccess: (data) => {
      setCurrentOrder(data);
    },
  });

  const discountAmount = useMemo(() => {
    return orderData?.discountAmount || 0;
  }, [orderData]);

  const total = useMemo(() => {
    return (orderData?.total || 0) + taxAmount;
  }, [orderData, taxAmount]);

  const handleDiscountChange = (value: number) => {
    setDiscountValue(value);
    if (currentOrder) {
      updateDiscountMutation.mutate();
    }
  };

  const handleCustomerNameChange = (name: string) => {
    setCustomerName(name);
    if (currentOrder) {
      updateCustomerNameMutation.mutate(name);
    }
  };

  const handlePlaceOrder = () => {
    if (!orderItems || orderItems.length === 0) {
      alert("សូមបន្ថែមមុខម្ហូបទៅកន្ត្រក់");
      return;
    }
    alert("ការបញ្ជាទិញត្រូវបានបង្កើតដោយជោគជ័យ!");
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const handlePrintInvoice = () => {
    if (!orderData || !orderItems || orderItems.length === 0) {
      alert("មិនមានការបញ្ជាទិញទេ");
      return;
    }
    setShowInvoice(true);
    setTimeout(() => {
      window.print();
      setShowInvoice(false);
    }, 100);
  };

  if (!selectedTable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              ជ្រើសរើសតុ
            </h1>
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm md:text-base w-full sm:w-auto text-center"
            >
              ត្រលប់
            </Link>
          </div>

          <div className="mb-6">
            <p className="text-slate-600 mb-4">
              សូមជ្រើសរើសតុដើម្បីចាប់ផ្តើមការបញ្ជាទិញ
            </p>
          </div>

          {tables.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <svg
                className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <p className="text-slate-500 text-base md:text-lg">មិនមានតុទេ</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {tables.map((table) => {
                const isAvailable = table.status === "available";
                const tableOrders = ordersByTable[table.id] || [];
                const hasActiveOrder = tableOrders.some(
                  (o) => o.status === "new" || o.status === "on_process"
                );
                const canSelect = isAvailable || hasActiveOrder;

                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableSelect(table)}
                    disabled={!canSelect && table.status === "maintenance"}
                    className={`rounded-lg shadow-md p-3 md:p-6 transition-all border-2 ${
                      canSelect || hasActiveOrder
                        ? "hover:shadow-xl cursor-pointer active:scale-95 md:hover:scale-105"
                        : table.status === "maintenance"
                        ? "opacity-75 cursor-not-allowed"
                        : "hover:shadow-xl cursor-pointer active:scale-95 md:hover:scale-105"
                    } ${getTableStatusColor(table.status)}`}
                  >
                    <div className="text-center">
                      <div
                        className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 text-lg md:text-2xl font-bold ${
                          isAvailable
                            ? "bg-slate-800 text-white"
                            : "bg-white text-slate-600"
                        }`}
                      >
                        {table.number}
                      </div>
                      <h3
                        className={`font-semibold mb-1 text-sm md:text-base ${
                          isAvailable ? "text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {table.name || `តុ ${table.number}`}
                      </h3>
                      <p
                        className={`text-xs md:text-sm mb-2 ${
                          isAvailable ? "text-slate-600" : "text-slate-500"
                        }`}
                      >
                        {table.tableType.displayName}
                      </p>
                      {hasActiveOrder && (
                        <div className="mb-2">
                          <span className="inline-block px-2 py-0.5 bg-blue-200 text-blue-800 rounded text-xs font-medium">
                            {
                              tableOrders.filter(
                                (o) =>
                                  o.status === "new" ||
                                  o.status === "on_process"
                              ).length
                            }{" "}
                            ការបញ្ជាទិញ
                          </span>
                        </div>
                      )}
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          isAvailable
                            ? "bg-green-200 text-green-800"
                            : table.status === "occupied"
                            ? "bg-red-200 text-red-800"
                            : table.status === "reserved"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {getTableStatusLabel(table.status)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {showCart && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowCart(false)}
        />
      )}
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <div className="w-full sm:w-auto">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 sm:mb-0">
                  ការបញ្ជាទិញ
                </h1>
                <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <div className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-medium text-center sm:text-left">
                    តុ: {selectedTable.number} -{" "}
                    {selectedTable.tableType.displayName}
                  </div>
                  <button
                    onClick={handleClearTable}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs sm:text-sm hover:bg-red-600 transition-colors"
                  >
                    ផ្លាស់ប្តូរតុ
                  </button>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowCart(!showCart)}
                  className="lg:hidden px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm flex items-center gap-2 flex-1 sm:flex-initial justify-center"
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  កន្ត្រក់ ({orderItems.length})
                </button>
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm flex-1 sm:flex-initial text-center"
                >
                  ត្រលប់
                </Link>
              </div>
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
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-slate-800"></div>
                <p className="text-slate-600 mt-4">កំពុងផ្ទុក...</p>
              </div>
            ) : filteredMenu.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <svg
                  className="w-16 h-16 text-slate-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-slate-500">រកមិនឃើញមុខម្ហូបទេ</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {filteredMenu.map((item) => {
                  const tableTypeName = selectedTable.tableType.name;
                  const price = item.prices[tableTypeName] || 0;

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
                          <span className="text-sm font-bold text-slate-900">
                            {price.toLocaleString("km-KH")}៛
                          </span>
                        </div>
                        <div className="mb-2">
                          <label className="block text-xs text-slate-600 mb-1">
                            ចំនួន
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={itemQuantities[item.id] || 1}
                            onChange={(e) =>
                              setItemQuantity(
                                item.id,
                                parseInt(e.target.value) || 1
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2 py-2 text-center text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                          />
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          disabled={price === 0 || addItemMutation.isPending}
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

        <div
          className={`fixed lg:static inset-x-0 bottom-0 lg:inset-auto lg:w-96 bg-white border-t lg:border-l border-slate-200 flex flex-col z-50 lg:z-auto transition-transform duration-300 ease-in-out ${
            showCart ? "translate-y-0" : "translate-y-full lg:translate-y-0"
          } lg:translate-y-0 max-h-[85vh] lg:max-h-none shadow-lg lg:shadow-none`}
        >
          <div className="p-4 border-b border-slate-200 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-slate-800">
                ការបញ្ជាទិញ
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="lg:hidden text-slate-400 active:text-slate-600"
              >
                <svg
                  className="w-6 h-6"
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
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  តុ
                </label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs sm:text-sm">
                  {selectedTable.number} - {selectedTable.tableType.displayName}
                </div>
              </div>
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
              {orderItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  លុបទាំងអស់
                </button>
              )}
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <svg
                  className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4"
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
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-200 rounded overflow-hidden flex-shrink-0">
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
                        <h4 className="font-medium text-slate-900 text-sm mb-1 truncate">
                          {item.menuItem.name}
                        </h4>
                        <p className="text-xs text-slate-600 mb-2">
                          {item.unitPrice.toLocaleString("km-KH")}៛
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">ចំនួន:</span>
                          <span className="text-sm font-medium text-slate-900">
                            {item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          disabled={deleteItemMutation.isPending}
                          className="text-red-500 active:text-red-600 md:hover:text-red-600 text-sm disabled:opacity-50 touch-manipulation p-1"
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
                        <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {item.totalPrice.toLocaleString("km-KH")}៛
                        </span>
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
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-slate-600">ពន្ធ ({taxRate}%):</span>
                <span className="font-medium text-slate-900">
                  {taxAmount.toLocaleString("km-KH")}៛
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
              <div className="flex justify-between font-bold text-base sm:text-lg border-t border-slate-200 pt-2">
                <span>សរុប:</span>
                <span className="text-slate-900">
                  {total.toLocaleString("km-KH")}៛
                </span>
              </div>
            </div>

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
                  className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
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
                  className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
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
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
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
                បោះពុម្ពវិក្កយបត្រ
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={!orderItems || orderItems.length === 0}
                className="flex-1 py-3 bg-slate-800 text-white rounded-lg font-semibold active:bg-slate-900 md:hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base"
              >
                បង្កើតការបញ្ជាទិញ
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
            selectedTable
              ? `${selectedTable.number} - ${selectedTable.tableType.displayName}`
              : undefined
          }
          taxRate={taxRate}
          taxAmount={taxAmount}
          paymentMethod={paymentMethod}
        />
      )}
    </div>
  );
}
