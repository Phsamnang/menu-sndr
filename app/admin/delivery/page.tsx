"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { apiClientJson } from "@/utils/api-client";
import { getToken } from "@/utils/token";

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  menuItem: {
    id: string;
    name: string;
    image: string;
    isCook: boolean;
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
  createdAt: string;
  items: OrderItem[];
  table?: {
    id: string;
    number: string;
    name: string | null;
    tableType: {
      displayName: string;
    };
  };
}

export default function DeliveryPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [ordersData, setOrdersData] = useState<{ items: Order[] }>({
    items: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = getToken();
    const tokenParam = token ? `&token=${encodeURIComponent(token)}` : "";
    const url = statusFilter
      ? `/api/delivery/items/stream?status=${statusFilter}${tokenParam}`
      : `/api/delivery/items/stream${tokenParam ? `?${tokenParam.substring(1)}` : ""}`;

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          console.error("SSE error:", data.error);
        } else {
          setOrdersData(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
      setIsLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, [statusFilter]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      itemId,
      status,
    }: {
      orderId: string;
      itemId: string;
      status: string;
    }) => {
      const result = await apiClientJson(
        `/api/admin/orders/${orderId}/items/${itemId}/status`,
        {
          method: "PUT",
          data: { status },
        }
      );
      if (!result.success || !result.data) {
        throw new Error(
          result.error?.message || "Failed to update item status"
        );
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveryItems"] });
      queryClient.invalidateQueries({ queryKey: ["chefOrders"] });
    },
  });

  const handleMarkServed = (orderId: string, itemId: string) => {
    updateStatusMutation.mutate({ orderId, itemId, status: "served" });
  };

  const handleMarkAllServed = (orderId: string, itemIds: string[]) => {
    itemIds.forEach((itemId) => {
      updateStatusMutation.mutate({ orderId, itemId, status: "served" });
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "ready":
        return "bg-green-100 text-green-800 border-green-300";
      case "served":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "រង់ចាំ";
      case "preparing":
        return "កំពុងរៀបចំ";
      case "ready":
        return "រួចរាល់";
      case "served":
        return "បានដឹក";
      case "cancelled":
        return "បានលុប";
      default:
        return status;
    }
  };

  const orders = ordersData?.items || [];
  const allItems = orders.flatMap((order) =>
    order.items.map((item) => ({ ...item, order }))
  );

  const groupedByStatus = allItems.reduce((acc, item) => {
    if (!acc[item.status]) {
      acc[item.status] = [];
    }
    acc[item.status].push(item);
    return acc;
  }, {} as Record<string, typeof allItems>);

  const filteredItems = statusFilter
    ? groupedByStatus[statusFilter] || []
    : allItems;

  const ordersWithItems = orders.filter((order) => {
    if (statusFilter) {
      return order.items.some((item) => item.status === statusFilter);
    }
    return order.items.length > 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              ការដឹកជញ្ជូន
            </h1>
            <p className="text-slate-600">
              មើលនិងគ្រប់គ្រងមុខម្ហូបដែលរួចរាល់សម្រាប់ដឹក
            </p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm"
          >
            ត្រលប់
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              statusFilter === null
                ? "bg-slate-800 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            ទាំងអស់ ({allItems.length})
          </button>
          {["pending", "ready"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                statusFilter === status
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {getStatusLabel(status)} ({groupedByStatus[status]?.length || 0})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-800"></div>
            <p className="text-slate-600 mt-4">កំពុងផ្ទុក...</p>
          </div>
        ) : ordersWithItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
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
            <p className="text-slate-500 text-lg">
              មិនមានមុខម្ហូបដែលរួចរាល់សម្រាប់ដឹកទេ
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersWithItems.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden"
              >
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-lg">
                        លេខការបញ្ជាទិញ: {order.orderNumber}
                      </div>
                      {order.table && (
                        <div className="text-sm text-slate-600">
                          តុ: {order.table.number} -{" "}
                          {order.table.tableType.displayName}
                        </div>
                      )}
                      {order.customerName && (
                        <div className="text-sm text-slate-600">
                          អតិថិជន: {order.customerName}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        handleMarkAllServed(
                          order.id,
                          order.items.map((item) => item.id)
                        )
                      }
                      disabled={updateStatusMutation.isPending}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ដឹកទាំងអស់ ({order.items.length})
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-16 bg-slate-100 rounded overflow-hidden flex-shrink-0">
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
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-bold text-slate-900 text-sm truncate">
                                {item.menuItem.name}
                              </h3>
                              {item.menuItem.isCook && (
                                <span className="ml-2 px-1.5 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                                  🔥
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mb-1">
                              {item.menuItem.category.displayName}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-slate-600">
                                ចំនួន:
                              </span>
                              <span className="font-bold text-slate-900 text-sm">
                                {item.quantity}
                              </span>
                            </div>
                            <div
                              className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {getStatusLabel(item.status)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleMarkServed(order.id, item.id)}
                          disabled={
                            updateStatusMutation.isPending ||
                            item.status === "served"
                          }
                          className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {item.status === "served" ? "បានដឹក" : "ដឹក"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
