"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import OptimizedImage from "@/components/OptimizedImage";
import InvoicePrint from "@/components/InvoicePrint";
import { apiClientJson } from "@/utils/api-client";
import {
  orderService,
  type OrderItem,
  type Order,
} from "@/services/order.service";
import { shopInfoService } from "@/services/shop-info.service";
import CreateOrderModal from "./components/CreateOrderModal";
import ViewOrderModal from "./components/ViewOrderModal";
import CancelOrderModal from "./components/CancelOrderModal";
import {
  TableSelectionSkeleton,
  OrdersPageSkeleton,
  MenuGridSkeleton,
} from "./components/OrdersPageSkeleton";

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

export default function OrdersPage() {
  const router = useRouter();
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
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

  const { data: tables = [], isLoading: tablesLoading } = useQuery<TableItem[]>(
    {
      queryKey: ["tables"],
      queryFn: async () => {
        const result = await apiClientJson<TableItem[]>("/api/admin/tables");
        if (!result.success || !result.data) {
          throw new Error(result.error?.message || "Failed to fetch tables");
        }
        return result.data;
      },
    }
  );

  const { data: shopInfo } = useQuery({
    queryKey: ["shopInfo"],
    queryFn: () => shopInfoService.get(),
  });

  const { data: activeOrdersData } = useQuery<{ items: Order[] }>({
    queryKey: ["activeOrders"],
    queryFn: async () => {
      const result = await apiClientJson<{ items: Order[] }>(
        "/api/admin/orders?status=new&limit=100"
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

  const { data: orderData, refetch: refetchOrder } = useQuery<Order | null>({
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

  const orderItems = useMemo(() => orderData?.items || [], [orderData?.items]);

  // Sync customer name and discount from order data
  useEffect(() => {
    if (orderData) {
      setCurrentOrder(orderData);
      setCustomerName(orderData.customerName || "");
      setDiscountValue(orderData.discountValue || 0);
      if (orderData.discountType) {
        setDiscountType(orderData.discountType as "percentage" | "amount");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData?.id]);

  // Set current order when table is selected and has an active order
  useEffect(() => {
    if (selectedTable) {
      const tableOrders = ordersByTable[selectedTable.id] || [];
      const activeOrder = tableOrders.find(
        (o) => o.status === "new" || o.status === "on_process"
      );
      if (activeOrder && activeOrder.status !== "completed") {
        setCurrentOrder(activeOrder);
      }
    }
  }, [selectedTable, ordersByTable]);

  // Don't auto-open cart on mobile - let user control it
  // useEffect(() => {
  //   if (orderItems.length > 0 && window.innerWidth < 1024) {
  //     setShowCart(true);
  //   }
  // }, [orderItems.length]);

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
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
      router.push(`/admin/orders/${data.id}`);
    },
  });

  const handleTableSelect = useCallback(
    async (table: TableItem) => {
      // Check if table has an active order
      const tableOrders = ordersByTable[table.id] || [];
      const activeOrder = tableOrders.find(
        (o) => o.status === "new" || o.status === "on_process"
      );

      if (activeOrder && activeOrder.status !== "completed") {
        // Set current order and navigate to order detail page
        setCurrentOrder(activeOrder);
        router.push(`/admin/orders/${activeOrder.id}`);
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
    },
    [ordersByTable, router]
  );

  const handleConfirmViewOrder = useCallback(() => {
    if (!pendingTable || !pendingOrder) return;

    router.push(`/admin/orders/${pendingOrder.id}`);
    setShowViewOrderConfirm(false);
    setPendingTable(null);
    setPendingOrder(null);
  }, [pendingTable, pendingOrder, router]);

  const handleCancelViewOrder = useCallback(() => {
    setShowViewOrderConfirm(false);
    setPendingTable(null);
    setPendingOrder(null);
  }, []);

  const handleConfirmCreateOrder = useCallback(() => {
    if (!pendingTable) return;

    setShowCreateOrderConfirm(false);

    // Create new order - navigation happens in createOrderMutation.onSuccess
    createOrderMutation.mutate(pendingTable.id);
    setPendingTable(null);
  }, [pendingTable, createOrderMutation]);

  const handleCancelCreateOrder = useCallback(() => {
    setShowCreateOrderConfirm(false);
    setPendingTable(null);
  }, []);

  const handleClearTable = useCallback(() => {
    setSelectedTable(null);
    setCurrentOrder(null);
    setSelectedCategory(null);
    setSearchQuery("");
    setCustomerName("");
    setDiscountValue(0);
  }, []);

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

  const addToCart = useCallback(
    (item: MenuItem) => {
      if (!currentOrder) {
        toast.error("សូមជ្រើសរើសតុមុន");
        return;
      }
      if (orderData?.status === "completed") {
        toast.error(
          "ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ! មិនអាចបន្ថែមមុខម្ហូបបានទេ"
        );
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
    },
    [currentOrder, itemQuantities, orderData?.status, addItemMutation]
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

  const clearCart = useCallback(() => {
    if (orderData?.status === "completed") {
      toast.error("ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ! មិនអាចលុបបានទេ");
      return;
    }
    orderItems.forEach((item: OrderItem) => {
      deleteItemMutation.mutate(item.id);
    });
  }, [orderData?.status, orderItems, deleteItemMutation]);

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

  const handleDiscountChange = useCallback(
    (value: number) => {
      setDiscountValue(value);
      if (currentOrder) {
        updateDiscountMutation.mutate();
      }
    },
    [currentOrder, updateDiscountMutation]
  );

  const handleCustomerNameChange = useCallback(
    (name: string) => {
      setCustomerName(name);
      if (currentOrder) {
        updateCustomerNameMutation.mutate(name);
      }
    },
    [currentOrder, updateCustomerNameMutation]
  );

  const completePaymentMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrder?.id) {
        throw new Error("Order not found");
      }
      return orderService.update(currentOrder.id, {
        status: "completed",
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
    if (orderData.status === "completed") return false;
    return orderItems.length === 0 || total === 0;
  }, [orderData, orderItems.length, total]);

  const handleCancelOrder = useCallback(() => {
    if (!canCancelOrder) {
      toast.error("មិនអាចលុបការបញ្ជាទិញនេះបានទេ");
      return;
    }
    setShowCancelOrderConfirm(true);
  }, [canCancelOrder]);

  const handleConfirmCancelOrder = useCallback(() => {
    cancelOrderMutation.mutate();
    setShowCancelOrderConfirm(false);
  }, [cancelOrderMutation]);

  const handleCloseCancelOrderModal = useCallback(() => {
    setShowCancelOrderConfirm(false);
  }, []);

  const handlePlaceOrder = useCallback(() => {
    if (!orderItems || orderItems.length === 0) {
      toast.error("សូមបន្ថែមមុខម្ហូបទៅកន្ត្រក់");
      return;
    }

    if (orderData?.status === "completed") {
      toast.error("ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ!");
      return;
    }

    const confirmMessage = `សូមបញ្ជាក់ការទូទាត់\nសរុប: ${total.toLocaleString(
      "km-KH"
    )}៛\n\nតើអ្នកចង់បញ្ចប់ការទូទាត់ទេ?`;
    if (confirm(confirmMessage)) {
      completePaymentMutation.mutate();
    }
  }, [orderItems, orderData?.status, total, completePaymentMutation]);

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

  if (tablesLoading) {
    return <TableSelectionSkeleton />;
  }

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
                          <h3
                            className={`font-semibold mb-2 text-sm md:text-base ${
                              isAvailable ? "text-slate-900" : "text-slate-700"
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
