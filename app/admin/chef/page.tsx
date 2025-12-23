"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";

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

export default function ChefPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery<{ items: Order[] }>({
    queryKey: ["chefOrders", statusFilter],
    queryFn: async () => {
      const url = statusFilter
        ? `/api/chef/orders?status=${statusFilter}`
        : "/api/chef/orders";
      const res = await fetch(url);
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to fetch cook orders");
      }
      return result.data || { items: [] };
    },
    refetchInterval: 3000,
  });

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
      const res = await fetch(
        `/api/admin/orders/${orderId}/items/${itemId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(
          result.error?.message || "Failed to update item status"
        );
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chefOrders"] });
    },
  });

  const handleStatusChange = (
    orderId: string,
    itemId: string,
    newStatus: string
  ) => {
    updateStatusMutation.mutate({ orderId, itemId, status: newStatus });
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

  const groupedByStatus = allItems.reduce(
    (acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = [];
      }
      acc[item.status].push(item);
      return acc;
    },
    {} as Record<string, typeof allItems>
  );

  const filteredItems = statusFilter
    ? groupedByStatus[statusFilter] || []
    : allItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              ការបញ្ជាទិញសម្រាប់ចម្អិន
            </h1>
            <p className="text-slate-600">
              មើលនិងគ្រប់គ្រងមុខម្ហូបដែលត្រូវចម្អិន
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
          {["pending", "preparing", "ready"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                statusFilter === status
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {getStatusLabel(status)} (
              {groupedByStatus[status]?.length || 0})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-800"></div>
            <p className="text-slate-600 mt-4">កំពុងផ្ទុក...</p>
          </div>
        ) : filteredItems.length === 0 ? (
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
              មិនមានមុខម្ហូបដែលត្រូវចម្អិនទេ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <div className="flex gap-3 mb-3">
                    <div className="w-20 h-20 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                      {item.menuItem.image ? (
                        <OptimizedImage
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          width={80}
                          height={80}
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
                      <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">
                        {item.menuItem.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {item.menuItem.category.displayName}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-slate-600">ចំនួន:</span>
                        <span className="font-bold text-slate-900">
                          {item.quantity}
                        </span>
                      </div>
                      <div
                        className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 p-2 bg-slate-50 rounded">
                    <div className="text-xs text-slate-600 mb-1">
                      លេខការបញ្ជាទិញ: {item.order.orderNumber}
                    </div>
                    {item.order.table && (
                      <div className="text-xs text-slate-600">
                        តុ: {item.order.table.number} -{" "}
                        {item.order.table.tableType.displayName}
                      </div>
                    )}
                    {item.order.customerName && (
                      <div className="text-xs text-slate-600">
                        អតិថិជន: {item.order.customerName}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {item.status === "pending" && (
                      <button
                        onClick={() =>
                          handleStatusChange(item.order.id, item.id, "preparing")
                        }
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ចាប់ផ្តើមចម្អិន
                      </button>
                    )}
                    {item.status === "preparing" && (
                      <button
                        onClick={() =>
                          handleStatusChange(item.order.id, item.id, "ready")
                        }
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        បានចម្អិនរួច
                      </button>
                    )}
                    {item.status === "ready" && (
                      <button
                        onClick={() =>
                          handleStatusChange(item.order.id, item.id, "served")
                        }
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg font-medium text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        បានដឹក
                      </button>
                    )}
                    {(item.status === "pending" || item.status === "preparing") && (
                      <button
                        onClick={() =>
                          handleStatusChange(item.order.id, item.id, "cancelled")
                        }
                        disabled={updateStatusMutation.isPending}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        លុប
                      </button>
                    )}
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

