"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import OptimizedImage from "@/components/OptimizedImage";
import InvoicePrint from "@/components/InvoicePrint";
import { apiClientJson } from "@/utils/api-client";
import { orderService } from "@/services/order.service";
import { shopInfoService } from "@/services/shop-info.service";
import CreateOrderModal from "./components/CreateOrderModal";
import ViewOrderModal from "./components/ViewOrderModal";
import CancelOrderModal from "./components/CancelOrderModal";

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
  const [itemQuantityInputs, setItemQuantityInputs] = useState<
    Record<string, string>
  >({});
  const [discountType, setDiscountType] = useState<"percentage" | "amount">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [showCart, setShowCart] = useState<boolean>(false);
  const [showInvoice, setShowInvoice] = useState<boolean>(false);
  const [showCreateOrderConfirm, setShowCreateOrderConfirm] =
    useState<boolean>(false);
  const [showViewOrderConfirm, setShowViewOrderConfirm] =
    useState<boolean>(false);
  const [showCancelOrderConfirm, setShowCancelOrderConfirm] =
    useState<boolean>(false);
  const [pendingTable, setPendingTable] = useState<TableItem | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  const { data: menuData = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["menu", selectedTable?.tableType.name],
    queryFn: async () => {
      if (!selectedTable?.tableType.name) {
        return [];
      }
      const url = `/api/menu?tableType=${selectedTable.tableType.name}`;
      const result = await apiClientJson<MenuItem[]>(url);
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to fetch menu");
      }
      return result.data;
    },
    enabled: !!selectedTable?.tableType.name,
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

  const { data: tables = [] } = useQuery<TableItem[]>({
    queryKey: ["tables"],
    queryFn: async () => {
      const result = await apiClientJson<TableItem[]>("/api/admin/tables");
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to fetch tables");
      }
      return result.data;
    },
  });

  const { data: shopInfo } = useQuery({
    queryKey: ["shopInfo"],
    queryFn: () => shopInfoService.get(),
  });

  const { data: activeOrdersData } = useQuery<{ items: Order[] }>({
    queryKey: ["activeOrders"],
    queryFn: async () => {
      const result = await apiClientJson<{ items: Order[] }>(
        "/api/admin/orders?status=new&limit=1000"
      );
      if (!result.success || !result.data) {
        return { items: [] };
      }
      return result.data;
    },
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

  const tablesByType = useMemo(() => {
    return tables.reduce((acc, table) => {
      const typeName = table.tableType.displayName;
      if (!acc[typeName]) {
        acc[typeName] = [];
      }
      acc[typeName].push(table);
      return acc;
    }, {} as Record<string, TableItem[]>);
  }, [tables]);

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
      const result = await apiClientJson<Order>(
        `/api/admin/orders/${currentOrder.id}`
      );
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to fetch order");
      }
      return result.data;
    },
    enabled: !!currentOrder?.id,
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
      return orderService.create({
        tableId,
        customerName: null,
        items: [],
        discountType: null,
        discountValue: 0,
      });
    },
    onSuccess: (data) => {
      setCurrentOrder(data);
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  const handleTableSelect = async (table: TableItem) => {
    // Check if table has an active order
    const tableOrders = ordersByTable[table.id] || [];
    const activeOrder = tableOrders.find(
      (o) => o.status === "new" || o.status === "on_process"
    );

    if (activeOrder && activeOrder.status !== "done") {
      // If table is occupied, load order directly without asking
      if (table.status === "occupied") {
        setSelectedTable(table);
        setSelectedCategory(null);
        setSearchQuery("");
        setCustomerName("");
        setDiscountValue(0);
        setItemQuantities({});
        setCurrentOrder(activeOrder);
      } else {
        // Show confirmation popup to view order details for other statuses
        setPendingTable(table);
        setPendingOrder(activeOrder);
        setShowViewOrderConfirm(true);
      }
    } else if (table.status === "available") {
      // Show confirmation popup before creating new order
      setPendingTable(table);
      setShowCreateOrderConfirm(true);
    } else {
      // Table is not available and has no active order
      toast.error(
        `តុនេះមិនអាចប្រើបានទេ (${getTableStatusLabel(table.status)})`
      );
    }
  };

  const handleConfirmViewOrder = () => {
    if (!pendingTable || !pendingOrder) return;

    setSelectedTable(pendingTable);
    setSelectedCategory(null);
    setSearchQuery("");
    setCustomerName("");
    setDiscountValue(0);
    setItemQuantities({});
    setCurrentOrder(pendingOrder);
    setShowViewOrderConfirm(false);
    setPendingTable(null);
    setPendingOrder(null);
  };

  const handleCancelViewOrder = () => {
    setShowViewOrderConfirm(false);
    setPendingTable(null);
    setPendingOrder(null);
  };

  const handleConfirmCreateOrder = () => {
    if (!pendingTable) return;

    setSelectedTable(pendingTable);
    setSelectedCategory(null);
    setSearchQuery("");
    setCustomerName("");
    setDiscountValue(0);
    setItemQuantities({});
    setShowCreateOrderConfirm(false);

    // Create new order
    createOrderMutation.mutate(pendingTable.id);
    setPendingTable(null);
  };

  const handleCancelCreateOrder = () => {
    setShowCreateOrderConfirm(false);
    setPendingTable(null);
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
      return orderService.addItem(currentOrder.id, { menuItemId, quantity });
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
      return orderService.updateItem(currentOrder.id, { itemId, quantity });
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
      return orderService.deleteItem(currentOrder.id, itemId);
    },
    onSuccess: (data) => {
      setCurrentOrder(data);
      queryClient.invalidateQueries({ queryKey: ["currentOrder"] });
    },
  });

  const setItemQuantity = (itemId: string, quantity: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: quantity > 0 ? quantity : 1,
    }));
  };

  const addToCart = (item: MenuItem) => {
    if (!currentOrder) {
      toast.error("សូមជ្រើសរើសតុមុន");
      return;
    }
    if (orderData?.status === "done") {
      toast.error("ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ! មិនអាចបន្ថែមមុខម្ហូបបានទេ");
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
    if (orderData?.status === "done") {
      toast.error("ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ! មិនអាចកែប្រែបានទេ");
      return;
    }
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
    if (orderData?.status === "done") {
      toast.error("ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ! មិនអាចលុបបានទេ");
      return;
    }
    deleteItemMutation.mutate(itemId);
  };

  const clearCart = () => {
    if (orderData?.status === "done") {
      toast.error("ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ! មិនអាចលុបបានទេ");
      return;
    }
    orderItems.forEach((item) => {
      deleteItemMutation.mutate(item.id);
    });
  };

  const subtotal = useMemo(() => {
    return orderData?.subtotal || 0;
  }, [orderData]);

  const updateDiscountMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrder?.id) {
        throw new Error("Order not found");
      }
      return orderService.update(currentOrder.id, {
        discountType: discountValue > 0 ? discountType : null,
        discountValue: discountValue || 0,
      });
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
      return orderService.update(currentOrder.id, {
        customerName: name || null,
      });
    },
    onSuccess: (data) => {
      setCurrentOrder(data);
    },
  });

  const discountAmount = useMemo(() => {
    return orderData?.discountAmount || 0;
  }, [orderData]);

  const total = useMemo(() => {
    return orderData?.total || 0;
  }, [orderData]);

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

  const completePaymentMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrder?.id) {
        throw new Error("Order not found");
      }
      return orderService.update(currentOrder.id, {
        status: "done",
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["currentOrder"] });
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
      toast.success("ការទូទាត់បានបញ្ចប់! តុត្រូវបានដំណើរការទៅជា 'អាចប្រើបាន'");
      handleClearTable();
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrder?.id) {
        throw new Error("Order not found");
      }
      await orderService.delete(currentOrder.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["currentOrder"] });
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
      toast.success(
        "ការបញ្ជាទិញត្រូវបានលុប! តុត្រូវបានដំណើរការទៅជា 'អាចប្រើបាន'"
      );
      handleClearTable();
    },
    onError: (error: any) => {
      toast.error(error?.message || "មានបញ្ហាក្នុងការលុបការបញ្ជាទិញ");
    },
  });

  const canCancelOrder = useMemo(() => {
    if (!orderData) return false;
    if (orderData.status === "done") return false;
    return orderItems.length === 0 || total === 0;
  }, [orderData, orderItems.length, total]);

  const handleCancelOrder = () => {
    if (!canCancelOrder) {
      toast.error("មិនអាចលុបការបញ្ជាទិញនេះបានទេ");
      return;
    }
    setShowCancelOrderConfirm(true);
  };

  const handleConfirmCancelOrder = () => {
    cancelOrderMutation.mutate();
    setShowCancelOrderConfirm(false);
  };

  const handleCancelCancelOrder = () => {
    setShowCancelOrderConfirm(false);
  };

  const handlePlaceOrder = () => {
    if (!orderItems || orderItems.length === 0) {
      toast.error("សូមបន្ថែមមុខម្ហូបទៅកន្ត្រក់");
      return;
    }

    if (orderData?.status === "done") {
      toast.error("ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ!");
      return;
    }

    const confirmMessage = `សូមបញ្ជាក់ការទូទាត់\nសរុប: ${total.toLocaleString(
      "km-KH"
    )}៛\n\nតើអ្នកចង់បញ្ចប់ការទូទាត់ទេ?`;
    if (confirm(confirmMessage)) {
      completePaymentMutation.mutate();
    }
  };

  const handlePrintInvoice = async () => {
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
            <div className="space-y-6">
              {Object.entries(tablesByType).map(([typeName, typeTables]) => (
                <div key={typeName} className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <div className="h-1 w-12 bg-gradient-to-r from-slate-800 to-slate-600 rounded-full"></div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                      {typeName}
                    </h2>
                    <div className="flex-1 h-1 bg-gradient-to-r from-slate-300 to-transparent rounded-full"></div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {typeTables.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {typeTables.map((table) => {
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
                          disabled={
                            !canSelect && table.status === "maintenance"
                          }
                          className={`rounded-lg shadow-md p-3 md:p-6 transition-all border-2 ${
                            canSelect || hasActiveOrder
                              ? "hover:shadow-xl cursor-pointer active:scale-95 md:hover:scale-105"
                              : table.status === "maintenance"
                              ? "opacity-75 cursor-not-allowed"
                              : "hover:shadow-xl cursor-pointer active:scale-95 md:hover:scale-105"
                          } ${getTableStatusColor(table.status)}`}
                        >
                          <div className="text-center">
                            <h3
                              className={`font-semibold mb-2 text-sm md:text-base ${
                                isAvailable
                                  ? "text-slate-900"
                                  : "text-slate-700"
                              }`}
                            >
                              {table.name || `តុ ${table.number}`}
                            </h3>
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
                </div>
              ))}
            </div>
          )}
        </div>

        <CreateOrderModal
          isOpen={showCreateOrderConfirm}
          table={pendingTable}
          isCreating={createOrderMutation.isPending}
          onConfirm={handleConfirmCreateOrder}
          onCancel={handleCancelCreateOrder}
        />

        <ViewOrderModal
          isOpen={showViewOrderConfirm}
          table={pendingTable}
          order={pendingOrder}
          onConfirm={handleConfirmViewOrder}
          onCancel={handleCancelViewOrder}
        />
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
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
                            orderData?.status === "done"
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
                  {selectedTable.name || selectedTable.number}
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
              {orderItems.length > 0 && orderData?.status !== "done" && (
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
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                      <div className="flex gap-2 md:gap-3 flex-1 min-w-0">
                        <div className="w-16 h-16 md:w-16 md:h-16 bg-slate-200 rounded overflow-hidden flex-shrink-0">
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
                                orderData?.status === "done"
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
                              <span className="text-xs sm:text-sm font-medium text-slate-900">
                                {item.quantity}
                              </span>
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

            {orderData?.status === "done" && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
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
                  disabled={orderData?.status === "done"}
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
                  disabled={orderData?.status === "done"}
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
                disabled={orderData?.status === "done"}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="cash">សាច់ប្រាក់</option>
                <option value="card">កាត</option>
                <option value="bank_transfer">ផ្ទេរប្រាក់</option>
              </select>
            </div>

            {canCancelOrder && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelOrderMutation.isPending}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold active:bg-red-700 md:hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base flex items-center justify-center gap-2 mb-2"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                {cancelOrderMutation.isPending
                  ? "កំពុងលុប..."
                  : "លុបការបញ្ជាទិញ"}
              </button>
            )}

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
                disabled={
                  !orderItems ||
                  orderItems.length === 0 ||
                  orderData?.status === "done" ||
                  completePaymentMutation.isPending
                }
                className="flex-1 py-3 bg-slate-800 text-white rounded-lg font-semibold active:bg-slate-900 md:hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base"
              >
                {orderData?.status === "done"
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
            selectedTable
              ? `${selectedTable.number} - ${selectedTable.tableType.displayName}`
              : undefined
          }
          paymentMethod={paymentMethod}
          shopInfo={shopInfo}
        />
      )}

      <CreateOrderModal
        isOpen={showCreateOrderConfirm}
        table={pendingTable}
        isCreating={createOrderMutation.isPending}
        onConfirm={handleConfirmCreateOrder}
        onCancel={handleCancelCreateOrder}
      />

      <ViewOrderModal
        isOpen={showViewOrderConfirm}
        table={pendingTable}
        order={pendingOrder}
        onConfirm={handleConfirmViewOrder}
        onCancel={handleCancelViewOrder}
      />

      <CancelOrderModal
        isOpen={showCancelOrderConfirm}
        table={selectedTable}
        orderNumber={orderData?.orderNumber || ""}
        isCancelling={cancelOrderMutation.isPending}
        onConfirm={handleConfirmCancelOrder}
        onCancel={handleCancelCancelOrder}
      />
    </div>
  );
}
