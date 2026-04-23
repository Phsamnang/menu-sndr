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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "preparing":
        return "status-primary";
      case "ready":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "hidden"; // hide others
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
      default:
        return ""; // hide others
    }
  };

  const orders = ordersData?.items || [];

  // ✅ IMPORTANT: filter out served & cancelled
  const allItems = useMemo(
    () =>
      orders
        .flatMap((order) =>
          order.items.map((item) => ({ ...item, order }))
        )
        .filter(
          (item) =>
            item.status !== "served" && item.status !== "cancelled"
        ),
    [orders]
  );

  const groupedByStatus = useMemo(() => {
    return allItems.reduce((acc, item) => {
      if (!acc[item.status]) acc[item.status] = [];
      acc[item.status].push(item);
      return acc;
    }, {} as Record<string, typeof allItems>);
  }, [allItems]);

  const filteredItems = statusFilter
    ? groupedByStatus[statusFilter] || []
    : allItems;

  const columns = useMemo<ColumnDef<typeof filteredItems[number]>[]>(
    () => [
      {
        accessorKey: "menuItem",
        header: "រូបភាព",
        cell: (info) => {
          const menuItem = info.getValue() as OrderItem["menuItem"];
          return (
            <div className="w-16 h-16 bg-slate-100 rounded overflow-hidden">
              {menuItem.image ? (
                <OptimizedImage
                  src={menuItem.image}
                  alt={menuItem.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  No Image
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
                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">
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

          if (status === "served" || status === "cancelled") {
            return null;
          }

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
              disabled={updateStatusMutation.isPending}
              className="px-3 py-2 btn-primary rounded-lg font-medium text-sm disabled:opacity-50"
            >
              ដឹក
            </button>
          );
        },
      },
    ],
    [handleMarkServed]
  );

  const table = useReactTable({
    data: filteredItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 md:mb-6 flex justify-between items-start gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
              ការដឹកជញ្ជូន
            </h1>
            <p className="text-sm md:text-base text-slate-600">
              មើលនិងគ្រប់គ្រងមុខម្ហូបដែលរួចរាល់សម្រាប់ដឹក
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 md:mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-4 py-2 rounded text-sm ${statusFilter === null ? "bg-primary text-white" : "bg-white border"}`}
          >
            ទាំងអស់ ({allItems.length})
          </button>

          {["pending", "ready"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded text-sm ${statusFilter === status ? "bg-primary text-white" : "bg-white border"}`}
            >
              {getStatusLabel(status)} (
              {groupedByStatus[status]?.length || 0})
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <p className="text-center py-10">Loading...</p>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow text-slate-500">
            មិនមានមុខម្ហូបទេ
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow p-3 flex gap-3 items-center"
                >
                  <div className="w-14 h-14 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                    {item.menuItem.image ? (
                      <OptimizedImage
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm truncate">
                        {item.menuItem.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        x{item.quantity}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.order.table
                        ? `តុ ${item.order.table.number} - ${item.order.table.tableType.displayName}`
                        : "-"}{" "}
                      · {item.order.orderNumber}
                      {item.order.customerName && ` · ${item.order.customerName}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleMarkServed(item.order.id, item.id)}
                    disabled={updateStatusMutation.isPending}
                    className="px-3 py-2 btn-primary rounded-lg font-medium text-sm disabled:opacity-50 flex-shrink-0"
                  >
                    ដឹក
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded shadow overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((h) => (
                        <th key={h.id} className="p-3 text-left">
                          {flexRender(
                            h.column.columnDef.header,
                            h.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-t">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-3">
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
          </>
        )}
      </div>
    </div>
  );
}