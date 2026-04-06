"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { apiClientJson } from "@/utils/api-client";
import { useDeliveryStream } from "@/hooks/useDeliveryStream";
import { Order, OrderItem } from "@/lib/types";

export default function DeliveryPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { ordersData, isLoading } = useDeliveryStream(statusFilter);
  const queryClient = useQueryClient();

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

  const handleMarkServed = useCallback(
    (orderId: string, itemId: string) => {
      updateStatusMutation.mutate({ orderId, itemId, status: "served" });
    },
    [updateStatusMutation]
  );

  const handleMarkAllServed = useCallback(
    (orderId: string, itemIds: string[]) => {
      itemIds.forEach((itemId) => {
        updateStatusMutation.mutate({ orderId, itemId, status: "served" });
      });
    },
    [updateStatusMutation]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "preparing":
        return "status-primary";
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

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<typeof filteredItems[number]>[]>(
    () => [
      {
        accessorKey: "menuItem",
        header: "រូបភាព",
        cell: (info) => {
          const menuItem = info.getValue() as OrderItem["menuItem"];
          return (
            <div className="w-16 h-16 bg-slate-100 rounded overflow-hidden flex-shrink-0">
              {menuItem.image ? (
                <OptimizedImage
                  src={menuItem.image}
                  alt={menuItem.name}
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
          );
        },
      },
      {
        accessorKey: "menuItem",
        header: "មុខម្ហូប",
        cell: (info) => {
          const menuItem = info.getValue() as OrderItem["menuItem"];
          return (
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  {menuItem.name}
                </span>
                {menuItem.isCook && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                    🔥
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-600">
                {menuItem.category.displayName}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "quantity",
        header: "ចំនួន",
        cell: (info) => (
          <span className="font-bold text-slate-900">
            {info.getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "ស្ថានភាព",
        cell: (info) => {
          const status = info.getValue() as string;
          return (
            <div
              className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                status
              )}`}
            >
              {getStatusLabel(status)}
            </div>
          );
        },
      },
      {
        accessorKey: "order",
        header: "លេខការបញ្ជាទិញ",
        cell: (info) => {
          const order = info.getValue() as Order;
          return (
            <div className="text-sm font-medium text-slate-900">
              {order.orderNumber}
            </div>
          );
        },
      },
      {
        accessorKey: "order",
        header: "តុ",
        cell: (info) => {
          const order = info.getValue() as Order;
          return (
            <div className="text-sm text-slate-600">
              {order.table
                ? `តុ ${order.table.number} - ${order.table.tableType.displayName}`
                : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "order",
        header: "អតិថិជន",
        cell: (info) => {
          const order = info.getValue() as Order;
          return (
            <div className="text-sm text-slate-600">
              {order.customerName || "-"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "សកម្មភាព",
        cell: (info) => {
          const item = info.row.original;
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkServed(item.order.id, item.id);
              }}
              disabled={
                updateStatusMutation.isPending || item.status === "served"
              }
              className="px-3 py-2 btn-primary rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {item.status === "served" ? "បានដឹក" : "ដឹក"}
            </button>
          );
        },
      },
    ],
    [handleMarkServed, updateStatusMutation.isPending]
  );

  // Set up TanStack Table
  const table = useReactTable({
    data: filteredItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
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
              មិនមានមុខម្ហូបដែលរួចរាល់សម្រាប់ដឹកទេ
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 text-sm text-slate-900"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
