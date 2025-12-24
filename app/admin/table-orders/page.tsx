"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import OptimizedImage from "@/components/OptimizedImage";
import { tableService, TableItem } from "@/services/table.service";
import { orderService, Order } from "@/services/order.service";
import { menuService, MenuItem } from "@/services/menu.service";
import { categoryService, Category } from "@/services/category.service";

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

export default function TableOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {}
  );
  const queryClient = useQueryClient();

  const { data: tables = [], isLoading: tablesLoading } = useQuery<TableItem[]>(
    {
      queryKey: ["tables"],
      queryFn: () => tableService.getAll(),
    }
  );

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{
    items: Order[];
  }>({
    queryKey: ["activeOrders"],
    queryFn: () => orderService.getAll({ status: "new", limit: 1000 }),
  });

  const { data: orderDetails } = useQuery<Order | null>({
    queryKey: ["orderDetails", selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder?.id) return null;
      return orderService.getById(selectedOrder.id);
    },
    enabled: !!selectedOrder?.id,
  });

  const { data: menuData = [] } = useQuery<MenuItem[]>({
    queryKey: ["menu", selectedTable?.tableType.name],
    queryFn: () =>
      selectedTable?.tableType.name
        ? menuService.getAll({ tableType: selectedTable.tableType.name })
        : Promise.resolve([]),
    enabled: !!selectedTable?.tableType.name,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
  });

  const orders = ordersData?.items || [];
  const ordersByTable = orders.reduce((acc, order) => {
    if (order.tableId) {
      if (!acc[order.tableId]) {
        acc[order.tableId] = [];
      }
      acc[order.tableId].push(order);
    }
    return acc;
  }, {} as Record<string, Order[]>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-300";
      case "occupied":
        return "bg-red-100 text-red-800 border-red-300";
      case "reserved":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "maintenance":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getStatusLabel = (status: string) => {
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

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "on_process":
        return "bg-yellow-100 text-yellow-800";
      case "done":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "ថ្មី";
      case "on_process":
        return "កំពុងដំណើរការ";
      case "done":
        return "បានបញ្ចប់";
      case "cancelled":
        return "បានលុបចោល";
      default:
        return status;
    }
  };

  const addItemMutation = useMutation({
    mutationFn: async ({
      menuItemId,
      quantity,
    }: {
      menuItemId: string;
      quantity: number;
    }) => {
      if (!selectedOrder?.id) {
        throw new Error("Order not found");
      }
      return orderService.addItem(selectedOrder.id, { menuItemId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderDetails"] });
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
    },
  });

  const setItemQuantity = (itemId: string, quantity: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, quantity),
    }));
  };

  const handleAddToOrder = (item: MenuItem) => {
    const quantity = itemQuantities[item.id] || 1;
    addItemMutation.mutate({ menuItemId: item.id, quantity });
    // Reset quantity after adding
    setItemQuantities((prev) => {
      const newQty = { ...prev };
      delete newQty[item.id];
      return newQty;
    });
  };

  const updateItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      if (!selectedOrder?.id) {
        throw new Error("Order not found");
      }
      return orderService.updateItem(selectedOrder.id, { itemId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderDetails"] });
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!selectedOrder?.id) {
        throw new Error("Order not found");
      }
      return orderService.deleteItem(selectedOrder.id, itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderDetails"] });
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setSelectedOrder(data);
      if (selectedTable) {
        setSelectedTable({ ...selectedTable, status: "occupied" });
      }
    },
  });

  const handleOrderClick = (order: Order, table: TableItem) => {
    setSelectedOrder(order);
    setSelectedTable(table);
    setSelectedCategory(null);
    setSearchQuery("");
    setItemQuantities({});
  };

  const handleTableClick = (table: TableItem) => {
    const tableOrders = ordersByTable[table.id] || [];
    const hasActiveOrders = tableOrders.length > 0;

    if (hasActiveOrders && tableOrders.length > 0) {
      handleOrderClick(tableOrders[0], table);
    } else if (table.status === "available") {
      setSelectedTable(table);
      createOrderMutation.mutate(table.id);
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setSelectedTable(null);
  };

  const canAddItems = (order: Order) => {
    return order.status === "new" || order.status === "on_process";
  };

  const filteredMenu = menuData.filter((item) => {
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const categoriesList = Array.from(
    new Set(menuData.map((item) => item.category))
  );

  const currentOrder = orderDetails || selectedOrder;

  if (tablesLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-slate-800"></div>
            <p className="text-slate-600 mt-4">កំពុងផ្ទុក...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">ការបញ្ជាទិញតុ</h1>
          <Link
            href="/admin"
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            ត្រលប់
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => {
            const tableOrders = ordersByTable[table.id] || [];
            const hasActiveOrders = tableOrders.length > 0;

            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                  hasActiveOrders
                    ? "border-blue-400 bg-blue-50 cursor-pointer hover:shadow-xl transition-all"
                    : table.status === "available"
                    ? "border-green-400 bg-green-50 cursor-pointer hover:shadow-xl transition-all"
                    : getStatusColor(table.status)
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">
                      តុ {table.number}
                    </h3>
                    {table.name && (
                      <p className="text-sm text-slate-600">{table.name}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {table.tableType.displayName} • ចំនួន {table.capacity}{" "}
                      នាក់
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      table.status
                    )}`}
                  >
                    {getStatusLabel(table.status)}
                  </span>
                </div>

                {hasActiveOrders ? (
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-slate-700 mb-2">
                      ការបញ្ជាទិញសកម្ម ({tableOrders.length})
                    </div>
                    {tableOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order, table);
                        }}
                        className="bg-white rounded-lg p-3 border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-slate-600">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getOrderStatusColor(
                              order.status
                            )}`}
                          >
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </div>
                        {order.customerName && (
                          <p className="text-xs text-slate-600 mb-2">
                            {order.customerName}
                          </p>
                        )}
                        <div className="text-xs text-slate-500 mb-1">
                          {order.items.length} មុខម្ហូប
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-600">សរុប:</span>
                          <span className="text-sm font-bold text-slate-900">
                            {order.total.toLocaleString("km-KH")}៛
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-700">
                          សរុបទាំងអស់:
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {tableOrders
                            .reduce((sum, o) => sum + o.total, 0)
                            .toLocaleString("km-KH")}
                          ៛
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    {table.status === "available" ? (
                      <>
                        <svg
                          className="w-12 h-12 text-green-400 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <p className="text-sm font-medium text-green-700">
                          ចុចដើម្បីបង្កើតការបញ្ជាទិញ
                        </p>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-12 h-12 text-slate-300 mx-auto mb-2"
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
                        <p className="text-sm text-slate-500">
                          មិនមានការបញ្ជាទិញ
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {(currentOrder || createOrderMutation.isPending) && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {createOrderMutation.isPending
                      ? "កំពុងបង្កើតការបញ្ជាទិញ..."
                      : `ការបញ្ជាទិញ: ${currentOrder?.orderNumber || ""}`}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    តុ: {selectedTable.number} -{" "}
                    {selectedTable.tableType.displayName}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                >
                  បិទ
                </button>
              </div>
            </div>

            <div className="p-6">
              {createOrderMutation.isPending ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-slate-800"></div>
                  <p className="text-slate-600 mt-4">
                    កំពុងបង្កើតការបញ្ជាទិញ...
                  </p>
                </div>
              ) : currentOrder ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    {canAddItems(currentOrder) && (
                      <div className="mb-6">
                        <div className="mb-4 flex gap-4 items-center">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              placeholder="ស្វែងរកមុខម្ហូប..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full px-4 py-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                            />
                            <svg
                              className="absolute left-3 top-3.5 w-5 h-5 text-slate-400"
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

                        <div className="mb-4">
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            <button
                              onClick={() => setSelectedCategory(null)}
                              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all ${
                                selectedCategory === null
                                  ? "bg-slate-800 text-white"
                                  : "bg-white text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              ទាំងអស់
                            </button>
                            {categoriesList.map((catName) => {
                              const category = categories.find(
                                (c) => c.name === catName
                              );
                              return (
                                <button
                                  key={catName}
                                  onClick={() => setSelectedCategory(catName)}
                                  className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all ${
                                    selectedCategory === catName
                                      ? "bg-slate-800 text-white"
                                      : "bg-white text-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  {category?.displayName || catName}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                          {filteredMenu.map((item) => {
                            const price =
                              item.prices[selectedTable.tableType.name] || 0;
                            return (
                              <div
                                key={item.id}
                                className="bg-slate-50 rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                              >
                                <div className="relative h-32 bg-slate-100">
                                  {item.image ? (
                                    <OptimizedImage
                                      src={item.image}
                                      alt={item.name}
                                      width={150}
                                      height={128}
                                      className="w-full h-full object-cover"
                                      quality={85}
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
                                <div className="p-2">
                                  <h3 className="font-semibold text-slate-900 text-xs mb-1 line-clamp-2">
                                    {item.name}
                                  </h3>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-900">
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
                                      className="w-full px-2 py-1 text-center text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleAddToOrder(item)}
                                    disabled={
                                      price === 0 || addItemMutation.isPending
                                    }
                                    className="w-full px-2 py-1.5 bg-slate-800 text-white text-xs rounded-lg hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                                  >
                                    + បន្ថែម
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-4">
                        មុខម្ហូបក្នុងការបញ្ជាទិញ
                      </h3>
                      {currentOrder.items.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-lg">
                          <p className="text-slate-500">មិនមានមុខម្ហូប</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {currentOrder.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200"
                            >
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
                                      className="w-6 h-6 text-slate-300"
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
                                <h4 className="font-medium text-slate-900 text-sm">
                                  {item.menuItem.name}
                                </h4>
                                <p className="text-xs text-slate-600">
                                  {item.unitPrice.toLocaleString("km-KH")}៛
                                </p>
                              </div>
                              {canAddItems(currentOrder) && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      updateItemMutation.mutate({
                                        itemId: item.id,
                                        quantity: item.quantity - 1,
                                      })
                                    }
                                    disabled={
                                      updateItemMutation.isPending ||
                                      deleteItemMutation.isPending
                                    }
                                    className="w-6 h-6 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded text-slate-700 text-sm font-medium disabled:opacity-50"
                                  >
                                    −
                                  </button>
                                  <span className="w-8 text-center text-sm font-medium text-slate-900">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateItemMutation.mutate({
                                        itemId: item.id,
                                        quantity: item.quantity + 1,
                                      })
                                    }
                                    disabled={
                                      updateItemMutation.isPending ||
                                      addItemMutation.isPending
                                    }
                                    className="w-6 h-6 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded text-slate-700 text-sm font-medium disabled:opacity-50"
                                  >
                                    +
                                  </button>
                                  <button
                                    onClick={() =>
                                      deleteItemMutation.mutate(item.id)
                                    }
                                    disabled={deleteItemMutation.isPending}
                                    className="ml-2 text-red-500 hover:text-red-600 text-sm disabled:opacity-50"
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
                              )}
                              <div className="text-right">
                                <span className="text-sm font-bold text-slate-900">
                                  {item.totalPrice.toLocaleString("km-KH")}៛
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 sticky top-20">
                      <h3 className="font-bold text-slate-800 mb-4">សរុប</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            សរុបមុនបញ្ចុះតម្លៃ:
                          </span>
                          <span className="font-medium text-slate-900">
                            {currentOrder.subtotal.toLocaleString("km-KH")}៛
                          </span>
                        </div>
                        {currentOrder.discountAmount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>បញ្ចុះតម្លៃ:</span>
                            <span className="font-medium">
                              -
                              {currentOrder.discountAmount.toLocaleString(
                                "km-KH"
                              )}
                              ៛
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t border-slate-300 pt-2">
                          <span>សរុប:</span>
                          <span className="text-slate-900">
                            {currentOrder.total.toLocaleString("km-KH")}៛
                          </span>
                        </div>
                      </div>
                      <div className="mb-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                            currentOrder.status
                          )}`}
                        >
                          {getOrderStatusLabel(currentOrder.status)}
                        </span>
                      </div>
                      {currentOrder.customerName && (
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">អតិថិជន:</span>{" "}
                          {currentOrder.customerName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
